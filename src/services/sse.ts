import { useNotificationsStore } from '../stores/notifications.store';
import { toast } from 'sonner';

// Derive server base (strip /api/v1 suffix if present) for the SSE endpoint which includes its own path
const RAW_API_URL = import.meta.env.VITE_API_URL ?? 'https://api-production-8470.up.railway.app/api/v1';
const SSE_BASE = RAW_API_URL.replace(/\/api\/v1\/?$/, '');

let es: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 3000;

function getCurrentToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch { return null; }
}

export function connectSSE(token: string) {
  if (es?.readyState === EventSource.CLOSED) { es = null; }
  if (es) return;

  const url = `${SSE_BASE}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`;
  es = new EventSource(url);

  es.addEventListener('message', (e) => {
    if (!e.data) return;
    try {
      const event = JSON.parse(e.data) as { type: string; title?: string; message?: string; orderId?: string; icon?: string; xp?: number; id?: string };
      if (event.type === 'connected') {
        reconnectDelay = 3000;
        return;
      }
      if (event.type === 'achievement_unlocked') {
        toast(`${event.icon ?? '🏆'} ${event.title ?? 'Достижение разблокировано!'}`, {
          description: `+${event.xp} XP`,
          duration: 5000,
        });
        window.dispatchEvent(new CustomEvent('sse:achievement_unlocked', { detail: { id: event.id } }));
        return;
      }
      if (event.type === 'order_status' || event.type === 'chat' || event.type === 'xp') {
        const { addNotification, settings } = useNotificationsStore.getState();
        // Respect user push preferences (task 27)
        if (event.type === 'order_status' && settings && !settings.pushOrderStatus) return;
        if (event.type === 'chat' && settings && !settings.pushChat) return;
        if (event.type === 'xp' && settings && !settings.pushXP) return;

        addNotification({
          type: event.type as 'order_status' | 'chat' | 'xp',
          title: event.title ?? 'Обновление',
          message: event.message ?? '',
          orderId: event.orderId,
        });
        toast(event.title ?? 'Уведомление', {
          description: event.message,
          duration: 4000,
          action: event.orderId
            ? { label: 'Открыть', onClick: () => {
                history.pushState(null, '', `/order/${event.orderId}`);
                window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
              }}
            : undefined,
        });

        // Notify open chat windows to refresh instantly (no polling delay)
        if (event.type === 'chat' && event.orderId) {
          window.dispatchEvent(new CustomEvent('sse:chat', { detail: { orderId: event.orderId } }));
        }
      }
    } catch { /* ignore parse errors */ }
  });

  es.addEventListener('ping', () => { /* heartbeat — keep alive */ });

  es.onerror = () => {
    es?.close();
    es = null;
    // Use the freshest token from localStorage on reconnect (task 31 — prevents stale-token logout)
    reconnectTimer = setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, 60000);
      const freshToken = getCurrentToken();
      if (freshToken) connectSSE(freshToken);
    }, reconnectDelay);
  };
}

export function disconnectSSE() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  es?.close();
  es = null;
  reconnectDelay = 3000;
}
