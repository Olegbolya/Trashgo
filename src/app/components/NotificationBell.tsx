import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Bell, X, Trash2, CheckCheck, MessageCircle, Package, Zap } from 'lucide-react';
import { useNotificationsStore, type AppNotification } from '../../stores/notifications.store';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

function NotifIcon({ type }: { type: AppNotification['type'] }) {
  if (type === 'chat') return <MessageCircle className="w-4 h-4" />;
  if (type === 'xp') return <Zap className="w-4 h-4" />;
  return <Package className="w-4 h-4" />;
}

interface Props {
  accentColor: string;
}

export function NotificationBell({ accentColor }: Props) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { notifications, markAllRead, clearAll, markRead } = useNotificationsStore();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleNotifClick = (n: AppNotification) => {
    markRead(n.id);
    setOpen(false);
    if (n.type === 'xp') {
      navigate(user?.role === 'contractor' ? '/contractor?tab=profile' : '/customer?tab=profile');
    } else if (n.orderId) {
      navigate(`/order/${n.orderId}`);
    } else {
      navigate('/notifications');
    }
  };

  const c = {
    surface: isDark ? '#1e2433' : '#ffffff',
    border: isDark ? '#374151' : '#e5e7eb',
    text: isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted: isDark ? '#9ca3af' : '#6b7280',
    subtle: isDark ? '#1f2937' : '#f9fafb',
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
        style={{
          background: open ? `${accentColor}18` : 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: open ? accentColor : c.muted,
        }}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
            style={{ background: '#ef4444' }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-11 w-80 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
          style={{ background: c.surface, border: `1px solid ${c.border}` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
            <div className="font-semibold text-sm" style={{ color: c.text }}>
              Уведомления {unread > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] text-white" style={{ background: '#ef4444' }}>{unread}</span>}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    title="Прочитать все"
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.muted }}
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearAll}
                    title="Очистить"
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.muted }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.muted }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ color: c.muted }}>
                <Bell className="w-8 h-8 opacity-30" />
                <span className="text-sm">Нет уведомлений</span>
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className="flex items-start gap-3 px-4 py-3 transition-colors"
                  style={{
                    borderBottom: `1px solid ${c.border}`,
                    background: n.read ? 'transparent' : `${accentColor}0c`,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${accentColor}18`, color: accentColor }}
                  >
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: c.text }}>{n.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>{n.message}</div>
                    <div className="text-[10px] mt-1" style={{ color: c.muted }}>{timeAgo(n.timestamp)}</div>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: accentColor }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer link */}
          <button
            onClick={() => { setOpen(false); navigate('/notifications'); }}
            className="w-full py-2.5 text-xs font-semibold text-center"
            style={{ background: 'none', border: 'none', borderTop: `1px solid ${c.border}`, cursor: 'pointer', color: accentColor, fontFamily: 'inherit' }}
          >
            Все уведомления →
          </button>
        </div>
      )}
    </div>
  );
}
