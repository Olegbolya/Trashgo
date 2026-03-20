import { useNavigate } from 'react-router';
import { Trash2, PackagePlus, Coins, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Login button */}
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          onClick={() => navigate('/login')}
          className="gap-2"
        >
          <LogIn className="w-4 h-4" />
          Войти
        </Button>
      </div>

      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trash2 className="w-10 h-10 text-gray-900" />
            <div>
              <div className="text-2xl font-semibold text-gray-900">Вынос Мусора</div>
              <div className="text-sm text-gray-600">Казань</div>
            </div>
          </div>
          <p className="text-gray-600">Выберите, что вы хотите сделать</p>
        </div>

        {/* Role selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer */}
          <button
            onClick={() => navigate('/customer')}
            className="bg-white border-2 border-gray-200 hover:border-gray-900 rounded-3xl p-8 text-left transition-all group"
          >
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
              <PackagePlus className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-3">Нужно вынести мусор</h2>
            <p className="text-gray-600 mb-6">
              Создавайте заказы, получайте предложения от исполнителей, экономьте время
            </p>
            <div className="text-sm text-gray-500">
              от 40₽ за заказ
            </div>
          </button>

          {/* Contractor */}
          <button
            onClick={() => navigate('/contractor')}
            className="bg-white border-2 border-gray-200 hover:border-gray-900 rounded-3xl p-8 text-left transition-all group"
          >
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
              <Coins className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-3">Хочу заработать</h2>
            <p className="text-gray-600 mb-6">
              Выбирайте заказы рядом с домом, работайте по своему графику, зарабатывайте
            </p>
            <div className="text-sm text-gray-500">
              от 60₽ за заказ
            </div>
          </button>
        </div>

        {/* Beta badge */}
        <div className="text-center mt-12">
          <span className="text-xs bg-gray-100 text-gray-600 px-4 py-2 rounded-full">
            Экспериментальная платформа
          </span>
        </div>
      </div>
    </div>
  );
}