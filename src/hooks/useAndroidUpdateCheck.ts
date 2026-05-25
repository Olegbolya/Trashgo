import { useEffect } from 'react';
import { isNative } from '../lib/platform';
import { API_BASE_URL } from '../api/client';

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
          // Dispatch event — UpdateBanner listens and renders in-app notification
          window.dispatchEvent(new CustomEvent('app:update_available', { detail: { latestBuild } }));
        }
      } catch { /* silently ignore — non-critical */ }
    })();
  }, []);
}
