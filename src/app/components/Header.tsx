import { Trash2, User, Bell } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-gray-900" />
            <div>
              <div className="font-semibold text-gray-900">Вынос Мусора</div>
              <div className="text-xs text-gray-500">Казань</div>
            </div>
          </div>

          {/* Beta badge */}
          <div className="hidden md:block">
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              Экспериментальная платформа
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
