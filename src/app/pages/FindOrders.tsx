import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, Package, Zap, RefreshCw, Sparkles } from 'lucide-react';
import { ordersApi } from '../../api/orders';
import { useAuthStore } from '../../stores/auth.store';
import { useRoleStore } from '../../stores/role.store';
import type { Order } from '../../types/order';
import { toast } from 'sonner';

const ACCENT = '#2196F3';

function scoreOrder(order: Order, userDistrict: string): number {
  let score = 0;
  if (order.district && order.district === userDistrict) score += 30;
  score += order.price / 10;
  const ageHours = (Date.now() - new Date(order.createdAt).getTime()) / 3_600_000;
  score -= Math.min(ageHours, 24);
  if (order.asap) score += 20;
  return score;
}

function formatTime(order: Order): string {
  if (order.asap) return 'Срочно';
  if (!order.scheduledAt) return 'Без времени';
  const d = new Date(order.scheduledAt);
  const today = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return d.toDateString() === today.toDateString()
    ? `Сегодня ${h}:${m}`
    : `${d.getDate()}.${(d.getMonth() + 1).toString().padStart(2, '0')} ${h}:${m}`;
}

function formatAge(createdAt: string): string {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  return `${Math.floor(mins / 60)} ч назад`;
}

type SortType = 'smart' | 'price_asc' | 'price_desc';
type FilterType = 'all' | 'asap' | 'normal';

export default function FindOrders() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const accentColor = useRoleStore(s => s.accentColor);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortType, setSortType] = useState<SortType>(() => {
    try { return (localStorage.getItem('find_orders_sort') as SortType) || 'smart'; } catch { return 'smart'; }
  });
  const [filterType, setFilterType] = useState<FilterType>(() => {
    try { return (localStorage.getItem('find_orders_filter') as FilterType) || 'all'; } catch { return 'all'; }
  });

  const updateSort = (v: SortType) => { setSortType(v); try { localStorage.setItem('find_orders_sort', v); } catch {} };
  const updateFilter = (v: FilterType) => { setFilterType(v); try { localStorage.setItem('find_orders_filter', v); } catch {} };
  const [accepting, setAccepting] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const userDistrict = user?.district ?? '';

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await ordersApi.available();
      setOrders(res.data ?? []);
    } catch {
      if (!silent) toast.error('Не удалось загрузить заказы');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleAccept = async (orderId: string) => {
    if (accepting) return;
    setAccepting(orderId);
    try {
      await ordersApi.accept(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      navigate(`/order/${orderId}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Не удалось принять заказ');
      setAccepting(null);
    }
  };

  const sorted = [...orders]
    .sort((a, b) => {
      if (sortType === 'smart') return scoreOrder(b, userDistrict) - scoreOrder(a, userDistrict);
      if (sortType === 'price_asc') return a.price - b.price;
      return b.price - a.price;
    })
    .filter(o =>
      filterType === 'all' ||
      (filterType === 'asap' ? o.asap : !o.asap)
    );

  const potentialEarnings = sorted.reduce((s, o) => s + o.price, 0);

  return (
    <div className="min-h-screen" style={{ background: '#f9fafb', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.9rem', fontFamily: 'inherit' }}>
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Назад
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Найти заказы</span>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, opacity: refreshing ? 0.5 : 1 }}
          >
            <RefreshCw style={{ width: 18, height: 18, animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>

        {/* Summary card */}
        <div style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #1565C0 100%)`, borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: 2 }}>Потенциальный заработок</div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{potentialEarnings}₽</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                {sorted.length} {sorted.length === 1 ? 'заказ' : sorted.length < 5 ? 'заказа' : 'заказов'}
                {userDistrict ? ` · ${userDistrict}` : ''}
              </div>
            </div>
            <div style={{ fontSize: '2.5rem' }}>📦</div>
          </div>
        </div>

        {/* Sort + Filter tabs */}
        <div style={{ background: '#fff', borderRadius: '0.875rem', border: '1px solid #e5e7eb', padding: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af', alignSelf: 'center' }}>Сортировка:</span>
            {([
              { key: 'smart' as SortType, label: '✨ Умный' },
              { key: 'price_desc' as SortType, label: '↓ Цена' },
              { key: 'price_asc' as SortType, label: '↑ Цена' },
            ] as { key: SortType; label: string }[]).map(s => (
              <button
                key={s.key}
                onClick={() => updateSort(s.key)}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  background: sortType === s.key ? accentColor : '#f3f4f6',
                  color: sortType === s.key ? '#fff' : '#6b7280',
                  border: 'none', fontFamily: 'inherit',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af', alignSelf: 'center' }}>Фильтр:</span>
            {([
              { key: 'all' as FilterType, label: `Все (${orders.length})` },
              { key: 'asap' as FilterType, label: `⚡ Срочные (${orders.filter(o => o.asap).length})` },
              { key: 'normal' as FilterType, label: `Обычные (${orders.filter(o => !o.asap).length})` },
            ] as { key: FilterType; label: string }[]).map(f => (
              <button
                key={f.key}
                onClick={() => updateFilter(f.key)}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  background: filterType === f.key ? '#111827' : '#f3f4f6',
                  color: filterType === f.key ? '#fff' : '#6b7280',
                  border: 'none', fontFamily: 'inherit',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <div style={{ width: 32, height: 32, border: `3px solid #e5e7eb`, borderTop: `3px solid ${accentColor}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '1rem', border: '2px dashed #e5e7eb', padding: '3rem 1.5rem', textAlign: 'center' }}>
            <Package style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: 4 }}>Нет доступных заказов</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              {filterType !== 'all' ? 'Попробуйте убрать фильтр' : 'Новые заказы появляются регулярно'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sorted.map((order, idx) => {
              const isTop = sortType === 'smart' && idx === 0 && sorted.length > 1;
              const isSameDistrict = order.district === userDistrict && !!userDistrict;
              const isAsap = order.asap;
              const cardBorder = isAsap ? '#fb923c' : isTop ? accentColor : '#e5e7eb';
              const cardBg = isAsap ? '#fff7ed' : isTop ? `${accentColor}08` : '#fff';
              const priceColor = isAsap ? '#ea580c' : accentColor;
              const isAccepting = accepting === order.id;

              return (
                <div key={order.id} style={{ background: cardBg, border: `2px solid ${cardBorder}`, borderRadius: '1rem', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem' }}>
                    {/* Badges row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: isAsap ? '#f97316' : '#22c55e', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{formatAge(order.createdAt)}</span>
                      {isAsap && <span style={{ background: '#f97316', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>⚡ Срочно</span>}
                      {isTop && !isAsap && <span style={{ background: accentColor, color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles style={{ width: 10, height: 10 }} />Лучшее</span>}
                      {isSameDistrict && !isTop && <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>Ваш район</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Address */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <MapPin style={{ width: 14, height: 14, color: '#9ca3af', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {order.address}
                          </span>
                        </div>

                        {/* Meta row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem', color: '#6b7280', marginBottom: 6 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock style={{ width: 12, height: 12 }} />
                            {formatTime(order)}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Package style={{ width: 12, height: 12 }} />
                            {order.volume} м³
                          </span>
                          {order.district && <span>{order.district}</span>}
                        </div>

                        {order.description && (
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {order.description}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: priceColor, lineHeight: 1 }}>+{order.price}₽</div>
                      </div>
                    </div>

                    {/* Accept button */}
                    <button
                      onClick={() => handleAccept(order.id)}
                      disabled={!!accepting}
                      style={{
                        display: 'block', width: '100%', marginTop: 12, height: 42,
                        background: isAccepting ? '#9ca3af' : (isAsap ? '#f97316' : '#111827'),
                        color: '#fff', borderRadius: '0.625rem', border: 'none',
                        fontWeight: 700, fontSize: '0.875rem', cursor: accepting ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', opacity: accepting && !isAccepting ? 0.5 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      {isAccepting ? '⏳ Принимаем...' : '✓ Взять заказ'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#d1d5db', padding: '1.5rem 0 0.5rem' }}>
          Обновляется каждые 15 секунд
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
