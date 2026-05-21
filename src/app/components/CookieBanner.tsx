import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie_accepted')) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_accepted', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#1e2433',
        borderTop: '1px solid #374151',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <p style={{ color: '#d1d5db', fontSize: '0.85rem', flex: 1, minWidth: 220, margin: 0 }}>
        Мы используем <strong style={{ color: '#fff' }}>файлы cookie</strong> (localStorage) для хранения токена сессии и настроек темы. Никаких рекламных трекеров.{' '}
        <a href="/privacy" style={{ color: '#66BB6A', textDecoration: 'underline' }}>Политика конфиденциальности</a>
      </p>
      <button
        onClick={accept}
        style={{
          background: '#66BB6A',
          color: '#fff',
          border: 'none',
          borderRadius: '0.625rem',
          padding: '0.5rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
        }}
      >
        Принять
      </button>
    </div>
  );
}
