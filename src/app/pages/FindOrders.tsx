import { useLocation, useNavigate } from 'react-router';
import { MapPin, Clock, Package, ArrowLeft, Filter, TrendingUp, Wallet, Award, Star } from 'lucide-react';
import { Button } from '../components/ui/button';

const mockOrders = [
  {
    id: 12847,
    address: 'ул. Баумана, 58',
    building: 'Подъезд 1-3',
    time: '14:00-16:00',
    timeSort: 14,
    date: 'Сегодня',
    addressCount: 12,
    price: 600,
    distance: '1.2 км',
    description: '1-9 этажи, есть лифт',
    customer: 'Александр',
    rating: 4.9,
  },
  {
    id: 12846,
    address: 'пр. Победы, 120',
    building: 'Подъезд 1-2',
    time: '15:00-17:00',
    timeSort: 15,
    date: 'Сегодня',
    addressCount: 8,
    price: 400,
    distance: '2.5 км',
    description: '1-5 этажи, без лифта',
    customer: 'Мария',
    rating: 4.7,
  },
  {
    id: 12845,
    address: 'ул. Пушкина, 23',
    building: 'Подъезд 1-5',
    time: '16:00-19:00',
    timeSort: 16,
    date: 'Сегодня',
    addressCount: 18,
    price: 900,
    distance: '3.1 км',
    description: '1-12 этажи, есть лифт',
    customer: 'ЖК "Центральный"',
    rating: 5.0,
  },
  {
    id: 12844,
    address: 'ул. Чистопольская, 61',
    building: 'Подъезды 1-4',
    time: '17:00-20:00',
    timeSort: 17,
    date: 'Сегодня',
    addressCount: 22,
    price: 1100,
    distance: '1.8 км',
    description: '1-9 этажи, есть лифт',
    customer: 'ТСЖ "Надежда"',
    rating: 4.8,
  },
  {
    id: 12843,
    address: 'ул. Гаврилова, 12',
    building: 'Подъезд 1',
    time: '18:00-20:00',
    timeSort: 18,
    date: 'Сегодня',
    addressCount: 5,
    price: 250,
    distance: '0.8 км',
    description: '1-5 этажи, без лифта',
    customer: 'Елена',
    rating: 4.6,
  },
];

export default function FindOrders() {
  const location = useLocation();
  const navigate = useNavigate();
  const district = location.state?.district || 'Вахитовский';

  // Sort orders by time
  const sortedOrders = [...mockOrders].sort((a, b) => a.timeSort - b.timeSort);

  const totalEarnings = sortedOrders.reduce((sum, order) => sum + order.price, 0);
  const totalAddresses = sortedOrders.reduce((sum, order) => sum + order.addressCount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <button 
              onClick={() => navigate('/contractor-dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Назад</span>
            </button>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-4 h-4 mr-1.5" />
              <span className="text-xs">Фильтр</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-3 py-3">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Earnings potential card */}
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Доступно сегодня</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-white/80 mb-1">Можете заработать</div>
                  <div className="text-3xl font-bold">{totalEarnings}₽</div>
                  <div className="text-xs text-white/70">{totalAddresses} адресов</div>
                </div>
                <div>
                  <div className="text-sm text-white/80 mb-1">Заказов</div>
                  <div className="text-3xl font-bold">{sortedOrders.length}</div>
                  <div className="text-xs text-white/70">в районе {district}</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                <div className="text-xs text-white/80 mb-1">💡 Совет</div>
                <div className="text-sm">Возьмите все заказы - оптимизируйте маршрут и заработайте за вечер!</div>
              </div>
            </div>
          </div>

          {/* Orders list header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">По времени</h2>
            <span className="text-xs text-gray-500">{sortedOrders.length} заказов</span>
          </div>

          {/* Orders list - sorted by time */}
          <div className="space-y-2">
            {sortedOrders.map((order, index) => {
              const colors = [
                'from-blue-500 to-indigo-600',
                'from-purple-500 to-pink-600',
                'from-orange-500 to-red-600',
                'from-teal-500 to-cyan-600',
                'from-violet-500 to-purple-600',
              ];
              const color = colors[index % colors.length];
              
              return (
                <div
                  key={order.id}
                  className={`bg-gradient-to-br ${color} rounded-xl text-white relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  
                  <div className="p-4 relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-lg font-bold">{order.time}</span>
                          <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-xs font-medium rounded border border-white/30">
                            {order.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-sm font-medium">{order.address}</span>
                        </div>
                        <div className="text-xs text-white/80 mb-2">
                          {order.building} • {order.customer}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded border border-white/30">
                            <Package className="w-3 h-3 inline mr-1" />
                            <span className="text-xs font-medium">{order.addressCount} адресов</span>
                          </div>
                          <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded border border-white/30">
                            <Star className="w-3 h-3 inline mr-1 fill-white" />
                            <span className="text-xs font-medium">{order.rating}</span>
                          </div>
                        </div>
                        <div className="text-xs text-white/70">{order.description}</div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-3xl font-bold">{order.price}₽</div>
                        <div className="text-xs text-white/80">{order.addressCount}×50₽</div>
                        <div className="text-xs text-white/70 mt-1">{order.distance}</div>
                      </div>
                    </div>

                    <Button 
                      size="sm"
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm h-9"
                    >
                      Взять заказ
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info */}
          <div className="text-center py-4">
            <p className="text-xs text-gray-500">
              Список обновляется в реальном времени
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}