import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, HelpCircle, MessageCircle, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
    active:  isDark ? '#2196F320' : '#e3f2fd',
  };

  const ACCENT = '#2196F3';

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/how-it-works', icon: HelpCircle, label: 'Как это работает?' },
    { path: '/help',         icon: MessageCircle, label: 'Помощь и поддержка' },
  ];

  return (
    <div className="min-h-screen" style={{ background: c.bg }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-50" style={{ background: c.surface, borderRight: `1px solid ${c.border}` }}>
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-3">
            <img src="/icon-72.png" alt="TrashGo" style={{ width: 36, height: 36, borderRadius: '0.625rem', objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <div className="font-bold text-sm" style={{ color: c.text }}>TrashGo</div>
              <div className="text-xs" style={{ color: c.muted }}>Вынос мусора</div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="p-4" style={{ borderBottom: `1px solid ${c.border}` }}>
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.muted, fontFamily: 'inherit' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: isActive(path) ? c.active : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isActive(path) ? ACCENT : c.muted,
                fontFamily: 'inherit',
              }}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile header with back button */}
      <header className="lg:hidden sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-3 px-4 h-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontFamily: 'inherit' }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Назад</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-6">
        {children}
      </main>

      {/* Footer with privacy policy summary */}
      <footer className="lg:ml-64" style={{ borderTop: `1px solid ${c.border}`, padding: '2.5rem 1.5rem 2rem', background: c.surface }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.muted, marginBottom: '1rem' }}>
              Политика конфиденциальности — основные положения
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.625rem' }}>
              {[
                { n: '1', t: 'Что собираем', d: 'Номер телефона, имя, район и адреса заказов. Платёжные данные и геолокация не собираются.' },
                { n: '2', t: 'Как используем', d: 'Только для работы сервиса: авторизация, создание заказов, уведомления, рейтинг.' },
                { n: '3', t: 'Не передаём данные', d: 'Данные не продаются. Партнёры видят только то, что нужно для выполнения заказа.' },
                { n: '4', t: 'Защита данных', d: 'Серверы Railway, шифрование TLS 1.3, вход через OTP — пароли не хранятся.' },
                { n: '5', t: 'Ваши права', d: 'Доступ, исправление и удаление данных по запросу в любой момент (152-ФЗ).' },
                { n: '6', t: 'Контакты', d: 'Вопросы по данным: info@vynosmusora.ru или @trashgo_support в Telegram.' },
              ].map(({ n, t, d }) => (
                <div key={n} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: '#22a84918', color: '#22a849', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: c.text, marginBottom: '0.2rem' }}>{t}</div>
                    <div style={{ fontSize: '0.72rem', color: c.muted, lineHeight: 1.5 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: c.muted }}>© 2026 TrashGo · Казань</span>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <button onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: c.muted, fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>Политика конфиденциальности</button>
              <button onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: c.muted, fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>Пользовательское соглашение</button>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
