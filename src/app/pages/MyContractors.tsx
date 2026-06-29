import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Star, MapPin, Package, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import { api } from '../../api/client';

const ACCENT = '#66BB6A';

interface MyContractor {
  id: string;
  name: string;
  district: string;
  transportMode: string;
  xp: number;
  level: number;
  avgRating: number | null;
  ordersCompleted: number;
}

const TRANSPORT_LABELS: Record<string, string> = {
  pedestrian: '🚶 Пешком',
  scooter: '🛴 Самокат',
  bicycle: '🚲 Велосипед',
  'e-bicycle': '⚡ Электровело',
  moto: '🏍 Мото',
  car: '🚗 Авто',
};

export default function MyContractors() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [contractors, setContractors] = useState<MyContractor[]>([]);
  const [loading, setLoading] = useState(true);

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  useEffect(() => {
    api.get<{ data: MyContractor[] }>('/users/my-contractors')
      .then(r => setContractors(r.data ?? []))
      .catch(() => toast.error('Не удалось загрузить исполнителей'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-14" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header className="sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-3">
          <div className="flex items-center h-12 gap-3">
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Назад</span>
            </button>
            <div className="text-sm font-semibold" style={{ color: c.text }}>Мои исполнители</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 py-4 max-w-2xl space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${c.border} ${c.border} ${c.border} ${ACCENT}` }} />
          </div>
        ) : contractors.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: c.surface, border: `2px dashed ${c.border}` }}>
            <User className="w-16 h-16 mx-auto mb-4" style={{ color: c.border }} />
            <div className="text-base font-medium mb-2" style={{ color: c.text }}>Нет исполнителей</div>
            <div className="text-sm mb-6" style={{ color: c.muted }}>
              Здесь будут исполнители, с которыми вы завершили хотя бы один заказ
            </div>
            <button
              onClick={() => navigate('/customer?tab=create')}
              style={{ padding: '0.625rem 1.25rem', borderRadius: '0.75rem', background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
            >
              Создать заказ
            </button>
          </div>
        ) : (
          <>
            <div className="text-sm mb-2" style={{ color: c.muted }}>{contractors.length} исполнителей, с которыми вы работали</div>
            {contractors.map(ct => (
              <div key={ct.id} className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: ACCENT }}>
                    {(ct.name || 'И').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-0.5" style={{ color: c.text }}>{ct.name || 'Исполнитель'}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ct.avgRating != null && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium" style={{ color: c.text }}>{ct.avgRating}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-0.5">
                        <Package className="w-3 h-3" style={{ color: c.muted }} />
                        <span className="text-xs" style={{ color: c.muted }}>{ct.ordersCompleted} заказов</span>
                      </div>
                      {ct.district && (
                        <div className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" style={{ color: c.muted }} />
                          <span className="text-xs" style={{ color: c.muted }}>{ct.district}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs" style={{ color: c.muted }}>{TRANSPORT_LABELS[ct.transportMode] ?? ct.transportMode}</span>
                      <span className="text-xs" style={{ color: c.muted }}>Уровень {ct.level}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/customer?tab=create')}
                    style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem', background: `${ACCENT}18`, border: `1px solid ${ACCENT}40`, color: ACCENT, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit', flexShrink: 0 }}
                  >
                    Заказать
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
