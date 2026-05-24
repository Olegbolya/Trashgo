import { PushNotifications } from '@capacitor/push-notifications';
import { isNative } from '../lib/platform';
import { api } from '../api/client';

let registered = false;

export async function registerNativePush() {
  if (!isNative() || registered) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

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
    if (data.orderId) {
      window.location.href = `/order/${data.orderId}`;
    } else if (data.url) {
      window.location.href = data.url;
    }
  });
}
