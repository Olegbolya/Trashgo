import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { PackagePlus, Coins } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ROLE_COLORS } from '../../stores/role.store';

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
    const email = (location.state?.email as string | undefined) || '';
    const state = { email, phone, verifiedCode, role };
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
          <button onClick={() => selectRole('customer')} style={cardStyle(ROLE_COLORS.customer)}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ROLE_COLORS.customer; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px ${ROLE_COLORS.customer}30`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = c.border; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
          >
            <div style={{ width: '4rem', height: '4rem', background: isDark ? '#1a3024' : '#e8f5e9', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <PackagePlus style={{ width: '2rem', height: '2rem', color: ROLE_COLORS.customer }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: c.text, marginBottom: '0.75rem' }}>Заказчик</h2>
            <p style={{ fontSize: '0.9rem', color: c.muted, marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Создавайте заказы на вывоз мусора и выбирайте исполнителей
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Создание заказов', 'Выбор исполнителя', 'Реферальная программа'].map(item => (
                <li key={item} style={{ fontSize: '0.875rem', color: c.listText, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: ROLE_COLORS.customer }}>•</span> {item}
                </li>
              ))}
            </ul>
          </button>

          {/* Contractor */}
          <button onClick={() => selectRole('contractor')} style={cardStyle(ROLE_COLORS.contractor)}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ROLE_COLORS.contractor; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px ${ROLE_COLORS.contractor}30`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = c.border; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
          >
            <div style={{ width: '4rem', height: '4rem', background: isDark ? '#0f1f36' : '#e3f2fd', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Coins style={{ width: '2rem', height: '2rem', color: ROLE_COLORS.contractor }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: c.text, marginBottom: '0.75rem' }}>Исполнитель</h2>
            <p style={{ fontSize: '0.9rem', color: c.muted, marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Выполняйте заказы и зарабатывайте в удобное время
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Поиск заказов рядом', 'Гибкий график', 'Подписки на адреса'].map(item => (
                <li key={item} style={{ fontSize: '0.875rem', color: c.listText, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: ROLE_COLORS.contractor }}>•</span> {item}
                </li>
              ))}
            </ul>
          </button>
        </div>
      </div>
    </div>
  );
}
