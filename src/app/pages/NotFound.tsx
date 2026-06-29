import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    document.title = 'Страница не найдена — TrashGo';
    return () => { document.title = 'TrashGo — Вывоз мусора в Казани'; };
  }, []);

  const bg      = isDark ? '#0f172a' : '#f9fafb';
  const surface = isDark ? '#1e293b' : '#ffffff';
  const border  = isDark ? '#334155' : '#e5e7eb';
  const text    = isDark ? '#f1f5f9' : '#111827';
  const muted   = isDark ? '#94a3b8' : '#6b7280';
  const accent  = '#22a849';

  return (
    <div style={{
      minHeight: '100vh', background: bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', fontWeight: 900, color: accent, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '1rem' }}>
          404
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: text, marginBottom: '0.5rem' }}>
          Страница не найдена
        </h1>
        <p style={{ fontSize: '0.9rem', color: muted, marginBottom: '2rem', lineHeight: 1.6 }}>
          К сожалению, такой страницы не существует. Возможно, ссылка устарела или была удалена.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%', padding: '0.75rem 1.5rem', borderRadius: '0.875rem',
              background: accent, color: '#fff', fontSize: '0.9375rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            На главную
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '100%', padding: '0.75rem 1.5rem', borderRadius: '0.875rem',
              background: surface, color: muted, fontSize: '0.9375rem', fontWeight: 600,
              border: `1px solid ${border}`, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
