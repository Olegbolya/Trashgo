import { Hono } from 'hono';
import { eq, and, desc, gt, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { accessPlans, users, promoCodes } from '../db/schema.js';
import { authMiddleware, type JwtPayload } from '../middleware/auth.js';
import { getSubStatus, countActiveReferees, PLAN_PRICE, REFERRAL_DISCOUNT } from '../lib/subscriptionStatus.js';
import { notifyAdmin } from '../lib/telegram.js';
import { isYooKassaEnabled, createPayment, getPayment } from '../lib/yookassa.js';

const router = new Hono<{ Variables: { user: JwtPayload } }>();
router.use('*', authMiddleware);

// GET /access-plans/status
router.get('/status', async (c) => {
  const { userId } = c.get('user');

  const { status, expiresAt, trialEnd } = await getSubStatus(userId);
  const activeReferrals = await countActiveReferees(userId);
  const discountAmount = activeReferrals * REFERRAL_DISCOUNT;
  const nextPrice = Math.max(0, PLAN_PRICE - discountAmount);

  const hasPending = (await db.select({ id: accessPlans.id })
    .from(accessPlans)
    .where(and(eq(accessPlans.userId, userId), eq(accessPlans.status, 'pending')))
    .limit(1)).length > 0;

  return c.json({ data: {
    status,
    expiresAt: expiresAt?.toISOString() ?? null,
    trialEndsAt: trialEnd.toISOString(),
    activeReferrals,
    discountAmount,
    nextPrice,
    hasPendingRequest: hasPending,
    yookassaEnabled: isYooKassaEnabled(),
  } });
});

// GET /access-plans/history
router.get('/history', async (c) => {
  const { userId } = c.get('user');

  const history = await db.select()
    .from(accessPlans)
    .where(eq(accessPlans.userId, userId))
    .orderBy(desc(accessPlans.createdAt))
    .limit(20);

  return c.json({ data: history.map(p => ({
    id: p.id,
    status: p.status,
    priceAtPurchase: p.priceAtPurchase,
    paymentRef: p.paymentRef,
    startsAt: p.startsAt?.toISOString() ?? null,
    expiresAt: p.expiresAt?.toISOString() ?? null,
    confirmedAt: p.confirmedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  })) });
});

// POST /access-plans/request — create payment (YooKassa if configured, else manual)
router.post('/request', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const paymentRef = typeof body.paymentRef === 'string' ? body.paymentRef.trim().slice(0, 200) : null;
  const promoCodeInput = typeof body.promoCode === 'string' ? body.promoCode.trim().toUpperCase().slice(0, 50) : null;

  const existing = await db.select({ id: accessPlans.id })
    .from(accessPlans)
    .where(and(eq(accessPlans.userId, userId), eq(accessPlans.status, 'pending')))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: { code: 'ALREADY_PENDING', message: 'У вас уже есть ожидающий запрос на активацию' } }, 409);
  }

  const activeReferrals = await countActiveReferees(userId);
  let priceAtPurchase = Math.max(0, PLAN_PRICE - activeReferrals * REFERRAL_DISCOUNT);
  let promoDiscount = 0;
  let validPromoCode: string | null = null;

  if (promoCodeInput) {
    const [promo] = await db.select().from(promoCodes)
      .where(eq(promoCodes.code, promoCodeInput))
      .limit(1);
    if (!promo) return c.json({ error: { code: 'INVALID_PROMO', message: 'Промокод не найден' } }, 400);
    if (promo.expiresAt && promo.expiresAt < new Date()) return c.json({ error: { code: 'PROMO_EXPIRED', message: 'Промокод истёк' } }, 400);
    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) return c.json({ error: { code: 'PROMO_EXHAUSTED', message: 'Промокод исчерпан' } }, 400);
    promoDiscount = promo.discountAmount;
    validPromoCode = promo.code;
    priceAtPurchase = Math.max(0, priceAtPurchase - promoDiscount);
    await db.execute(sql`UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ${promo.id}`);
  }

  const [plan] = await db.insert(accessPlans).values({
    userId,
    status: 'pending',
    priceAtPurchase,
    discountApplied: (activeReferrals * REFERRAL_DISCOUNT) + promoDiscount,
    ...(paymentRef ? { paymentRef } : {}),
    ...(validPromoCode ? { promoCode: validPromoCode } : {}),
  }).returning();

  // If price is 0 (full discount), auto-activate
  if (priceAtPurchase === 0) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await db.update(accessPlans).set({
      status: 'active',
      startsAt: now,
      expiresAt,
      confirmedAt: now,
    }).where(eq(accessPlans.id, plan.id));
    return c.json({ data: { id: plan.id, status: 'active', priceAtPurchase: 0, expiresAt: expiresAt.toISOString() } }, 201);
  }

  // YooKassa payment
  if (isYooKassaEnabled()) {
    try {
      const returnUrl = `${process.env.FRONTEND_URL ?? 'https://trashgo.pro'}/subscription?payment=success&plan=${plan.id}`;
      const payment = await createPayment(
        priceAtPurchase,
        `Абонемент TrashGo на 30 дней`,
        returnUrl,
        { planId: plan.id, userId },
      );
      // Store YooKassa payment ID in paymentRef
      await db.update(accessPlans).set({ paymentRef: payment.id }).where(eq(accessPlans.id, plan.id));
      return c.json({ data: {
        id: plan.id,
        priceAtPurchase: plan.priceAtPurchase,
        status: 'pending',
        paymentUrl: payment.confirmation?.confirmation_url ?? null,
        createdAt: plan.createdAt.toISOString(),
      } }, 201);
    } catch (e: any) {
      console.error('[YooKassa] createPayment error:', e?.message);
      // Fall through to manual flow
    }
  }

  // Manual flow (no YooKassa configured or payment creation failed)
  const [userRow] = await db.select({ name: users.name, phone: users.phone }).from(users).where(eq(users.id, userId)).limit(1);
  notifyAdmin(
    `💳 Новый запрос на абонемент\n` +
    `Пользователь: ${userRow?.name ?? '—'}\n` +
    `Сумма: ${priceAtPurchase}₽\n` +
    (validPromoCode ? `Промокод: ${validPromoCode} (−${promoDiscount}₽)\n` : '') +
    (paymentRef ? `Реквизит: ${paymentRef}\n` : '') +
    `Подтвердите в /admin → Абонементы`
  ).catch(() => {});

  return c.json({ data: {
    id: plan.id,
    priceAtPurchase: plan.priceAtPurchase,
    discountApplied: plan.discountApplied,
    promoCode: plan.promoCode ?? null,
    status: 'pending',
    paymentUrl: null,
    createdAt: plan.createdAt.toISOString(),
  } }, 201);
});

// GET /access-plans/promo-check/:code
router.get('/promo-check/:code', async (c) => {
  const code = c.req.param('code').toUpperCase().trim();
  const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
  if (!promo) return c.json({ error: { code: 'INVALID_PROMO', message: 'Промокод не найден' } }, 404);
  if (promo.expiresAt && promo.expiresAt < new Date()) return c.json({ error: { code: 'PROMO_EXPIRED', message: 'Промокод истёк' } }, 400);
  if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) return c.json({ error: { code: 'PROMO_EXHAUSTED', message: 'Промокод исчерпан' } }, 400);
  return c.json({ data: { code: promo.code, discountAmount: promo.discountAmount } });
});

// POST /access-plans/verify-payment — verify YooKassa payment and activate plan
router.post('/verify-payment', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const planId = typeof body.planId === 'string' ? body.planId : null;
  if (!planId) return c.json({ error: { code: 'VALIDATION', message: 'planId required' } }, 400);

  const [plan] = await db.select().from(accessPlans)
    .where(and(eq(accessPlans.id, planId), eq(accessPlans.userId, userId)))
    .limit(1);
  if (!plan) return c.json({ error: { code: 'NOT_FOUND', message: 'Plan not found' } }, 404);
  if (plan.status === 'active') return c.json({ data: { status: 'active', expiresAt: plan.expiresAt?.toISOString() } });
  if (plan.status !== 'pending') return c.json({ error: { code: 'INVALID_STATUS', message: 'Plan not in pending state' } }, 400);

  if (!plan.paymentRef || !isYooKassaEnabled()) {
    return c.json({ error: { code: 'NO_PAYMENT', message: 'No payment associated' } }, 400);
  }

  const payment = await getPayment(plan.paymentRef).catch(() => null);
  if (!payment || payment.status !== 'succeeded') {
    return c.json({ data: { status: 'pending', paymentStatus: payment?.status ?? 'unknown' } });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  await db.update(accessPlans).set({
    status: 'active',
    startsAt: now,
    expiresAt,
    confirmedAt: now,
  }).where(eq(accessPlans.id, plan.id));

  return c.json({ data: { status: 'active', expiresAt: expiresAt.toISOString() } });
});

export default router;
