import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Star, MapPin, Package, ChevronRight } from 'lucide-react';
import { contractorsApi, type Contractor } from '../../api/contractors';
import { useAuthStore } from '../../stores/auth.store';
import { useRoleStore } from '../../stores/role.store';
import { toast } from 'sonner';

const TRANSPORT: Record<string, string> = {
  foot: '🚶',
  pedestrian: '🚶',
  scooter: '🛴',
  bicycle: '🚲',
  moto: '🏍️',
  car: '🚗',
  truck: '🚚',
};

const TRANSPORT_LABEL: Record<string, string> = {
  foot: 'Пешком',
  pedestrian: 'Пешком',
  scooter: 'Самокат',
  bicycle: 'Велосипед',
  moto: 'Мотоцикл',
  car: 'Машина',
  truck: 'Газель',
};

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getRankLabel(level: number): string {
  if (level >= 10) return '🏆 Эксперт';
  if (level >= 5)  return '⭐ Опытный';
  if (level >= 2)  return '🌱 Новичок';
  return '🌱';
}

type FilterType = 'all' | 'top-rated' | 'my-district';
type SortType = 'default' | 'rating' | 'orders';

export default function FindContractors() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const accent = useRoleStore(s => s.accentColor);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('default');

  useEffect(() => {
    contractorsApi.list()
      .then(res => setContractors(res.data ?? []))
      .catch(() => toast.error('Не удалось загрузить исполнителей'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = [...contractors.filter(c => {
    if (filterType === 'top-rated') return (c.avgRating ?? 0) >= 4.5;
    if (filterType === 'my-district') return c.district === user?.district;
    return true;
  })].sort((a, b) => {
    if (sortType === 'rating') return (b.avgRating ?? 0) - (a.avgRating ?? 0);
    if (sortType === 'orders') return b.completedOrders - a.completedOrders;
    return 0;
  });

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: `Все (${contractors.length})` },
    { key: 'top-rated', label: '⭐ Рейтинг 4.5+' },
    { key: 'my-district', label: '📍 Мой район' },
  ];

  const sortButtons: { key: SortType; label: string }[] = [
    { key: 'default', label: 'По умолч.' },
    { key: 'rating', label: '⭐ По рейтингу' },
    { key: 'orders', label: '📦 По заказам' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f9fafb', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', height: 52 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.9rem', fontFamily: 'inherit', marginRight: 'auto' }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Назад
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Исполнители</span>
          <div style={{ width: 80 }} />
        </div>
      </header>

      {/* Info banner */}
      <div style={{ background: `linear-gradient(135deg, ${accent} 0%, #1565C0 100%)`, color: '#fff', padding: '1.25rem 1rem' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 4 }}>Как заказать вывоз?</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9, lineHeight: 1.5 }}>
            Создайте заявку — исполнитель из вашего района примет её сам. Сервис работает как P2P: вы ставите задачу, они берутся.
          </div>
        </div>
      </div>

      {/* Filter + sort tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 52, zIndex: 40 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0.5rem 1rem 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {filterButtons.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit',
                border: 'none',
                background: filterType === f.key ? '#111827' : '#f3f4f6',
                color: filterType === f.key ? '#fff' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0.375rem 1rem 0.5rem', display: 'flex', gap: 6, overflowX: 'auto' }}>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'flex', alignItems: 'center', marginRight: 2 }}>Сортировка:</span>
          {sortButtons.map(s => (
            <button
              key={s.key}
              onClick={() => setSortType(s.key)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit',
                border: `1px solid ${sortType === s.key ? accent : '#e5e7eb'}`,
                background: sortType === s.key ? `${accent}15` : 'transparent',
                color: sortType === s.key ? accent : '#9ca3af',
                transition: 'all 0.15s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div style={{ width: 32, height: 32, border: `3px solid #e5e7eb`, borderTop: `3px solid ${accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '1rem', border: '2px dashed #e5e7eb', padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>👷</div>
            <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>
              {filterType === 'my-district' ? 'Исполнителей в вашем районе пока нет' : 'Нет исполнителей'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              {filterType !== 'all' ? 'Попробуйте убрать фильтр' : 'Исполнители появятся по мере регистрации'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(c => {
              const transport = TRANSPORT[c.transportMode] ?? '🚶';
              const transportLabel = TRANSPORT_LABEL[c.transportMode] ?? c.transportMode;
              const hasRating = c.avgRating !== null && c.ratingCount > 0;
              const isTopRated = (c.avgRating ?? 0) >= 4.5;
              const isMyDistrict = c.district === user?.district;

              return (
                <div
                  key={c.id}
                  style={{
                    background: '#fff',
                    border: `2px solid ${isMyDistrict ? accent + '40' : '#e5e7eb'}`,
                    borderRadius: '1rem',
                    padding: '1rem',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 48, height: 48, borderRadius: '0.75rem', flexShrink: 0,
                      background: `linear-gradient(135deg, ${accent}30, ${accent}60)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700, color: accent,
                    }}>
                      {getInitials(c.name)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{c.name}</span>
                        {isTopRated && (
                          <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.68rem', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>⭐ Топ</span>
                        )}
                        {isMyDistrict && (
                          <span style={{ background: `${accent}15`, color: accent, fontSize: '0.68rem', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>📍 Ваш район</span>
                        )}
                      </div>

                      {/* Rating + orders */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem', color: '#6b7280', marginBottom: 6, flexWrap: 'wrap' }}>
                        {hasRating ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Star style={{ width: 12, height: 12, color: '#f59e0b', fill: '#f59e0b' }} />
                            <span style={{ fontWeight: 700, color: '#111827' }}>{c.avgRating?.toFixed(1)}</span>
                            <span>({c.ratingCount})</span>
                          </span>
                        ) : (
                          <span style={{ color: '#d1d5db' }}>Нет оценок</span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Package style={{ width: 12, height: 12 }} />
                          {c.completedOrders} выполнено
                        </span>
                      </div>

                      {/* District + transport */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#9ca3af', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin style={{ width: 11, height: 11 }} />
                          {c.district || 'Район не указан'}
                        </span>
                        <span>{transport} {transportLabel}</span>
                        <span>{getRankLabel(c.level)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => navigate('/create-order', { state: { suggestedDistrict: c.district } })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      width: '100%', marginTop: '0.875rem', height: 40,
                      background: '#111827', color: '#fff',
                      border: 'none', borderRadius: '0.625rem', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit',
                    }}
                  >
                    Создать заказ в этом районе
                    <ChevronRight style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Info block */}
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.875rem', padding: '1rem', marginTop: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0369a1', marginBottom: 6 }}>ℹ️ Как работает P2P-сервис</div>
          <ul style={{ fontSize: '0.8rem', color: '#0c4a6e', lineHeight: 1.7, margin: 0, paddingLeft: '1rem' }}>
            <li>Создайте заявку с адресом и ценой</li>
            <li>Исполнитель из вашего района принимает её сам</li>
            <li>После выполнения подтвердите и оставьте оценку</li>
          </ul>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
