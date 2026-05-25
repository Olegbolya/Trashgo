import { PushNotifications } from '@capacitor/push-notifications';
import { isNative } from '../lib/platform';
import { api } from '../api/client';

let registered = false;

export async function registerNativePush() {
  if (!isNative() || registered) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  // Create notification channel required for Android 8+
  try {
    await (PushNotifications as any).createChannel({
      id: 'trashgo_default',
      name: 'TrashGo уведомления',
      description: 'Уведомления о заказах и чате',
      importance: 5,
      visibility: 1,
      sound: 'default',
      vibration: true,
      lights: true,
    });
  } catch { /* channel API may not exist on older plugin versions */ }

  await PushNotifications.register();
  registered = true;

  PushNotifications.addListener('registration', async ({ value: token }) => {
    try {
      await api.patch('/users/me', { fcmToken: token });
    } catch {}
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('[NativePush] registration error', err);
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
