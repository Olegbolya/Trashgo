import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { PackagePlus, Coins } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SelectRole() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const phone = location.state?.phone || '';
  const verifiedCode = location.state?.verifiedCode || '';

  useEffect(() => {
    document.title = 'Выберите роль — TrashGo';
    return () => { document.title = 'TrashGo — Вывоз мусора в Казани'; };
  }, []);

  const c = {
    bg:      isDark ? '#0f172a' : '#f9fafb',
    surface: isDark ? '#1e293b' : '#ffffff',
    border:  isDark ? '#334155' : '#e5e7eb',
    text:    isDark ? '#f1f5f9' : '#111827',
    muted:   isDark ? '#94a3b8' : '#6b7280',
    listText: isDark ? '#cbd5e1' : '#4b5563',
  };

  const selectRole = (role: 'customer' | 'contractor') => {
    const state = { phone, verifiedCode, role };
    if (role === 'customer') {
      navigate('/register-customer', { state });
    } else {
      navigate('/register-contractor', { state });
    }
  };

  const cardStyle = (hoverColor: string): React.CSSProperties => ({
    background: c.surface,
    border: `2px solid ${c.border}`,
    borderRadius: '1.5rem',
    padding: '2rem',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  });

  return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: c.text, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Выберите роль
          </h1>
          <p style={{ fontSize: '0.9rem', color: c.muted }}>
            Вы сможете изменить это позже в настройках
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

          {/* Customer */}
          <button onClick={() => selectRole('customer')} style={cardStyle('#ef4444')}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(239,68,68,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = c.border; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
          >
            <div style={{ width: '4rem', height: '4rem', background: isDark ? '#3f1a1a' : '#fee2e2', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <PackagePlus style={{ width: '2rem', height: '2rem', color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: c.text, marginBottom: '0.75rem' }}>Заказчик</h2>
            <p style={{ fontSize: '0.9rem', color: c.muted, marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Создавайте заказы на вывоз мусора и выбирайте исполнителей
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Создание заказов', 'Выбор исполнителя', 'Реферальная программа'].map(item => (
                <li key={item} style={{ fontSize: '0.875rem', color: c.listText, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ef4444' }}>•</span> {item}
                </li>
              ))}
            </ul>
          </button>

          {/* Contractor */}
          <button onClick={() => selectRole('contractor')} style={cardStyle('#22c55e')}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#22c55e'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(34,197,94,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = c.border; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
          >
            <div style={{ width: '4rem', height: '4rem', background: isDark ? '#0f2a1a' : '#dcfce7', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Coins style={{ width: '2rem', height: '2rem', color: '#22c55e' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: c.text, marginBottom: '0.75rem' }}>Исполнитель</h2>
            <p style={{ fontSize: '0.9rem', color: c.muted, marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Выполняйте заказы и зарабатывайте в удобное время
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Поиск заказов рядом', 'Гибкий график', 'Подписки на адреса'].map(item => (
                <li key={item} style={{ fontSize: '0.875rem', color: c.listText, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#22c55e' }}>•</span> {item}
                </li>
              ))}
            </ul>
          </button>
        </div>
      </div>
    </div>
  );
}
