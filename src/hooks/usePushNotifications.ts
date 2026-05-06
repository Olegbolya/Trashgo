import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { getFcmToken } from '../lib/firebase';
import { api } from '../api/client';

// Registers FCM push notifications once the user is authenticated.
// Sends the token to the backend via PATCH /users/me so the server
// can deliver push when the user has no active SSE connection.
export function usePushNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || registeredRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const token = await getFcmToken();
        if (!token || cancelled) return;
        await api.patch('/users/me', { fcmToken: token });
        registeredRef.current = true;
      } catch {
        // Non-fatal — app works fine without push notifications
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);
}
