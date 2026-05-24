import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { getFcmToken } from '../lib/firebase';
import { api } from '../api/client';
import { isNative } from '../lib/platform';

// On native (Android/iOS), push is handled by NativeBootstrap via registerNativePush.
// On web, use Firebase Web Messaging SDK.
export function usePushNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || registeredRef.current || isNative()) return;

    let cancelled = false;
    (async () => {
      try {
        const token = await getFcmToken();
        if (!token || cancelled) return;
        await api.patch('/users/me', { fcmToken: token });
        registeredRef.current = true;
      } catch {
        // Non-fatal
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);
}
