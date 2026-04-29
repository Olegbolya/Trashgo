import { useNotificationsStore } from '../stores/notifications.store';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://api-production-8470.up.railway.app';

let es: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 3000;

export function connectSSE(token: string) {
  if (es) return; // already connected

  const url = `${API_BASE}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`;
  es = new EventSource(url);

  es.addEventListener('message', (e) => {
    if (!e.data) return;
    try {
      const event = JSON.parse(e.data) as { type: string; title?: string; message?: string; orderId?: string };
      if (event.type === 'connected') {
        reconnectDelay = 3000; // reset backoff on success
        return;
      }
      if (event.type === 'order_status' || event.type === 'chat' || event.type === 'xp') {
        const { addNotification } = useNotificationsStore.getState();
        addNotification({
          type: event.type as 'order_status' | 'chat' | 'xp',
          title: event.title ?? 'Обновление',
          message: event.message ?? '',
          orderId: event.orderId,
        });
        // Show toast for incoming notifications
        toast(event.title ?? 'Уведомление', {
          description: event.message,
          duration: 4000,
        });
      }
    } catch { /* ignore parse errors */ }
  });

  es.addEventListener('ping', () => { /* heartbeat — keep alive */ });

  es.onerror = () => {
    es?.close();
    es = null;
    // Exponential backoff reconnect
    reconnectTimer = setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, 60000);
      connectSSE(token);
    }, reconnectDelay);
  };
}

export function disconnectSSE() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  es?.close();
  es = null;
  reconnectDelay = 3000;
}
