import { Resend } from 'resend';

// ── SMTP (nodemailer) ────────────────────────────────────────────────────────
let smtpTransport: any = null;
const SMTP_FROM = process.env.SMTP_FROM ?? '';
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    const nodemailer = await import('nodemailer');
    smtpTransport = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for port 465 (SSL), false for 587 (STARTTLS)
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    console.log('[EMAIL] SMTP ready:', process.env.SMTP_HOST);
  } catch {
    console.warn('[EMAIL] SMTP_HOST set but nodemailer not installed — run: npm install nodemailer');
  }
}

// ── Brevo REST API ─────────────────────────────────────────────────────────────
// Free 300 emails/day, no domain verification — just verify sender email at brevo.com
const BREVO_API_KEY = process.env.BREVO_API_KEY ?? '';
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? '';
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME ?? 'TrashGo';

// ── Resend ──────────────────────────────────────────────────────────────────────
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? 'TrashGo <onboarding@resend.dev>';
const resendIsSandbox = RESEND_FROM.includes('onboarding@resend.dev');
if (resend && resendIsSandbox) {
  console.warn('[EMAIL] WARNING: Using onboarding@resend.dev — only delivers to the Resend account owner. Set RESEND_FROM_EMAIL to a verified sender (or configure SMTP / Brevo).');
}

// isEmailEnabled: true only when we can deliver to ANY email address
export const isEmailEnabled = () => !!(
  smtpTransport ||
  (BREVO_API_KEY && BREVO_FROM_EMAIL) ||
  (resend && !resendIsSandbox)
);

async function send(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  // 1. SMTP via nodemailer
  if (smtpTransport) {
    try {
      await smtpTransport.sendMail({ from: SMTP_FROM || process.env.SMTP_USER, to, subject, html, ...(text ? { text } : {}) });
      return true;
    } catch (e: any) {
      console.error('[EMAIL] SMTP send failed:', e.message);
      // fall through to next provider
    }
  }

  // 2. Brevo REST API
  if (BREVO_API_KEY && BREVO_FROM_EMAIL) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          ...(text ? { textContent: text } : {}),
        }),
      });
      if (res.ok) return true;
      const errBody = await res.text().catch(() => '');
      console.error('[EMAIL] Brevo send failed:', res.status, errBody.slice(0, 200));
      // fall through to Resend
    } catch (e: any) {
      console.error('[EMAIL] Brevo send error:', e.message);
    }
  }

  // 3. Resend
  if (resend) {
    const payload = { from: RESEND_FROM, to, subject, html, ...(text ? { text } : {}) };
    const { error } = await resend.emails.send(payload);
    if (error) {
      console.error('[EMAIL] Resend failed, retrying in 5s:', error.message);
      await new Promise(r => setTimeout(r, 5000));
      const retry = await resend.emails.send(payload);
      if (retry.error) { console.error('[EMAIL] Resend retry failed:', retry.error.message); return false; }
    }
    return true;
  }

  // 4. Dev fallback — log to console
  console.log(`[EMAIL DEV] To: ${to} | ${subject}`);
  return true;
}

function base(content: string): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:2rem;background:#f9fafb;border-radius:12px">
    <h2 style="color:#111827;margin:0 0 1rem;font-size:1.2rem">🗑️ TrashGo</h2>
    ${content}
    <p style="color:#9ca3af;font-size:0.75rem;margin-top:1.5rem">© TrashGo — платформа для вывоза мусора в Казани</p>
  </div>`;
}

function card(text: string): string {
  return `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:1rem 1.25rem;margin-bottom:1rem;font-size:0.9rem;color:#374151">${text}</div>`;
}

export async function sendEmailOtp(to: string, code: string): Promise<boolean> {
  return send(
    to,
    `${code} — ваш код TrashGo`,
    base(`
      <p style="color:#6b7280;margin:0 0 1rem;font-size:0.95rem">Ваш код подтверждения для входа в TrashGo:</p>
      <div style="background:#fff;border:2px solid #e5e7eb;border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1rem">
        <span style="font-size:2.5rem;font-weight:800;letter-spacing:0.5rem;color:#111827">${code}</span>
      </div>
      <p style="color:#9ca3af;font-size:0.8rem;margin:0">Код действителен 10 минут. Не сообщайте его никому.</p>
      <p style="color:#9ca3af;font-size:0.75rem;margin:0.75rem 0 0">Если вы не запрашивали этот код — просто проигнорируйте письмо.</p>
    `),
    `TrashGo — код подтверждения\n\nВаш код: ${code}\n\nКод действителен 10 минут. Не сообщайте его никому.\n\nЕсли вы не запрашивали этот код — просто проигнорируйте письмо.`,
  );
}

export async function sendOrderAcceptedEmail(to: string, opts: {
  contractorName: string; address: string; scheduledAt: string | null; price: number; orderId: string;
}): Promise<void> {
  const time = opts.scheduledAt
    ? new Date(opts.scheduledAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
    : 'Срочно (ASAP)';
  await send(to, '✅ Исполнитель принял ваш заказ — TrashGo', base(`
    <p style="color:#374151;margin:0 0 1rem">Ваш заказ принят и скоро будет выполнен.</p>
    ${card(`<b>Адрес:</b> ${opts.address}<br><b>Исполнитель:</b> ${opts.contractorName}<br><b>Время:</b> ${time}<br><b>Стоимость:</b> ${opts.price}₽`)}
    <p style="color:#6b7280;font-size:0.85rem">Вы получите уведомление, когда мусор будет вынесен и нужно будет подтвердить выполнение.</p>
  `));
}

export async function sendOrderCompletedEmail(to: string, opts: {
  address: string; contractorName: string; orderId: string;
}): Promise<void> {
  await send(to, '📦 Мусор вынесен — подтвердите выполнение', base(`
    <p style="color:#374151;margin:0 0 1rem">Исполнитель <b>${opts.contractorName}</b> сообщает, что вынес мусор.</p>
    ${card(`<b>Адрес:</b> ${opts.address}`)}
    <p style="color:#374151;margin:0 0 1rem">Пожалуйста, войдите в приложение и подтвердите выполнение или откройте спор, если что-то пошло не так.</p>
    <p style="color:#9ca3af;font-size:0.85rem">Если вы не подтвердите в течение 24 часов, заказ будет закрыт автоматически.</p>
  `));
}

export async function sendOrderConfirmedEmail(to: string, opts: {
  address: string; amount: number;
}): Promise<void> {
  await send(to, '💰 Оплата подтверждена — TrashGo', base(`
    <p style="color:#374151;margin:0 0 1rem">Заказчик подтвердил выполнение работы. Оплата начислена на ваш баланс.</p>
    ${card(`<b>Адрес:</b> ${opts.address}<br><b>Начислено:</b> ${opts.amount}₽`)}
    <p style="color:#6b7280;font-size:0.85rem">Спасибо за работу! Продолжайте принимать заказы.</p>
  `));
}

export async function sendOrderCancelledEmail(to: string, opts: {
  address: string; cancelledBy: 'customer' | 'contractor';
}): Promise<void> {
  const who = opts.cancelledBy === 'customer' ? 'Заказчик отменил заказ' : 'Исполнитель отменил заказ';
  await send(to, '❌ Заказ отменён — TrashGo', base(`
    <p style="color:#374151;margin:0 0 1rem">${who}.</p>
    ${card(`<b>Адрес:</b> ${opts.address}`)}
  `));
}

export async function sendSubscriptionOrderEmail(to: string, opts: {
  address: string; scheduledDate: string; price: number;
}): Promise<void> {
  await send(to, '🔄 Создан заказ по подписке — TrashGo', base(`
    <p style="color:#374151;margin:0 0 1rem">По вашей подписке автоматически создан новый заказ.</p>
    ${card(`<b>Адрес:</b> ${opts.address}<br><b>Дата:</b> ${opts.scheduledDate}<br><b>Стоимость:</b> ${opts.price}₽`)}
    <p style="color:#6b7280;font-size:0.85rem">Исполнители уже видят ваш заказ и скоро откликнутся.</p>
  `));
}
