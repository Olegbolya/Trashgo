import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../../api/client';

const API_URL = API_BASE_URL;

interface Stats {
  users: number;
  frozenUsers: number;
  orders: Record<string, number>;
  revenue: number;
  disputes: number;
  paymentDisputes: number;
  recentOrders: number;
  activeSubscribers?: number;
  trialUsers?: number;
  subscriptionRevenue?: number;
}

interface FrozenUser {
  id: string;
  phone: string;
  name: string;
  freezeReason: string | null;
  createdAt: string;
}

interface UserRow {
  id: string;
  phone: string;
  name: string;
  role: string;
  frozen: boolean;
  freezeReason: string | null;
  isVerified: boolean;
  balance: number;
  xp: number;
  createdAt: string;
}

interface UserOrder {
  id: string;
  address: string;
  status: string;
  price: number;
  createdAt: string;
  customerId: string | null;
  contractorId: string | null;
}

interface DisputeRow {
  id: string;
  orderId: string;
  note: string;
  createdAt: string;
  orderStatus: string | null;
  address: string | null;
  price: number | null;
  customerId: string | null;
  contractorId: string | null;
}

interface SupportMsg {
  id: string;
  userId: string;
  message: string;
  reply: string | null;
  repliedAt: string | null;
  status: string;
  createdAt: string;
  userName: string | null;
  userPhone: string | null;
  telegramChatId: string | null;
  category: string | null;
  readAt: string | null;
  isBotReply: boolean;
  escalated: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  order: '🚛 Заказ',
  payment: '💳 Оплата',
  tech: '⚙️ Техника',
  other: '💬 Другое',
};

type Tab = 'stats' | 'frozen' | 'disputes' | 'payment' | 'users' | 'support' | 'plans' | 'promos';

interface PendingPlan {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  priceAtPurchase: number;
  paymentRef: string | null;
  createdAt: string;
  userRegisteredAt: string | null;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: '0.875rem', padding: '1.125rem 1.25rem', border: `1px solid ${accent ?? '#334155'}` }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.375rem' }}>{label}</div>
      <div style={{ fontSize: '1.625rem', fontWeight: 700, color: accent ?? '#f1f5f9' }}>{value}</div>
    </div>
  );
}

export default function Admin() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem('admin_secret') ?? '');
  const [secretInput, setSecretInput] = useState('');

  const applySecret = (value: string) => {
    sessionStorage.setItem('admin_secret', value);
    setSecret(value);
  };
  const clearSecret = () => {
    sessionStorage.removeItem('admin_secret');
    setSecret('');
  };

  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [frozen, setFrozen] = useState<FrozenUser[]>([]);
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [paymentDisputes, setPaymentDisputes] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unfreezing, setUnfreezing] = useState<string | null>(null);
  const [freezing, setFreezing] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<UserRow[]>([]);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [usersOffset, setUsersOffset] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userOrders, setUserOrders] = useState<{ userId: string; orders: UserOrder[] } | null>(null);
  const [closingDispute, setClosingDispute] = useState<string | null>(null);
  const [freezeModal, setFreezeModal] = useState<{ userId: string; name: string } | null>(null);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeSubmitting, setFreezeSubmitting] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{ userId: string; name: string } | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [pendingPlans, setPendingPlans] = useState<PendingPlan[]>([]);
  const [confirmingPlan, setConfirmingPlan] = useState<string | null>(null);
  const [rejectingPlan, setRejectingPlan] = useState<string | null>(null);
  const [promoCodes, setPromoCodes] = useState<{ id: string; code: string; discountAmount: number; maxUses: number; usedCount: number; expiresAt: string | null; createdAt: string }[]>([]);
  const [promoForm, setPromoForm] = useState({ code: '', discountAmount: 10, maxUses: 0, expiresAt: '' });
  const [promoSubmitting, setPromoSubmitting] = useState(false);
  const [supportMsgs, setSupportMsgs] = useState<SupportMsg[]>([]);
  const [supportFilter, setSupportFilter] = useState<'open' | 'escalated' | 'all'>('open');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [extendingSubscription, setExtendingSubscription] = useState<string | null>(null);
  const [broadcastingUpdate, setBroadcastingUpdate] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [grantPhone, setGrantPhone] = useState('');
  const [grantMonths, setGrantMonths] = useState(1);
  const [grantSubmitting, setGrantSubmitting] = useState(false);
  const [grantResult, setGrantResult] = useState<{ name: string; phone: string; expiresAt: string } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiFetch = useCallback(async (path: string, opts?: RequestInit) => {
    const url = `${API_URL}${path}`;
    const res = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'Authorization': `Bearer ${secret}` } : {}),
        ...(opts?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
    }
    return res.json();
  }, [secret]);

  const loadStats = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await apiFetch('/admin/stats');
      setStats(r.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiFetch]);

  const loadFrozen = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await apiFetch('/admin/frozen');
      setFrozen(r.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiFetch]);

  const loadDisputes = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [d, p] = await Promise.all([
        apiFetch('/admin/disputes'),
        apiFetch('/admin/disputes/payment'),
      ]);
      setDisputes(d.data);
      setPaymentDisputes(p.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiFetch]);

  const loadAllUsers = useCallback(async (offset: number, append = false) => {
    setLoadingUsers(true); setError('');
    try {
      const r = await apiFetch(`/admin/users?offset=${offset}`);
      setUserResults(prev => append ? [...prev, ...r.data] : r.data);
      setUsersHasMore(r.meta?.hasMore ?? false);
      setUsersOffset(offset + r.data.length);
    } catch (e: any) { setError(e.message); }
    finally { setLoadingUsers(false); }
  }, [apiFetch]);

  const loadSupport = useCallback(async (status: 'open' | 'escalated' | 'all') => {
    setLoading(true); setError('');
    try {
      const r = await apiFetch(`/admin/support?status=${status}`);
      setSupportMsgs(r.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiFetch]);

  const loadPlans = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await apiFetch('/admin/access-plans/pending');
      setPendingPlans(r.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiFetch]);

  const loadPromos = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await apiFetch('/admin/promo-codes');
      setPromoCodes(r.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiFetch]);

  const handleCreatePromo = async () => {
    if (!promoForm.code.trim()) return;
    setPromoSubmitting(true);
    try {
      await apiFetch('/admin/promo-codes', { method: 'POST', body: JSON.stringify({ code: promoForm.code.trim().toUpperCase(), discountAmount: promoForm.discountAmount, maxUses: promoForm.maxUses, expiresAt: promoForm.expiresAt || null }) });
      setPromoForm({ code: '', discountAmount: 10, maxUses: 0, expiresAt: '' });
      loadPromos();
    } catch (e: any) { setError(e.message); }
    finally { setPromoSubmitting(false); }
  };

  const handleDeletePromo = async (id: string) => {
    try {
      await apiFetch(`/admin/promo-codes/${id}`, { method: 'DELETE' });
      setPromoCodes(prev => prev.filter(p => p.id !== id));
    } catch (e: any) { setError(e.message); }
  };

  const handleConfirmPlan = async (id: string) => {
    setConfirmingPlan(id);
    try {
      await apiFetch(`/admin/access-plans/${id}/confirm`, { method: 'POST' });
      setPendingPlans(prev => prev.filter(p => p.id !== id));
    } catch (e: any) { setError(e.message); }
    finally { setConfirmingPlan(null); }
  };

  const handleRejectPlan = async (id: string) => {
    setRejectingPlan(id);
    try {
      await apiFetch(`/admin/access-plans/${id}/reject`, { method: 'POST' });
      setPendingPlans(prev => prev.filter(p => p.id !== id));
    } catch (e: any) { setError(e.message); }
    finally { setRejectingPlan(null); }
  };

  useEffect(() => {
    if (!secret) return;
    if (tab === 'stats') loadStats();
    else if (tab === 'frozen') loadFrozen();
    else if (tab === 'disputes' || tab === 'payment') loadDisputes();
    else if (tab === 'users') { setUserSearch(''); loadAllUsers(0); }
    else if (tab === 'support') loadSupport(supportFilter);
    else if (tab === 'plans') loadPlans();
    else if (tab === 'promos') loadPromos();
  }, [tab, secret]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUnfreeze = async (id: string) => {
    setUnfreezing(id);
    try {
      await apiFetch(`/admin/unfreeze/${id}`, { method: 'POST' });
      setFrozen(prev => prev.filter(u => u.id !== id));
      setUserResults(prev => prev.map(u => u.id === id ? { ...u, frozen: false, freezeReason: null } : u));
      if (stats) setStats({ ...stats, frozenUsers: stats.frozenUsers - 1 });
    } catch (e: any) { setError(e.message); }
    finally { setUnfreezing(null); }
  };

  const handleVerify = async (id: string) => {
    setVerifying(id);
    try {
      await apiFetch(`/admin/verify/${id}`, { method: 'POST' });
      setUserResults(prev => prev.map(u => u.id === id ? { ...u, isVerified: true } : u));
    } catch (e: any) { setError(e.message); }
    finally { setVerifying(null); }
  };

  const handleFreeze = (id: string, name: string) => {
    setFreezeModal({ userId: id, name });
    setFreezeReason('');
  };

  const handleFreezeSubmit = async () => {
    if (!freezeModal || !freezeReason.trim()) return;
    setFreezeSubmitting(true);
    try {
      await apiFetch(`/admin/freeze/${freezeModal.userId}`, { method: 'POST', body: JSON.stringify({ reason: freezeReason.trim() }) });
      setUserResults(prev => prev.map(u => u.id === freezeModal.userId ? { ...u, frozen: true, freezeReason: freezeReason.trim() } : u));
      setFreezeModal(null);
      setFreezeReason('');
    } catch (e: any) { setError(e.message); }
    finally { setFreezeSubmitting(false); }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    setDeleteSubmitting(true);
    try {
      await apiFetch(`/admin/users/${deleteModal.userId}`, { method: 'DELETE' });
      setUserResults(prev => prev.filter(u => u.id !== deleteModal.userId));
      setDeleteModal(null);
    } catch (e: any) { setError(e.message); }
    finally { setDeleteSubmitting(false); }
  };

  const handleUserSearch = (q: string) => {
    setUserSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) {
      loadAllUsers(0);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setLoadingUsers(true);
      try {
        const r = await apiFetch(`/admin/users?q=${encodeURIComponent(q.trim())}`);
        setUserResults(r.data);
        setUsersHasMore(false);
      } catch (e: any) { setError(e.message); }
      finally { setLoadingUsers(false); }
    }, 400);
  };

  const loadUserOrders = async (userId: string) => {
    if (userOrders?.userId === userId) { setUserOrders(null); return; }
    try {
      const r = await apiFetch(`/admin/users/${userId}/orders`);
      setUserOrders({ userId, orders: r.data });
    } catch (e: any) { setError(e.message); }
  };

  const handleCloseDispute = async (disputeId: string, isPayment: boolean) => {
    const resolution = prompt('Резолюция (причина закрытия):');
    if (!resolution) return;
    setClosingDispute(disputeId);
    try {
      await apiFetch(`/admin/disputes/${disputeId}/close`, { method: 'POST', body: JSON.stringify({ resolution }) });
      if (isPayment) setPaymentDisputes(prev => prev.filter(d => d.id !== disputeId));
      else setDisputes(prev => prev.filter(d => d.id !== disputeId));
    } catch (e: any) { setError(e.message); }
    finally { setClosingDispute(null); }
  };

  const handleSupportReply = async (msgId: string) => {
    const reply = replyTexts[msgId]?.trim();
    if (!reply) return;
    setSendingReply(msgId);
    try {
      await apiFetch(`/admin/support/${msgId}/reply`, { method: 'POST', body: JSON.stringify({ reply }) });
      setSupportMsgs(prev => prev.map(m => m.id === msgId ? { ...m, reply, status: 'closed', repliedAt: new Date().toISOString() } : m));
      setReplyTexts(prev => { const next = { ...prev }; delete next[msgId]; return next; });
    } catch (e: any) { setError(e.message); }
    finally { setSendingReply(null); }
  };

  const handleSupportFilterChange = (f: 'open' | 'escalated' | 'all') => {
    setSupportFilter(f);
    loadSupport(f);
  };

  const handleBroadcastUpdate = async () => {
    if (!confirm('Отправить push-уведомление об обновлении всем пользователям с FCM-токеном?')) return;
    setBroadcastingUpdate(true);
    setBroadcastResult(null);
    try {
      const r = await apiFetch('/admin/broadcast-update', { method: 'POST' });
      setBroadcastResult(r.data);
    } catch (e: any) { setError(e.message); }
    finally { setBroadcastingUpdate(false); }
  };

  const handleExtendSubscription = async (userId: string) => {
    setExtendingSubscription(userId);
    try {
      await apiFetch(`/admin/users/${userId}/extend-subscription`, { method: 'POST' });
      setUserResults(prev => prev.map(u => u.id === userId ? { ...u, subscriptionStatus: 'active' } as any : u));
    } catch (e: any) { setError(e.message); }
    finally { setExtendingSubscription(null); }
  };

  const handleGrantByPhone = async () => {
    const phone = grantPhone.trim();
    if (!phone) return;
    setGrantSubmitting(true);
    setGrantResult(null);
    try {
      const r = await apiFetch('/admin/grant-subscription', { method: 'POST', body: JSON.stringify({ phone, months: grantMonths }) });
      setGrantResult(r.data);
      setGrantPhone('');
    } catch (e: any) { setError(e.message || 'Пользователь не найден'); }
    finally { setGrantSubmitting(false); }
  };

  const bg = '#0f172a';
  const surface = '#1e293b';
  const border = '#334155';
  const text = '#f1f5f9';
  const muted = '#94a3b8';
  const accent = '#38bdf8';

  const tabStyle = (active: boolean) => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    background: active ? accent : 'transparent',
    color: active ? '#0f172a' : muted,
    border: `1px solid ${active ? accent : border}`,
    cursor: 'pointer', fontSize: '0.875rem', fontWeight: active ? 700 : 400,
    fontFamily: 'inherit', transition: 'all 0.15s',
  });

  // Secret entry screen
  if (!secret) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ background: surface, borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '360px', border: `1px solid ${border}` }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: text, marginBottom: '0.5rem' }}>🛡️ TrashGo Admin</div>
          <div style={{ fontSize: '0.875rem', color: muted, marginBottom: '1.5rem' }}>Введите секретный ключ для доступа</div>
          <input
            type="password"
            value={secretInput}
            onChange={e => setSecretInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && secretInput.trim()) applySecret(secretInput.trim()); }}
            placeholder="ADMIN_SECRET"
            style={{ width: '100%', height: '2.75rem', padding: '0 0.875rem', borderRadius: '0.625rem', border: `1.5px solid ${border}`, background: bg, color: text, fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '0.75rem' }}
            autoFocus
          />
          <button
            onClick={() => { if (secretInput.trim()) applySecret(secretInput.trim()); }}
            style={{ width: '100%', height: '2.75rem', borderRadius: '0.625rem', background: accent, color: '#0f172a', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'inherit' }}
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  const totalOrders = stats ? Object.values(stats.orders).reduce((a, b) => a + b, 0) : 0;

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>🛡️ TrashGo Admin</div>
        <button
          onClick={clearSecret}
          style={{ background: 'none', border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '0.375rem 0.75rem', color: muted, cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit' }}
        >
          Выйти
        </button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {([['stats', '📊 Статистика'], ['users', '👤 Пользователи'], ['plans', '💳 Абонементы'], ['promos', '🎟 Промокоды'], ['frozen', '🔒 Замороженные'], ['disputes', '⚠️ Споры'], ['payment', '💸 Платёжные споры'], ['support', '💬 Поддержка']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} style={tabStyle(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: '0.625rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#fca5a5' }}>
            ❌ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', color: muted, padding: '3rem' }}>Загрузка...</div>
        )}

        {/* STATS TAB */}
        {!loading && tab === 'stats' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
              <StatCard label="Пользователей" value={stats.users} />
              <StatCard label="Заморожено" value={stats.frozenUsers} accent={stats.frozenUsers > 0 ? '#f97316' : undefined} />
              <StatCard label="Всего заказов" value={totalOrders} />
              <StatCard label="Выручка заказы" value={`${stats.revenue.toLocaleString('ru-RU')}₽`} accent="#4ade80" />
              <StatCard label="Споры" value={stats.disputes} accent={stats.disputes > 0 ? '#facc15' : undefined} />
              <StatCard label="Платёж. споры" value={stats.paymentDisputes} accent={stats.paymentDisputes > 0 ? '#f87171' : undefined} />
              <StatCard label="За 7 дней" value={stats.recentOrders} />
              {stats.activeSubscribers !== undefined && <StatCard label="Активных абонем." value={stats.activeSubscribers} accent="#22c55e" />}
              {stats.trialUsers !== undefined && <StatCard label="На пробном пер." value={stats.trialUsers} accent="#f59e0b" />}
              {stats.subscriptionRevenue !== undefined && <StatCard label="Абонем. (месяц)" value={`${stats.subscriptionRevenue}₽`} accent="#60a5fa" />}
            </div>

            <div style={{ background: surface, borderRadius: '0.875rem', padding: '1.25rem', border: `1px solid ${border}` }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: muted, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Заказы по статусам</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  ['new', 'Новые', '#60a5fa'],
                  ['accepted', 'Принятые', '#34d399'],
                  ['in_progress', 'В процессе', '#a78bfa'],
                  ['pending_confirmation', 'Ожидают подтверждения', '#fbbf24'],
                  ['completed', 'Выполненные', '#4ade80'],
                  ['cancelled', 'Отменённые', '#f87171'],
                ].map(([key, label, color]) => {
                  const cnt = stats.orders[key] ?? 0;
                  const pct = totalOrders > 0 ? Math.round(cnt / totalOrders * 100) : 0;
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '160px', fontSize: '0.8125rem', color: muted, flexShrink: 0 }}>{label}</div>
                      <div style={{ flex: 1, height: '6px', background: border, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color as string, borderRadius: '3px', transition: 'width 0.4s' }} />
                      </div>
                      <div style={{ width: '50px', textAlign: 'right', fontSize: '0.8125rem', color: text, fontWeight: 600 }}>{cnt}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Broadcast update notification */}
            <div style={{ background: surface, borderRadius: '0.875rem', padding: '1.25rem', border: `1px solid ${border}`, marginTop: '1rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: muted, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Уведомление об обновлении</div>
              <div style={{ fontSize: '0.8125rem', color: muted, marginBottom: '1rem' }}>
                Отправляет push-уведомление всем пользователям с FCM-токеном — приходит в шторку уведомлений Android, даже если приложение закрыто.
              </div>
              {broadcastResult && (
                <div style={{ marginBottom: '0.75rem', fontSize: '0.8125rem', color: '#4ade80' }}>
                  ✓ Отправлено: {broadcastResult.sent} / {broadcastResult.total} (ошибок: {broadcastResult.failed})
                </div>
              )}
              <button
                onClick={handleBroadcastUpdate}
                disabled={broadcastingUpdate}
                style={{ padding: '0.625rem 1.25rem', borderRadius: '0.625rem', background: broadcastingUpdate ? border : '#3b82f620', border: `1px solid ${broadcastingUpdate ? border : '#3b82f660'}`, color: broadcastingUpdate ? muted : '#60a5fa', cursor: broadcastingUpdate ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit' }}
              >
                {broadcastingUpdate ? '⏳ Отправляем...' : '📢 Уведомить об обновлении'}
              </button>
            </div>
          </div>
        )}

        {/* FROZEN TAB */}
        {!loading && tab === 'frozen' && (
          <div>
            {frozen.length === 0 ? (
              <div style={{ textAlign: 'center', color: muted, padding: '3rem' }}>Нет замороженных аккаунтов</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {frozen.map(u => (
                  <div key={u.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: '0.875rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: text }}>{u.name || '—'}</span>
                        <span style={{ fontSize: '0.8rem', color: muted }}>{u.phone}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#f97316', marginBottom: '0.25rem' }}>🔒 {u.freezeReason || 'Причина не указана'}</div>
                      <div style={{ fontSize: '0.75rem', color: muted }}>{fmt(u.createdAt)} · ID: {u.id.slice(-8)}</div>
                    </div>
                    <button
                      disabled={unfreezing === u.id}
                      onClick={() => handleUnfreeze(u.id)}
                      style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: unfreezing === u.id ? border : '#4ade8020', border: `1px solid ${unfreezing === u.id ? border : '#4ade80'}`, color: unfreezing === u.id ? muted : '#4ade80', cursor: unfreezing === u.id ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit', flexShrink: 0 }}
                    >
                      {unfreezing === u.id ? '...' : '🔓 Разморозить'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <input
              type="text"
              value={userSearch}
              onChange={e => handleUserSearch(e.target.value)}
              placeholder="Поиск по номеру телефона или имени..."
              style={{ width: '100%', height: '2.75rem', padding: '0 0.875rem', borderRadius: '0.625rem', border: `1.5px solid ${border}`, background: bg, color: text, fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '1rem' }}
              autoFocus
            />
            {loadingUsers && <div style={{ textAlign: 'center', color: muted, padding: '1.5rem' }}>Загрузка...</div>}
            {!loadingUsers && userResults.length === 0 && userSearch.trim() && (
              <div style={{ textAlign: 'center', color: muted, padding: '2rem' }}>Ничего не найдено</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {userResults.map(u => (
                <div key={u.id} style={{ background: surface, border: `1px solid ${u.frozen ? '#f97316' : border}`, borderRadius: '0.875rem', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: text }}>{u.name || '—'}</span>
                        <span style={{ fontSize: '0.8rem', color: muted }}>{u.phone}</span>
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: u.role === 'contractor' ? '#2563eb20' : '#16a34a20', color: u.role === 'contractor' ? '#60a5fa' : '#4ade80' }}>{u.role === 'contractor' ? 'Исполнитель' : 'Заказчик'}</span>
                        {u.frozen && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#f9731620', color: '#f97316' }}>🔒 Заморожен</span>}
                        {u.role === 'contractor' && !u.isVerified && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#fbbf2420', color: '#f59e0b' }}>⏳ Не верифицирован</span>}
                        {u.role === 'contractor' && u.isVerified && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#22c55e20', color: '#22c55e' }}>✓ Верифицирован</span>}
                        {(u as any).subscriptionStatus === 'trial' && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#fbbf2415', color: '#f59e0b' }}>🟡 Пробный</span>}
                        {(u as any).subscriptionStatus === 'active' && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#22c55e15', color: '#22c55e' }}>🟢 Активен</span>}
                        {(u as any).subscriptionStatus === 'expired' && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#ef444415', color: '#ef4444' }}>🔴 Истёк</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: muted }}>XP: {u.xp} · Баланс: {u.balance}₽ · {fmt(u.createdAt)} · ID: {u.id.slice(-8)}</div>
                      {u.frozen && u.freezeReason && <div style={{ fontSize: '0.75rem', color: '#f97316', marginTop: '0.25rem' }}>Причина: {u.freezeReason}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0 }}>
                      <button
                        onClick={() => loadUserOrders(u.id)}
                        style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: `${accent}15`, border: `1px solid ${accent}40`, color: accent, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}
                      >
                        {userOrders?.userId === u.id ? '▲ Скрыть' : '▼ Заказы'}
                      </button>
                      <button
                        onClick={() => setExpandedUsers(prev => { const n = new Set(prev); n.has(u.id) ? n.delete(u.id) : n.add(u.id); return n; })}
                        style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: expandedUsers.has(u.id) ? `${accent}25` : 'transparent', border: `1px solid ${border}`, color: muted, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}
                      >📋 Подробнее</button>
                      {u.frozen ? (
                        <button disabled={unfreezing === u.id} onClick={() => handleUnfreeze(u.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: '#4ade8015', border: '1px solid #4ade8040', color: '#4ade80', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                          {unfreezing === u.id ? '...' : '🔓 Разморозить'}
                        </button>
                      ) : (
                        <button disabled={freezing === u.id} onClick={() => handleFreeze(u.id, u.name || u.phone)} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: '#f9731615', border: '1px solid #f9731640', color: '#f97316', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                          {freezing === u.id ? '...' : '🔒 Заморозить'}
                        </button>
                      )}
                      {u.role === 'contractor' && !u.isVerified && (
                        <button disabled={verifying === u.id} onClick={() => handleVerify(u.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: '#22c55e15', border: '1px solid #22c55e40', color: '#22c55e', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                          {verifying === u.id ? '...' : '✓ Верифицировать'}
                        </button>
                      )}
                      <button disabled={extendingSubscription === u.id} onClick={() => handleExtendSubscription(u.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: '#a855f715', border: '1px solid #a855f740', color: '#a855f7', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                        {extendingSubscription === u.id ? '...' : '🔄 +30 дней'}
                      </button>
                      <button onClick={() => setDeleteModal({ userId: u.id, name: u.name || u.phone })} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: '#ef444415', border: '1px solid #ef444440', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                        🗑 Удалить
                      </button>
                    </div>
                  </div>
                  {userOrders?.userId === u.id && (
                    <div style={{ marginTop: '0.75rem', borderTop: `1px solid ${border}`, paddingTop: '0.75rem' }}>
                      {userOrders.orders.length === 0 ? (
                        <div style={{ color: muted, fontSize: '0.8rem' }}>Заказов нет</div>
                      ) : userOrders.orders.map(o => (
                        <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 0', borderBottom: `1px solid ${border}`, fontSize: '0.8rem', flexWrap: 'wrap' }}>
                          <span style={{ color: muted, minWidth: '80px' }}>{fmt(o.createdAt)}</span>
                          <span style={{ flex: 1, color: text }}>{o.address}</span>
                          <span style={{ color: '#4ade80', fontWeight: 600 }}>{o.price}₽</span>
                          <span style={{ color: muted }}>{o.status}</span>
                          <span style={{ color: muted, fontFamily: 'monospace' }}>{o.id.slice(-6)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {expandedUsers.has(u.id) && (
                    <div style={{ marginTop: '0.75rem', borderTop: `1px solid ${border}`, paddingTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <div style={{ color: muted }}>XP: <span style={{ color: text }}>{u.xp}</span></div>
                      <div style={{ color: muted }}>Баланс: <span style={{ color: '#4ade80' }}>{u.balance}₽</span></div>
                      <div style={{ color: muted }}>Роль: <span style={{ color: text }}>{u.role}</span></div>
                      <div style={{ color: muted }}>Зарег: <span style={{ color: text }}>{fmt(u.createdAt)}</span></div>
                      <div style={{ color: muted }}>ID: <span style={{ color: text, fontFamily: 'monospace' }}>{u.id}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!loadingUsers && usersHasMore && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  onClick={() => loadAllUsers(usersOffset, true)}
                  style={{ padding: '0.625rem 1.5rem', borderRadius: '0.5rem', background: `${accent}15`, border: `1px solid ${accent}40`, color: accent, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}
                >
                  Загрузить ещё
                </button>
              </div>
            )}
          </div>
        )}

        {/* DISPUTES TAB */}
        {!loading && tab === 'disputes' && (
          <DisputeList rows={disputes} title="Споры заказчиков" emptyText="Споров нет" surface={surface} border={border} text={text} muted={muted} accent="#facc15" isPayment={false} onClose={(id) => handleCloseDispute(id, false)} closingId={closingDispute} />
        )}

        {/* PAYMENT DISPUTES TAB */}
        {!loading && tab === 'payment' && (
          <DisputeList rows={paymentDisputes} title="Платёжные споры исполнителей" emptyText="Платёжных споров нет" surface={surface} border={border} text={text} muted={muted} accent="#f87171" isPayment={true} onClose={(id) => handleCloseDispute(id, true)} closingId={closingDispute} />
        )}

        {/* PLANS TAB */}
        {!loading && tab === 'plans' && (
          <div>
            {/* GRANT SUBSCRIPTION DIRECTLY */}
            <div style={{ background: surface, border: `1px solid #a855f740`, borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#a855f7', marginBottom: '0.75rem' }}>🎁 Выдать абонемент по номеру телефона</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 180px' }}>
                  <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '0.25rem' }}>Телефон (+7...)</div>
                  <input
                    value={grantPhone}
                    onChange={e => { setGrantPhone(e.target.value); setGrantResult(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') handleGrantByPhone(); }}
                    placeholder="+79991234567"
                    style={{ width: '100%', height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: `1px solid ${border}`, background: '#1a2035', color: text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: '0 0 100px' }}>
                  <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '0.25rem' }}>Месяцев</div>
                  <input
                    type="number" min={1} max={12}
                    value={grantMonths}
                    onChange={e => setGrantMonths(Math.max(1, Math.min(12, Number(e.target.value))))}
                    style={{ width: '100%', height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: `1px solid ${border}`, background: '#1a2035', color: text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  disabled={!grantPhone.trim() || grantSubmitting}
                  onClick={handleGrantByPhone}
                  style={{ height: '2.25rem', padding: '0 1.25rem', borderRadius: '0.5rem', background: grantSubmitting ? muted : '#a855f7', color: '#fff', border: 'none', cursor: grantSubmitting || !grantPhone.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}
                >
                  {grantSubmitting ? '...' : '✓ Выдать'}
                </button>
              </div>
              {grantResult && (
                <div style={{ marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: '#4ade8015', border: '1px solid #4ade8040', fontSize: '0.8125rem', color: '#4ade80' }}>
                  ✅ Абонемент выдан: <strong>{grantResult.name || grantResult.phone}</strong> · до {new Date(grantResult.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 700, color: text, marginBottom: '1rem' }}>
              💳 Ожидают подтверждения оплаты — {pendingPlans.length}
            </div>
            {pendingPlans.length === 0 ? (
              <div style={{ textAlign: 'center', color: muted, padding: '3rem', background: surface, borderRadius: '0.875rem', border: `1px solid ${border}` }}>
                Нет ожидающих запросов
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingPlans.map(p => (
                  <div key={p.id} style={{ background: surface, borderRadius: '0.875rem', padding: '1rem 1.25rem', border: `1px solid ${border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: text, marginBottom: '0.25rem' }}>
                          {p.userName} — <span style={{ color: '#60a5fa' }}>{p.userPhone}</span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: muted, marginBottom: '0.25rem' }}>
                          Сумма: <strong style={{ color: '#4ade80' }}>{p.priceAtPurchase}₽</strong>
                          {' · '}Запрос: {fmt(p.createdAt)}
                          {p.userRegisteredAt && ` · Рег.: ${fmt(p.userRegisteredAt)}`}
                        </div>
                        {p.paymentRef && (
                          <div style={{ fontSize: '0.8125rem', color: '#fbbf24' }}>
                            Номер операции: <strong>{p.paymentRef}</strong>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                          disabled={confirmingPlan === p.id}
                          onClick={() => handleConfirmPlan(p.id)}
                          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#4ade8018', border: '1px solid #4ade8040', color: '#4ade80', cursor: confirmingPlan === p.id ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit', fontWeight: 600 }}
                        >
                          {confirmingPlan === p.id ? '...' : '✓ Подтвердить'}
                        </button>
                        <button
                          disabled={rejectingPlan === p.id}
                          onClick={() => handleRejectPlan(p.id)}
                          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#f871711a', border: '1px solid #f8717140', color: '#f87171', cursor: rejectingPlan === p.id ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit' }}
                        >
                          {rejectingPlan === p.id ? '...' : '✕ Отклонить'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROMOS TAB */}
        {!loading && tab === 'promos' && (
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: text, marginBottom: '1rem' }}>🎟 Промокоды</div>
            {/* Create form */}
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: text, marginBottom: '0.75rem' }}>Создать промокод</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 160px' }}>
                  <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '0.25rem' }}>Код</div>
                  <input value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="PROMO2026" maxLength={50} style={{ width: '100%', height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: `1px solid ${border}`, background: '#1a2035', color: text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: '0 0 120px' }}>
                  <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '0.25rem' }}>Скидка (₽)</div>
                  <input type="number" value={promoForm.discountAmount} onChange={e => setPromoForm(f => ({ ...f, discountAmount: Number(e.target.value) }))} min={0} style={{ width: '100%', height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: `1px solid ${border}`, background: '#1a2035', color: text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: '0 0 120px' }}>
                  <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '0.25rem' }}>Макс. использований (0 = ∞)</div>
                  <input type="number" value={promoForm.maxUses} onChange={e => setPromoForm(f => ({ ...f, maxUses: Number(e.target.value) }))} min={0} style={{ width: '100%', height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: `1px solid ${border}`, background: '#1a2035', color: text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: '0 0 160px' }}>
                  <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '0.25rem' }}>Истекает (не обязательно)</div>
                  <input type="date" value={promoForm.expiresAt} onChange={e => setPromoForm(f => ({ ...f, expiresAt: e.target.value }))} style={{ width: '100%', height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: `1px solid ${border}`, background: '#1a2035', color: text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <button disabled={!promoForm.code.trim() || promoSubmitting} onClick={handleCreatePromo} style={{ height: '2.25rem', padding: '0 1rem', borderRadius: '0.5rem', background: promoSubmitting ? muted : accent, color: '#fff', border: 'none', cursor: promoSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>
                  {promoSubmitting ? '...' : '+ Создать'}
                </button>
              </div>
            </div>
            {/* List */}
            {promoCodes.length === 0 ? (
              <div style={{ textAlign: 'center', color: muted, padding: '3rem', background: surface, borderRadius: '0.875rem', border: `1px solid ${border}` }}>Нет промокодов</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {promoCodes.map(p => (
                  <div key={p.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.9375rem', fontWeight: 700, color: accent }}>{p.code}</span>
                      <span style={{ marginLeft: '0.75rem', fontSize: '0.8125rem', color: '#4ade80' }}>−{p.discountAmount}₽</span>
                      <span style={{ marginLeft: '0.75rem', fontSize: '0.8125rem', color: muted }}>{p.usedCount}{p.maxUses > 0 ? `/${p.maxUses}` : ''} использований</span>
                      {p.expiresAt && <span style={{ marginLeft: '0.75rem', fontSize: '0.8125rem', color: '#fbbf24' }}>до {new Date(p.expiresAt).toLocaleDateString('ru-RU')}</span>}
                    </div>
                    <button onClick={() => handleDeletePromo(p.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.375rem', background: '#f871711a', border: '1px solid #f8717140', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>Удалить</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUPPORT TAB */}
        {!loading && tab === 'support' && (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {(['open', 'escalated', 'all'] as const).map(f => (
                <button key={f} onClick={() => handleSupportFilterChange(f)} style={{ padding: '0.375rem 0.875rem', borderRadius: '0.5rem', background: supportFilter === f ? `${f === 'escalated' ? '#f97316' : accent}25` : 'transparent', border: `1px solid ${supportFilter === f ? (f === 'escalated' ? '#f97316' : accent) : border}`, color: supportFilter === f ? (f === 'escalated' ? '#f97316' : accent) : muted, cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit' }}>
                  {f === 'open' ? '🔵 Открытые' : f === 'escalated' ? '🚨 Эскалированные' : '📋 Все'}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', color: muted, fontSize: '0.8125rem', alignSelf: 'center' }}>{supportMsgs.length} сообщений</span>
            </div>
            {supportMsgs.length === 0 ? (
              <div style={{ textAlign: 'center', color: muted, padding: '3rem' }}>Нет обращений</div>
            ) : (() => {
              // Group by userId, preserving order of first appearance
              const grouped: Map<string, SupportMsg[]> = new Map();
              for (const m of supportMsgs) {
                if (!grouped.has(m.userId)) grouped.set(m.userId, []);
                grouped.get(m.userId)!.push(m);
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {Array.from(grouped.entries()).map(([userId, msgs]) => {
                    const first = msgs[0];
                    const hasOpen = msgs.some(m => m.status === 'open');
                    const hasEscalated = msgs.some(m => m.escalated);
                    const borderColor = hasEscalated ? '#f9731640' : hasOpen ? '#38bdf840' : border;
                    const headerBg = hasEscalated ? '#f9731808' : hasOpen ? '#38bdf808' : 'transparent';
                    return (
                      <div key={userId} style={{ background: surface, border: `1px solid ${borderColor}`, borderRadius: '1rem', overflow: 'hidden' }}>
                        {/* User header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.875rem 1.125rem', borderBottom: `1px solid ${border}`, flexWrap: 'wrap', background: headerBg }}>
                          <span style={{ fontWeight: 700, color: text }}>{first.userName || '—'}</span>
                          <span style={{ fontSize: '0.8rem', color: muted }}>{first.userPhone}</span>
                          {first.telegramChatId && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#2563eb20', color: '#60a5fa' }}>TG</span>}
                          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: muted }}>{msgs.length} сообщ.</span>
                          {hasEscalated && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', background: '#f9731820', color: '#f97316', border: '1px solid #f9731640' }}>🚨 нужен оператор</span>}
                          {!hasEscalated && hasOpen && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', background: '#38bdf820', color: accent, border: `1px solid ${accent}50` }}>есть открытые</span>}
                        </div>
                        {/* Messages */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                          {msgs.map((m, idx) => (
                            <div key={m.id} style={{ padding: '0.875rem 1.125rem', borderBottom: idx < msgs.length - 1 ? `1px solid ${border}` : 'none', background: m.escalated ? '#f9731804' : 'transparent' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.7rem', color: muted }}>{fmt(m.createdAt)}</span>
                                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '0.25rem', background: m.status === 'open' ? '#38bdf820' : '#33415520', color: m.status === 'open' ? accent : muted, border: `1px solid ${m.status === 'open' ? accent + '40' : border}` }}>
                                  {m.status === 'open' ? 'открыто' : 'закрыто'}
                                </span>
                                {m.isBotReply && (
                                  <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa40' }}>🤖 бот</span>
                                )}
                                {m.escalated && (
                                  <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#f9731820', color: '#f97316', border: '1px solid #f9731640' }}>🚨 эскалировано</span>
                                )}
                                {m.category && CATEGORY_LABELS[m.category] && (
                                  <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa40' }}>
                                    {CATEGORY_LABELS[m.category]}
                                  </span>
                                )}
                                {m.reply && (
                                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: m.readAt ? '#4ade8020' : '#f9731620', color: m.readAt ? '#4ade80' : '#f97316', border: `1px solid ${m.readAt ? '#4ade8040' : '#f9731640'}` }}>
                                    {m.readAt ? '✓ Прочитано' : '👁 Не прочитано'}
                                  </span>
                                )}
                              </div>
                              {/* User message */}
                              <div style={{ background: bg, borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: text, marginBottom: '0.5rem', lineHeight: 1.55, wordBreak: 'break-word' }}>
                                {m.message}
                              </div>
                              {/* Existing reply */}
                              {m.reply && (
                                <div style={{ background: m.isBotReply ? '#a78bfa10' : `${accent}10`, borderLeft: `3px solid ${m.isBotReply ? '#a78bfa' : accent}`, borderRadius: '0 0.375rem 0.375rem 0', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
                                  <div style={{ fontSize: '0.6875rem', color: m.isBotReply ? '#a78bfa' : accent, fontWeight: 600, marginBottom: '0.2rem' }}>
                                    {m.isBotReply ? '🤖 Автоответ' : '👤 Ответ оператора'} · {m.repliedAt ? fmt(m.repliedAt) : ''}
                                  </div>
                                  <div style={{ fontSize: '0.875rem', color: text, lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{m.reply}</div>
                                </div>
                              )}
                              {/* Reply input — always available for open tickets; highlighted for escalated */}
                              {m.status === 'open' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <input
                                    value={replyTexts[m.id] ?? ''}
                                    onChange={e => setReplyTexts(prev => ({ ...prev, [m.id]: e.target.value }))}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSupportReply(m.id); } }}
                                    placeholder={m.escalated ? '🚨 Пользователь ждёт ответа оператора...' : 'Введите ответ...'}
                                    style={{ flex: 1, height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: `1px solid ${m.escalated ? '#f9731660' : border}`, background: bg, color: text, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
                                  />
                                  <button
                                    disabled={sendingReply === m.id || !replyTexts[m.id]?.trim()}
                                    onClick={() => handleSupportReply(m.id)}
                                    style={{ padding: '0 1rem', borderRadius: '0.5rem', background: sendingReply === m.id || !replyTexts[m.id]?.trim() ? border : (m.escalated ? '#f97316' : accent), color: sendingReply === m.id || !replyTexts[m.id]?.trim() ? muted : '#0f172a', border: 'none', cursor: sendingReply === m.id || !replyTexts[m.id]?.trim() ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.8125rem', fontFamily: 'inherit', flexShrink: 0 }}
                                  >
                                    {sendingReply === m.id ? '...' : 'Ответить'}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {freezeModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '400px' }}>
              <div style={{ fontWeight: 700, color: text, marginBottom: '0.25rem', fontSize: '1.05rem' }}>🔒 Заморозить аккаунт</div>
              <div style={{ color: muted, fontSize: '0.85rem', marginBottom: '1rem' }}>{freezeModal.name}</div>
              <textarea
                value={freezeReason}
                onChange={e => setFreezeReason(e.target.value)}
                placeholder="Причина заморозки..."
                rows={3}
                autoFocus
                style={{ width: '100%', borderRadius: '0.5rem', border: `1.5px solid ${border}`, background: bg, color: text, padding: '0.625rem', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.875rem' }}>
                <button
                  onClick={() => { setFreezeModal(null); setFreezeReason(''); }}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '0.5rem', border: `1px solid ${border}`, background: 'transparent', color: muted, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem' }}
                >Отмена</button>
                <button
                  disabled={!freezeReason.trim() || freezeSubmitting}
                  onClick={handleFreezeSubmit}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '0.5rem', border: 'none', background: freezeReason.trim() ? '#f97316' : '#f97316' + '60', color: 'white', cursor: freezeReason.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600 }}
                >{freezeSubmitting ? 'Замораживаем...' : '🔒 Заморозить'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete user modal */}
        {deleteModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: surface, borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '400px', border: `1px solid ${border}` }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: text, marginBottom: '0.5rem' }}>🗑 Удалить аккаунт</div>
              <p style={{ color: muted, fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Удалить аккаунт <strong style={{ color: text }}>{deleteModal.name}</strong>?<br/>
                Все заказы этого пользователя будут удалены. После удаления можно зарегистрироваться заново с тем же номером.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: '0.625rem', borderRadius: '0.5rem', border: `1px solid ${border}`, background: 'transparent', color: muted, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem' }}>Отмена</button>
                <button
                  disabled={deleteSubmitting}
                  onClick={handleDeleteUser}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600 }}
                >{deleteSubmitting ? 'Удаляем...' : '🗑 Удалить навсегда'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DisputeList({ rows, title, emptyText, surface, border, text, muted, accent, isPayment, onClose, closingId }: {
  rows: DisputeRow[]; title: string; emptyText: string;
  surface: string; border: string; text: string; muted: string; accent: string;
  isPayment: boolean; onClose: (id: string) => void; closingId: string | null;
}) {
  if (rows.length === 0) {
    return <div style={{ textAlign: 'center', color: muted, padding: '3rem' }}>{emptyText}</div>;
  }
  return (
    <div>
      <div style={{ fontSize: '0.875rem', color: muted, marginBottom: '1rem' }}>{title} · {rows.length} записей</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {rows.map(r => (
          <div key={r.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: '0.875rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '0.375rem', background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
                {r.orderStatus ?? '—'}
              </span>
              <span style={{ fontSize: '0.875rem', color: text, fontWeight: 600 }}>{r.address ?? '—'}</span>
              {r.price != null && <span style={{ fontSize: '0.875rem', color: '#4ade80', fontWeight: 700 }}>{r.price}₽</span>}
            </div>
            <div style={{ fontSize: '0.8125rem', color: accent, marginBottom: '0.375rem', wordBreak: 'break-word' }}>
              {r.note.replace(/^(PAYMENT_)?DISPUTE:\s*/i, '')}
            </div>
            <div style={{ fontSize: '0.75rem', color: muted, display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span>{fmt(r.createdAt)}</span>
              <span>Заказ: {r.orderId.slice(-8)}</span>
              {r.customerId && <span>Заказчик: {r.customerId.slice(-8)}</span>}
              {r.contractorId && <span>Исполнитель: {r.contractorId.slice(-8)}</span>}
              <button
                disabled={closingId === r.id}
                onClick={() => onClose(r.id)}
                style={{ marginLeft: 'auto', padding: '0.25rem 0.625rem', borderRadius: '0.375rem', background: '#4ade8015', border: '1px solid #4ade8040', color: '#4ade80', cursor: closingId === r.id ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}
              >
                {closingId === r.id ? '...' : '✓ Закрыть спор'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
