import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Star, MapPin, Calendar, Clock, DollarSign, RefreshCw, Pause, Play, MessageCircle, Phone, TrendingDown, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getDayLabel } from '../lib/utils';

export default function MyContractors() {
  const navigate = useNavigate();

  const [contractors, setContractors] = useState([
    {
      id: 1,
      name: 'Иван Петров',
      avatar: '👨',
      rating: 4.9,
      phone: '+7 (917) 234-56-78',
      days: [1, 4], // Monday, Thursday
      time: '18:00',
      price: 45,
      discount: 10,
      active: true,
      completedOrders: 24,
      nextOrder: 'Завтра в 18:00',
      monthlyOrders: 8,
      monthlySavings: 80,
      address: 'ул. Баумана, 58',
    },
    {
      id: 2,
      name: 'Алексей Смирнов',
      avatar: '🧑',
      rating: 4.8,
      phone: '+7 (917) 345-67-89',
      days: [2, 5], // Tuesday, Friday
      time: '16:00',
      price: 40,
      discount: 10,
      active: true,
      completedOrders: 16,
      nextOrder: 'Пт в 16:00',
      monthlyOrders: 8,
      monthlySavings: 80,
      address: 'ул. Баумана, 58',
    },
    {
      id: 3,
      name: 'Дмитрий Козлов',
      avatar: '👨‍🦱',
      rating: 4.7,
      phone: '+7 (917) 456-78-90',
      days: [6], // Saturday
      time: '10:00',
      price: 35,
      discount: 10,
      active: false,
      completedOrders: 8,
      nextOrder: null,
      monthlyOrders: 4,
      monthlySavings: 40,
      address: 'ул. Баумана, 58',
    },
  ]);

  const toggleContractor = (id: number) => {
    setContractors(contractors.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    ));
  };

  const activeContractors = contractors.filter(c => c.active);
  const pausedContractors = contractors.filter(c => !c.active);

  const totalMonthlySavings = activeContractors.reduce((sum, c) => sum + c.monthlySavings, 0);
  const totalMonthlyOrders = activeContractors.reduce((sum, c) => sum + c.monthlyOrders, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
            <h1 className="font-semibold text-gray-900">Мои исполнители</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Savings summary */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5" />
              <span className="text-sm font-medium">Ваша экономия</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-purple-100 mb-1">В месяц</div>
                <div className="text-3xl font-bold">-{totalMonthlySavings}₽</div>
              </div>
              <div>
                <div className="text-xs text-purple-100 mb-1">Заказов/месяц</div>
                <div className="text-3xl font-bold">{totalMonthlyOrders}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-purple-100">
              <RefreshCw className="w-4 h-4" />
              <span>{activeContractors.length} активных подписок</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active contractors */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {activeContractors.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Активные подписки</h2>
              <div className="space-y-4">
                {activeContractors.map((contractor) => (
                  <div key={contractor.id} className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-2xl overflow-hidden">
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {contractor.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">{contractor.name}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium text-gray-900">{contractor.rating}</span>
                            <span className="text-xs text-gray-500">• {contractor.completedOrders} заказов</span>
                          </div>
                          {contractor.nextOrder && (
                            <div className="text-xs text-purple-700 font-medium">
                              Следующий: {contractor.nextOrder}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold text-purple-600">{contractor.price - contractor.discount}₽</div>
                          <div className="text-xs text-gray-500 line-through">{contractor.price}₽</div>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="bg-white border border-purple-200 rounded-xl p-4 mb-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">График вывоза</div>
                            <div className="flex items-center gap-1">
                              {contractor.days.map((dayId) => (
                                <span key={dayId} className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium text-xs">
                                  {getDayLabel(dayId)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Время</div>
                            <div className="flex items-center gap-1 text-gray-900">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{contractor.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-white border border-purple-200 rounded-lg p-3 text-center">
                          <div className="text-lg font-semibold text-gray-900">{contractor.completedOrders}</div>
                          <div className="text-xs text-gray-600">Выполнено</div>
                        </div>
                        <div className="bg-white border border-purple-200 rounded-lg p-3 text-center">
                          <div className="text-lg font-semibold text-purple-600">{contractor.monthlyOrders}</div>
                          <div className="text-xs text-gray-600">В месяц</div>
                        </div>
                        <div className="bg-white border border-purple-200 rounded-lg p-3 text-center">
                          <div className="text-lg font-semibold text-green-600">-{contractor.monthlySavings}₽</div>
                          <div className="text-xs text-gray-600">Экономия</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white"
                          onClick={() => toggleContractor(contractor.id)}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paused contractors */}
          {pausedContractors.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">На паузе</h2>
              <div className="space-y-3">
                {pausedContractors.map((contractor) => (
                  <div key={contractor.id} className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl">
                          {contractor.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 mb-1">{contractor.name}</div>
                          <div className="text-sm text-gray-600 mb-1">
                            {contractor.days.map(d => getDayLabel(d)).join(', ')} в {contractor.time}
                          </div>
                          <div className="text-xs text-gray-500">{contractor.completedOrders} заказов выполнено</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-gray-400">{contractor.price - contractor.discount}₽</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toggleContractor(contractor.id)}
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
          {contractors.length === 0 && (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">Нет подписок</div>
              <div className="text-sm text-gray-500 mb-6">
                Найдите постоянного исполнителя и экономьте на каждом заказе
              </div>
              <Button
                onClick={() => navigate('/find-contractors')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Найти исполнителя
              </Button>
            </div>
          )}

          {/* Benefits card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Преимущества подписок</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Скидка -10₽ на каждый заказ</li>
                  <li>• Проверенный исполнитель приходит вовремя</li>
                  <li>• Не нужно искать каждый раз</li>
                  <li>• Можно договориться о деталях напрямую</li>
                  <li>• Отменить или поставить на паузу в любой момент</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
