import { useEffect } from 'react';
import { isNative } from '../lib/platform';
import { API_BASE_URL } from '../api/client';
import { api } from '../api/client';

export function useAndroidUpdateCheck() {
  useEffect(() => {
    if (!isNative()) return;

    (async () => {
      try {
        const { App } = await import('@capacitor/app');
        const info = await App.getInfo();
        const currentBuild = parseInt(info.build, 10);

        const res = await fetch(`${API_BASE_URL}/version`);
        if (!res.ok) return;
        const { latestBuild } = await res.json();

        if (latestBuild > currentBuild) {
          // Show in-app banner
          window.dispatchEvent(new CustomEvent('app:update_available', { detail: { latestBuild } }));
          // Also send a system push notification via server so it appears in the notification shade
          try { await api.post('/users/me/update-push'); } catch { /* non-critical */ }
        }
      } catch { /* silently ignore — non-critical */ }
    })();
  }, []);
}
