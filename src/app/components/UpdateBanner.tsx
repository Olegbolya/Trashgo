import { useState, useEffect } from 'react';
import { isNative } from '../../lib/platform';

const APK_URL = 'https://github.com/Olegbolya/Trashgo-API/releases/latest/download/app-release.apk';

async function openApkUrl() {
  try {
    const { App } = await import('@capacitor/app');
    await App.openUrl({ url: APK_URL });
  } catch {
    window.open(APK_URL, '_blank');
  }
}

export function UpdateBanner() {
  const [show, setShow] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener('app:update_available', handler);
    return () => window.removeEventListener('app:update_available', handler);
  }, []);

  if (!isNative() || !show) return null;

  const handleUpdate = async () => {
    setDownloading(true);
    await openApkUrl();
    setDownloading(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top)',
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'linear-gradient(135deg, #2196F3, #1565C0)',
        color: 'white',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 2px 12px rgba(33,150,243,0.4)',
      }}
    >
      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🆕</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Вышла новая версия!</div>
        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Скачайте обновлённый APK</div>
      </div>
      <button
        onClick={handleUpdate}
        disabled={downloading}
        style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontWeight: 700, fontSize: '0.8rem', cursor: downloading ? 'not-allowed' : 'pointer', flexShrink: 0, fontFamily: 'inherit', opacity: downloading ? 0.7 : 1 }}
      >
        {downloading ? '...' : 'Скачать'}
      </button>
      <button
        onClick={() => setShow(false)}
        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0 0.25rem', flexShrink: 0, fontFamily: 'inherit' }}
      >
        ✕
      </button>
    </div>
  );
}
