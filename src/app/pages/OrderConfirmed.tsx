import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle2, Home, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function OrderConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const state = (location.state as { xpEarned?: number; address?: string } | null) ?? {};

  useEffect(() => {
    document.title = 'Заказ создан — TrashGo';
    return () => { document.title = 'TrashGo — Вывоз мусора в Казани'; };
  }, []);

  const bg      = isDark ? '#0f172a' : '#f9fafb';
  const surface = isDark ? '#1e293b' : '#ffffff';
  const border  = isDark ? '#334155' : '#e5e7eb';
  const text    = isDark ? '#f1f5f9' : '#111827';
  const muted   = isDark ? '#94a3b8' : '#6b7280';
  const green   = '#22c55e';

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ width: '5rem', height: '5rem', background: isDark ? '#0f2a1a' : '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 style={{ width: '3rem', height: '3rem', color: green }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: text, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Заказ создан!
          </h1>
          <p style={{ fontSize: '0.9rem', color: muted, lineHeight: 1.6 }}>
            {state.address
              ? `Заказ по адресу «${state.address}» опубликован. Исполнители уже ищут заявку.`
              : 'Ваш заказ опубликован. Исполнители уже начали присылать предложения.'}
          </p>
          {typeof state.xpEarned === 'number' && state.xpEarned > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginTop: '1rem', padding: '0.375rem 1rem', background: isDark ? '#0f2a1a' : '#dcfce7', color: isDark ? '#86efac' : '#15803d', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 }}>
              <Star style={{ width: '1rem', height: '1rem', fill: 'currentColor' }} />
              +{state.xpEarned} XP за новый заказ
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/customer')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            width: '100%', height: '3.25rem',
            borderRadius: '0.875rem', background: green,
            color: 'white', fontSize: '1rem', fontWeight: 700,
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Home style={{ width: '1.125rem', height: '1.125rem' }} />
          На главную
        </button>
      </div>
    </div>
  );
}
