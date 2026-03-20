import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, DollarSign, RefreshCw, Calendar, TrendingUp, Pause, Play } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function MySubscriptions() {
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      address: 'ул. Баумана, 58',
      customer: 'Александр',
      days: [1, 4], // Monday, Thursday
      time: '18:00',
      price: 50,
      bonus: 10,
      distance: '1.2 км',
      active: true,
      completedOrders: 12,
      weeklyEarnings: 100,
      monthlyEarnings: 400,
      description: 'Регулярный вывоз, 4 этаж, есть лифт',
    },
    {
      id: 2,
      address: 'пр. Победы, 120',
      customer: 'Мария',
      days: [2, 5], // Tuesday, Friday
      time: '16:00',
      price: 45,
      bonus: 10,
      distance: '2.5 км',
      active: true,
      completedOrders: 8,
      weeklyEarnings: 90,
      monthlyEarnings: 360,
      description: 'Постоянный клиент, частный дом',
    },
    {
      id: 3,
      address: 'ул. Пушкина, 23',
      customer: 'Дмитрий',
      days: [3], // Wednesday
      time: '19:00',
      price: 40,
      bonus: 10,
      distance: '800 м',
      active: false,
      completedOrders: 5,
      weeklyEarnings: 40,
      monthlyEarnings: 160,
      description: 'Небольшие объемы, на паузе',
    },
  ]);

  const getDayLabel = (dayId: number) => {
    const labels = ['', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    return labels[dayId];
  };

  const getDayFull = (dayId: number) => {
    const labels = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    return labels[dayId];
  };

  const toggleSubscription = (id: number) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === id ? { ...sub, active: !sub.active } : sub
    ));
  };

  const activeSubscriptions = subscriptions.filter(s => s.active);
  const pausedSubscriptions = subscriptions.filter(s => !s.active);

  const totalWeeklyEarnings = activeSubscriptions.reduce((sum, sub) => sum + sub.weeklyEarnings, 0);
  const totalMonthlyEarnings = activeSubscriptions.reduce((sum, sub) => sum + sub.monthlyEarnings, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="font-semibold text-gray-900">Мои подписки</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Earnings summary */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm font-medium">Стабильный доход</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-green-100 mb-1">В неделю</div>
                <div className="text-3xl font-bold">~{totalWeeklyEarnings}₽</div>
              </div>
              <div>
                <div className="text-xs text-green-100 mb-1">В месяц</div>
                <div className="text-3xl font-bold">~{totalMonthlyEarnings}₽</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-green-100">
              <TrendingUp className="w-4 h-4" />
              <span>{activeSubscriptions.length} активных адреса</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active subscriptions */}
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {activeSubscriptions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Активные подписки</h2>
              <div className="space-y-4">
                {activeSubscriptions.map((sub) => (
                  <div key={sub.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl overflow-hidden">
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">Регулярный заказ</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{sub.address}</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">Клиент: {sub.customer}</div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-semibold text-green-600">+{sub.price + sub.bonus}₽</div>
                          <div className="text-xs text-gray-500">за раз</div>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="bg-white border border-green-200 rounded-xl p-4 mb-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">График</div>
                            <div className="flex items-center gap-1">
                              {sub.days.map((dayId) => (
                                <span key={dayId} className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium text-xs">
                                  {getDayLabel(dayId)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Время</div>
                            <div className="flex items-center gap-1 text-gray-900">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{sub.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-white border border-green-200 rounded-lg p-3 text-center">
                          <div className="text-lg font-semibold text-gray-900">{sub.completedOrders}</div>
                          <div className="text-xs text-gray-600">Выполнено</div>
                        </div>
                        <div className="bg-white border border-green-200 rounded-lg p-3 text-center">
                          <div className="text-lg font-semibold text-green-600">{sub.weeklyEarnings}₽</div>
                          <div className="text-xs text-gray-600">В неделю</div>
                        </div>
                        <div className="bg-white border border-green-200 rounded-lg p-3 text-center">
                          <div className="text-lg font-semibold text-green-600">{sub.monthlyEarnings}₽</div>
                          <div className="text-xs text-gray-600">В месяц</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white"
                          onClick={() => toggleSubscription(sub.id)}
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Пауза
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          График
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paused subscriptions */}
          {pausedSubscriptions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">На паузе</h2>
              <div className="space-y-3">
                {pausedSubscriptions.map((sub) => (
                  <div key={sub.id} className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{sub.address}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {sub.days.map(d => getDayLabel(d)).join(', ')} в {sub.time}
                        </div>
                        <div className="text-xs text-gray-500">{sub.description}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-semibold text-gray-400">+{sub.price + sub.bonus}₽</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toggleSubscription(sub.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Возобновить
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {subscriptions.length === 0 && (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">Нет подписок</div>
              <div className="text-sm text-gray-500 mb-6">
                Найдите регулярные заказы и получите стабильный доход
              </div>
              <Button
                onClick={() => navigate('/find-orders')}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Найти подписки
              </Button>
            </div>
          )}

          {/* Info card */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Преимущества подписок</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Стабильный доход каждую неделю</li>
                  <li>• Бонус +10₽ за регулярность</li>
                  <li>• Знакомые адреса - меньше времени на поиск</li>
                  <li>• Можно планировать маршруты заранее</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
