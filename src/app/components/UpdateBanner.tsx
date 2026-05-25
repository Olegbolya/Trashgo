import { useState, useEffect } from 'react';
import { isNative } from '../../lib/platform';

export function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener('app:update_available', handler);
    return () => window.removeEventListener('app:update_available', handler);
  }, []);

  if (!isNative() || !show) return null;

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
        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Обновите приложение в Google Play</div>
      </div>
      <button
        onClick={() => setShow(false)}
        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit', flexShrink: 0 }}
      >
        Позже
      </button>
    </div>
  );
}
