import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, HelpCircle, Trash2 } from 'lucide-react';
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
  ];

  return (
    <div className="min-h-screen" style={{ background: c.bg }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-50" style={{ background: c.surface, borderRight: `1px solid ${c.border}` }}>
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
              <Trash2 className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
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
    </div>
  );
}
