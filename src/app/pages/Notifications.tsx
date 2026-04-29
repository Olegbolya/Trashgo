import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, CheckCheck, Trash2, MessageCircle, Package, Zap, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotificationsStore, type AppNotification } from '../../stores/notifications.store';

const ACCENT = '#2196F3';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

function typeLabel(type: AppNotification['type']): string {
  if (type === 'chat') return 'Сообщение';
  if (type === 'xp') return 'Опыт';
  return 'Заказ';
}

function typeColor(type: AppNotification['type']): string {
  if (type === 'chat') return '#4CAF50';
  if (type === 'xp') return '#FF9800';
  return ACCENT;
}

function typeIcon(type: AppNotification['type']) {
  if (type === 'chat') return MessageCircle;
  if (type === 'xp') return Zap;
  return Package;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { notifications, markRead, markAllRead, clearAll } = useNotificationsStore();

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  const unread = notifications.filter((n) => !n.read).length;

  const byDate = notifications.reduce<Record<string, AppNotification[]>>((acc, n) => {
    const d = new Date(n.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    let key: string;
    if (d.toDateString() === today.toDateString()) key = 'Сегодня';
    else if (d.toDateString() === yesterday.toDateString()) key = 'Вчера';
    else key = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-14" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Назад</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold" style={{ color: c.text }}>Уведомления</div>
              {unread > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#ef4444' }}>{unread}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    title="Прочитать все"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, padding: '4px', borderRadius: '8px' }}
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearAll}
                    title="Очистить всё"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, padding: '4px', borderRadius: '8px' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 py-3 max-w-2xl">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}12` }}>
              <Bell className="w-10 h-10" style={{ color: ACCENT, opacity: 0.5 }} />
            </div>
            <div className="text-center">
              <div className="text-base font-semibold mb-1" style={{ color: c.text }}>Нет уведомлений</div>
              <div className="text-sm" style={{ color: c.muted }}>Здесь будут появляться обновления по заказам и сообщения</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byDate).map(([date, items]) => (
              <div key={date}>
                <div className="text-xs font-semibold uppercase mb-2 px-1" style={{ color: c.muted }}>{date}</div>
                <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                  {items.map((n, i) => {
                    const Icon = typeIcon(n.type);
                    const color = typeColor(n.type);
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markRead(n.id);
                          if (n.orderId) navigate(`/order/${n.orderId}`);
                        }}
                        className="flex items-start gap-3 px-4 py-3"
                        style={{
                          borderBottom: i < items.length - 1 ? `1px solid ${c.border}` : 'none',
                          background: n.read ? 'transparent' : `${ACCENT}08`,
                          cursor: n.orderId ? 'pointer' : 'default',
                        }}
                      >
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}18` }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{ background: `${color}15`, color }}>
                              {typeLabel(n.type)}
                            </span>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#ef4444' }} />}
                          </div>
                          <div className="text-sm font-medium" style={{ color: c.text }}>{n.title}</div>
                          {n.message && <div className="text-xs mt-0.5" style={{ color: c.muted }}>{n.message}</div>}
                          <div className="text-[10px] mt-1" style={{ color: c.muted }}>{timeAgo(n.timestamp)}</div>
                        </div>

                        {/* Read icon */}
                        {n.read && (
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-1" style={{ color: c.border }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="text-center text-xs py-2" style={{ color: c.muted }}>
              Хранится последние 50 уведомлений
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
