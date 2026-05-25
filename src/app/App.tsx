import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes.tsx';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import { useAuthStore } from '../stores/auth.store';
import { connectSSE } from '../services/sse';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { InstallBanner } from './components/InstallBanner';
import { CookieBanner } from './components/CookieBanner';
import { UpdateBanner } from './components/UpdateBanner';
import { useAndroidUpdateCheck } from '../hooks/useAndroidUpdateCheck';
import { isNative } from '../lib/platform';
import { handleNativeBack } from '../lib/nativeBack';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function SSEConnector() {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && token) connectSSE(token);
  }, [isAuthenticated, token]);

  // Reconnect SSE when app returns from background (native only)
  useEffect(() => {
    if (!isNative()) return;
    let cleanup: (() => void) | undefined;
    (async () => {
      const { App: CapApp } = await import('@capacitor/app');
      const handle = await CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive && isAuthenticated && token) connectSSE(token);
      });
      cleanup = () => handle.remove();
    })();
    return () => cleanup?.();
  }, [isAuthenticated, token]);

  usePushNotifications();
  return null;
}

// Keeps the Android status bar background/icon style in sync with the app theme.
function NativeStatusBarSync() {
  const { isDark } = useTheme();
  useEffect(() => {
    if (!isNative()) return;
    (async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        if (isDark) {
          await StatusBar.setStyle({ style: Style.Light });       // white icons
          await StatusBar.setBackgroundColor({ color: '#111827' }); // dark bg
        } else {
          await StatusBar.setStyle({ style: Style.Dark });        // dark icons
          await StatusBar.setBackgroundColor({ color: '#ffffff' }); // white bg
        }
      } catch {}
    })();
  }, [isDark]);
  return null;
}

function NativeUpdateCheck() {
  useAndroidUpdateCheck();
  return null;
}

function NativeBootstrap() {
  useEffect(() => {
    if (!isNative()) return;
    (async () => {
      try {
        // Back button — check modal stack first, then history, then exit
        const { App: CapApp } = await import('@capacitor/app');
        CapApp.addListener('backButton', ({ canGoBack }) => {
          if (handleNativeBack()) return;
          if (canGoBack) window.history.back();
          else CapApp.exitApp();
        });

        // Native push
        const { registerNativePush } = await import('../hooks/useNativePush');
        await registerNativePush();

        // Hide splash
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch (e) {
        console.error('[NativeBootstrap]', e);
      }
    })();
  }, []);
  return null;
}

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#ef4444', color: 'white', textAlign: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500 }}>
      Нет соединения с интернетом
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SSEConnector />
        <NativeStatusBarSync />
        <NativeBootstrap />
        <NativeUpdateCheck />
        <UpdateBanner />
        <OfflineBanner />
        {!isNative() && <InstallBanner />}
        <CookieBanner />
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
