import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const DISMISSED_KEY = 'trashgo_pwa_dismissed';

export function InstallBanner() {
  const { isDark } = useTheme();
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    if (standalone) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios) { setIsIos(true); setShow(true); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') dismiss();
    deferredPrompt = null;
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setShow(false);
  };

  if (!show) return null;

  const bg = isDark ? '#1e293b' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.10)' : '#e5e7eb';
  const text = isDark ? '#ffffff' : '#111827';
  const muted = isDark ? 'rgba(255,255,255,0.5)' : '#6b7280';

  return (
    <div style={{
      position: 'fixed', bottom: '5rem', left: '1rem', right: '1rem',
      background: bg, border: `1px solid ${border}`, borderRadius: '1rem',
      padding: '1rem', zIndex: 9998,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <img src="/icon-72.png" alt="TrashGo" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: text, marginBottom: '0.2rem' }}>
          Добавить TrashGo на экран
        </div>
        {isIos ? (
          <div style={{ fontSize: '0.78rem', color: muted, lineHeight: 1.4 }}>
            Нажмите <strong style={{ color: text }}>⎙</strong> внизу Safari, затем «На экран "Домой"»
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: muted }}>
            Быстрый доступ без браузера
          </div>
        )}
        {!isIos && (
          <button
            onClick={handleInstall}
            style={{
              marginTop: '0.6rem', padding: '0.4rem 1rem',
              background: '#66BB6A', color: 'white',
              border: 'none', borderRadius: '0.5rem',
              fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Установить
          </button>
        )}
      </div>
      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: '1.25rem', padding: '0 0.25rem', lineHeight: 1, flexShrink: 0 }}
        aria-label="Закрыть"
      >
        ×
      </button>
    </div>
  );
}
