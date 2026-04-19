import { useNavigate, useLocation } from 'react-router';
import { PackagePlus, Coins } from 'lucide-react';

export default function SelectRole() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';
  const verifiedCode = location.state?.verifiedCode || '';

  const selectRole = (role: 'customer' | 'contractor') => {
    const state = { phone, verifiedCode, role };
    if (role === 'customer') {
      navigate('/register-customer', { state });
    } else {
      navigate('/register-contractor', { state });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl text-gray-900 mb-3">Выберите роль</h1>
          <p className="text-gray-600">Вы сможете изменить это позже в настройках</p>
        </div>

        {/* Role selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer */}
          <button
            onClick={() => selectRole('customer')}
            className="bg-white border-2 border-gray-200 hover:border-gray-900 rounded-3xl p-8 text-left transition-all group"
          >
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
              <PackagePlus className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-3">Заказчик</h2>
            <p className="text-gray-600 mb-6">
              Создавайте заказы на вынос мусора и выбирайте исполнителей
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Создание заказов</li>
              <li>• Выбор исполнителя</li>
              <li>• Реферальная программа</li>
            </ul>
          </button>

          {/* Contractor */}
          <button
            onClick={() => selectRole('contractor')}
            className="bg-white border-2 border-gray-200 hover:border-gray-900 rounded-3xl p-8 text-left transition-all group"
          >
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
              <Coins className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-3">Исполнитель</h2>
            <p className="text-gray-600 mb-6">
              Выполняйте заказы и зарабатывайте в удобное время
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Поиск заказов рядом</li>
              <li>• Гибкий график</li>
              <li>• Подписки на адреса</li>
            </ul>
          </button>
        </div>
      </div>
    </div>
  );
}
