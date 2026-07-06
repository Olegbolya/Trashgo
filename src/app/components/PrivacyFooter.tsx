import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyFooter() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const border  = isDark ? '#374151' : '#e5e7eb';
  const surface = isDark ? '#1e2433' : '#ffffff';
  const text    = isDark ? '#f9fafb' : '#111827';
  const muted   = isDark ? '#9ca3af' : '#6b7280';

  return (
    <footer style={{ borderTop: `1px solid ${border}`, padding: '2.5rem 1.5rem 2rem', background: surface }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: muted, marginBottom: '1rem' }}>
            Политика конфиденциальности — основные положения
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.625rem' }}>
            {[
              { n: '1', t: 'Что собираем', d: 'Номер телефона, имя, район и адреса заказов. Платёжные данные и геолокация не собираются.' },
              { n: '2', t: 'Как используем', d: 'Только для работы сервиса: авторизация, создание заказов, уведомления, рейтинг.' },
              { n: '3', t: 'Не передаём данные', d: 'Данные не продаются. Партнёры видят только то, что нужно для выполнения заказа.' },
              { n: '4', t: 'Защита данных', d: 'Серверы Timeweb (Россия), шифрование TLS 1.3, вход через VK ID или OTP — пароли не хранятся.' },
              { n: '5', t: 'Ваши права', d: 'Доступ, исправление и удаление данных по запросу в любой момент (152-ФЗ).' },
              { n: '6', t: 'Контакты', d: 'Вопросы по данным: support@trash-go.ru' },
            ].map(({ n, t, d }) => (
              <div key={n} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: '#22a84918', color: '#22a849', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: text, marginBottom: '0.2rem' }}>{t}</div>
                  <div style={{ fontSize: '0.72rem', color: muted, lineHeight: 1.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${border}`, paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: muted }}>© 2026 TrashGo · Казань</span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <button onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: muted, fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>Политика конфиденциальности</button>
            <button onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: muted, fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>Пользовательское соглашение</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
