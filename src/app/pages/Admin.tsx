import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api/v1';

interface Stats {
  users: number;
  frozenUsers: number;
  orders: Record<string, number>;
  revenue: number;
  disputes: number;
  paymentDisputes: number;
  recentOrders: number;
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

type Tab = 'stats' | 'frozen' | 'disputes' | 'payment' | 'users';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [secretInput, setSecretInput] = useState('');
  const secret = searchParams.get('secret') ?? '';

  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [frozen, setFrozen] = useState<FrozenUser[]>([]);
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [paymentDisputes, setPaymentDisputes] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unfreezing, setUnfreezing] = useState<string | null>(null);
  const [freezing, setFreezing] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<UserRow[]>([]);
  const [userOrders, setUserOrders] = useState<{ userId: string; orders: UserOrder[] } | null>(null);
  const [closingDispute, setClosingDispute] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiFetch = useCallback(async (path: string, opts?: RequestInit) => {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${API_URL}${path}${secret ? `${sep}secret=${encodeURIComponent(secret)}` : ''}`;
    const res = await fetch(url, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
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

  useEffect(() => {
    if (!secret) return;
    if (tab === 'stats') loadStats();
    else if (tab === 'frozen') loadFrozen();
    else if (tab === 'disputes' || tab === 'payment') loadDisputes();
  }, [tab, secret, loadStats, loadFrozen, loadDisputes]);

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

  const handleFreeze = async (id: string) => {
    const reason = prompt('Причина заморозки:');
    if (!reason) return;
    setFreezing(id);
    try {
      await apiFetch(`/admin/freeze/${id}`, { method: 'POST', body: JSON.stringify({ reason }) });
      setUserResults(prev => prev.map(u => u.id === id ? { ...u, frozen: true, freezeReason: reason } : u));
    } catch (e: any) { setError(e.message); }
    finally { setFreezing(null); }
  };

  const handleUserSearch = (q: string) => {
    setUserSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setUserResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await apiFetch(`/admin/users?phone=${encodeURIComponent(q.trim())}`);
        setUserResults(r.data);
      } catch (e: any) { setError(e.message); }
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
            onKeyDown={e => { if (e.key === 'Enter' && secretInput.trim()) setSearchParams({ secret: secretInput.trim() }); }}
            placeholder="ADMIN_SECRET"
            style={{ width: '100%', height: '2.75rem', padding: '0 0.875rem', borderRadius: '0.625rem', border: `1.5px solid ${border}`, background: bg, color: text, fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '0.75rem' }}
            autoFocus
          />
          <button
            onClick={() => { if (secretInput.trim()) setSearchParams({ secret: secretInput.trim() }); }}
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
          onClick={() => setSearchParams({})}
          style={{ background: 'none', border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '0.375rem 0.75rem', color: muted, cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit' }}
        >
          Выйти
        </button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {([['stats', '📊 Статистика'], ['users', '👤 Пользователи'], ['frozen', '🔒 Замороженные'], ['disputes', '⚠️ Споры'], ['payment', '💸 Платёжные споры']] as [Tab, string][]).map(([id, label]) => (
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
              <StatCard label="Выручка (₽)" value={`${stats.revenue.toLocaleString('ru-RU')}₽`} accent="#4ade80" />
              <StatCard label="Споры" value={stats.disputes} accent={stats.disputes > 0 ? '#facc15' : undefined} />
              <StatCard label="Платёж. споры" value={stats.paymentDisputes} accent={stats.paymentDisputes > 0 ? '#f87171' : undefined} />
              <StatCard label="За 7 дней" value={stats.recentOrders} />
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
            {userResults.length === 0 && userSearch.trim() && (
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
                      {u.frozen ? (
                        <button disabled={unfreezing === u.id} onClick={() => handleUnfreeze(u.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: '#4ade8015', border: '1px solid #4ade8040', color: '#4ade80', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                          {unfreezing === u.id ? '...' : '🔓 Разморозить'}
                        </button>
                      ) : (
                        <button disabled={freezing === u.id} onClick={() => handleFreeze(u.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: '#f9731615', border: '1px solid #f9731640', color: '#f97316', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                          {freezing === u.id ? '...' : '🔒 Заморозить'}
                        </button>
                      )}
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
                </div>
              ))}
            </div>
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
