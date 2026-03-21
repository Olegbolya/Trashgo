import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, User, Package, Trash2, ChevronLeft, HelpCircle, UserPlus, ArrowRightLeft } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900">TrashGo</div>
              <div className="text-xs text-gray-500">Вынос мусора</div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => navigate('/customer')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              isActive('/customer') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home className="w-5 h-5" />
            Главная (клиент)
          </button>

          <button
            onClick={() => navigate('/contractor')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              isActive('/contractor') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            Главная (исполнитель)
          </button>

          <button
            onClick={() => navigate('/invite-neighbor')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              isActive('/invite-neighbor') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            Пригласить соседей
          </button>

          <button
            onClick={() => navigate('/how-it-works')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              isActive('/how-it-works') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            Как это работает?
          </button>
        </nav>
      </aside>

      {/* Mobile header with back button */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 h-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
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
