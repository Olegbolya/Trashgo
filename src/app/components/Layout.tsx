import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, User, Package, Trash2, MapPin, Gift, Star, DollarSign, HelpCircle } from 'lucide-react';

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
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-400 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                TrashGo
              </h1>
              <p className="text-xs text-gray-500">P2P вывоз мусора</p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Иван Петров</p>
              <p className="text-sm text-gray-500">+7 917 123-45-67</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-lg p-2 text-center">
              <p className="text-xs text-red-600 font-medium">Заказов</p>
              <p className="text-lg font-bold text-red-600">12</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <p className="text-xs text-green-600 font-medium">Выносов</p>
              <p className="text-lg font-bold text-green-600">8</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard')
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Главная</span>
          </button>

          <button
            onClick={() => navigate('/create-order')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all"
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Заказать вывоз</span>
          </button>

          <button
            onClick={() => navigate('/find-orders')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">Вынести мусор</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard')
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Профиль</span>
          </button>

          <button
            onClick={() => navigate('/invite-neighbor')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <Gift className="w-5 h-5" />
            <span className="font-medium">Пригласить соседей</span>
          </button>

          <button
            onClick={() => navigate('/how-it-works')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/how-it-works')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">Как это работает?</span>
          </button>
        </nav>

        {/* Rating */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-lg">4.9</span>
            <span className="text-sm">• 20 помощей</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {/* Profile */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive('/dashboard') ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Профиль</span>
          </button>

          {/* Home */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive('/dashboard') ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Главная</span>
          </button>

          {/* Order */}
          <button
            onClick={() => navigate('/create-order')}
            className="flex flex-col items-center justify-center gap-1 text-red-600"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs font-medium">Заказать</span>
          </button>

          {/* Earn */}
          <button
            onClick={() => navigate('/find-orders')}
            className="flex flex-col items-center justify-center gap-1 text-green-600"
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-xs font-medium">Заработать</span>
          </button>
        </div>
      </nav>
    </div>
  );
}