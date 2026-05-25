import { PushNotifications } from '@capacitor/push-notifications';
import { isNative } from '../lib/platform';
import { api } from '../api/client';

// Listeners are added once per app session; register() is called every time to refresh token
let listenersAdded = false;

export async function registerNativePush() {
  if (!isNative()) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  // Create channel required for Android 8+ (idempotent — Android ignores if already exists)
  try {
    await PushNotifications.createChannel({
      id: 'trashgo_default',
      name: 'TrashGo уведомления',
      description: 'Уведомления о заказах и чате',
      importance: 5,  // IMPORTANCE_HIGH
      visibility: 1,  // VISIBILITY_PUBLIC
      vibration: true,
      lights: true,
    });
  } catch (e) {
    console.warn('[NativePush] createChannel failed:', e);
  }

  // Always register so FCM token is refreshed if it was rotated or cleared by server
  await PushNotifications.register();

  if (listenersAdded) return;
  listenersAdded = true;

  PushNotifications.addListener('registration', async ({ value: token }) => {
    try {
      await api.patch('/users/me', { fcmToken: token });
    } catch {}
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('[NativePush] registration error', err);
  });

  // When push arrives while app is in foreground — relay to notification store via DOM event
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    window.dispatchEvent(new CustomEvent('push:foreground', { detail: notification }));
  });

  PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
    const data = notification.data ?? {};
    let path: string | null = null;
    if (data.orderId) {
      path = `/order/${data.orderId}`;
    } else if (data.url) {
      try {
        path = new URL(data.url).pathname;
      } catch {
        path = data.url.startsWith('/') ? data.url : null;
      }
    }
    if (path) {
      history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    }
  });
}
