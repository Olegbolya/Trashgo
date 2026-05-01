import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, Package, Filter, RefreshCw, DollarSign, Navigation, Zap, Star, TrendingUp, Briefcase, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getDayLabel } from '../lib/utils';

export default function FindOrdersNew() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | 'one-time' | 'subscription'>('all');
  const [sortType, setSortType] = useState<'distance' | 'price_asc' | 'price_desc'>('distance');
  const [todayEarnings, setTodayEarnings] = useState(110); // Already earned today
  const [isOnShift, setIsOnShift] = useState(true);

  // Profile stats
  const stats = {
    rating: 4.8,
    reviews: 47,
    completedOrders: 156,
    totalEarnings: 18500,
    subscribedAddresses: 3,
    weeklyEarnings: 420,
    monthlyEarnings: 1850,
  };

  // Mock orders
  const oneTimeOrders = [
    {
      id: 1,
      address: 'ул. Чистопольская, 34',
      time: '5 мин назад',
      scheduledTime: 'Сегодня в 20:00',
      price: 55,
      distance: '1.8 км',
      description: 'После ремонта, строительный мусор',
      volume: '3-5 мешков',
    },
    {
      id: 2,
      address: 'ул. Гаврилова, 12',
      time: '18 мин назад',
      scheduledTime: 'Завтра в 14:00',
      price: 45,
      distance: '2.1 км',
      description: 'Бытовой мусор',
      volume: '2-3 мешка',
    },
  ];

  const subscriptionOrders = [
    {
      id: 3,
      address: 'ул. Баумана, 58',
      days: [1, 4], // Monday, Thursday
      time: '18:00',
      price: 50,
      distance: '1.2 км',
      bonus: 10,
      weeklyEarnings: 100,
      description: 'Регулярный вывоз, 4 этаж, есть лифт',
    },
    {
      id: 4,
      address: 'пр. Победы, 120',
      days: [2, 5], // Tuesday, Friday
      time: '16:00',
      price: 45,
      distance: '2.5 км',
      bonus: 10,
      weeklyEarnings: 90,
      description: 'Постоянный клиент, частный дом',
    },
    {
      id: 5,
      address: 'ул. Пушкина, 23',
      days: [3], // Wednesday
      time: '19:00',
      price: 40,
      distance: '800 м',
      bonus: 10,
      weeklyEarnings: 40,
      description: 'Небольшие объемы',
    },
  ];

  const parseDistance = (d: string) => parseFloat(d.replace(/[^0-9.]/g, '')) || 999;

  const filteredOrders = () => {
    let base = filterType === 'one-time' ? oneTimeOrders : filterType === 'subscription' ? subscriptionOrders : [...oneTimeOrders, ...subscriptionOrders];
    return [...base].sort((a, b) => {
      if (sortType === 'distance') return parseDistance(a.distance) - parseDistance(b.distance);
      if (sortType === 'price_asc') return a.price - b.price;
      if (sortType === 'price_desc') return b.price - a.price;
      return 0;
    });
  };

  const potentialEarnings = filteredOrders().reduce((sum, order) => {
    if ('weeklyEarnings' in order) {
      return sum + order.weeklyEarnings;
    }
    return sum + order.price;
  }, 0);

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
            <h1 className="font-semibold text-gray-900">Найти заказы</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-6 h-6 text-gray-900" />
            </button>
          </div>
        </div>
      </header>

      {/* Earnings banner - MOTIVATION! */}
      {isOnShift && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-green-100 mb-1">Заработано сегодня</div>
                <div className="text-3xl font-bold">+{todayEarnings}₽</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-100 mb-1">Еще доступно</div>
                <div className="text-2xl font-semibold">+{potentialEarnings}₽</div>
              </div>
            </div>
            <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all"
                style={{ width: `${Math.min((todayEarnings / (todayEarnings + potentialEarnings)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Profile stats cards */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Main profile card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Ваш профиль</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{stats.rating}</span>
                        <span className="text-gray-300">({stats.reviews} отзывов)</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold mb-1">{stats.completedOrders}</div>
                      <div className="text-xs text-gray-300">Выполнено</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold mb-1">{stats.subscribedAddresses}</div>
                      <div className="text-xs text-gray-300">Адресов</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold mb-1 text-green-400">+15%</div>
                      <div className="text-xs text-gray-300">Рост</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">За неделю</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stats.weeklyEarnings}₽</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">За месяц</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stats.monthlyEarnings}₽</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-64 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Карта с заказами</div>
            <div className="text-xs text-gray-500">Скоро появится</div>
          </div>
        </div>
        {/* Order markers on map */}
        <div className="absolute top-8 left-8">
          <div className="w-10 h-10 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold animate-pulse">
            55₽
          </div>
        </div>
        <div className="absolute top-16 right-12">
          <div className="w-10 h-10 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold">
            50₽
          </div>
        </div>
        <div className="absolute bottom-12 left-1/3">
          <div className="w-10 h-10 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold">
            45₽
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[168px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-2 overflow-x-auto">
            <span className="text-xs text-gray-400 self-center whitespace-nowrap mr-1">Сорт:</span>
            {([
              { key: 'distance' as const, label: '📍 Расстояние' },
              { key: 'price_asc' as const, label: '↑ Цена' },
              { key: 'price_desc' as const, label: '↓ Цена' },
            ]).map((s) => (
              <button key={s.key} onClick={() => setSortType(s.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${sortType === s.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pb-3 overflow-x-auto border-t border-gray-100 pt-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Все ({oneTimeOrders.length + subscriptionOrders.length})
            </button>
            <button
              onClick={() => setFilterType('one-time')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === 'one-time'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Разовые ({oneTimeOrders.length})
            </button>
            <button
              onClick={() => setFilterType('subscription')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === 'subscription'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Подписки ({subscriptionOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Sorted/filtered orders */}
          {filteredOrders().filter(o => !('weeklyEarnings' in o)).map((order) => (
            <div key={order.id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-400 transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-500">{order.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{order.address}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{order.scheduledTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        <span>{order.volume}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{order.description}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-semibold text-red-600">+{order.price}₽</div>
                    <div className="text-xs text-gray-500">{order.distance}</div>
                  </div>
                </div>
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  Взять заказ
                </Button>
              </div>
            </div>
          ))}

          {/* Subscription orders */}
          {filteredOrders().filter(o => 'weeklyEarnings' in o).map((order) => (
            <div key={order.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl overflow-hidden hover:border-green-400 transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Регулярный заказ</span>
                      <div className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        +{order.bonus}₽ бонус
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{order.address}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Каждый {order.days.map(d => getDayLabel(d)).join(', ')} в {order.time}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{order.description}</div>
                    <div className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ~{order.weeklyEarnings}₽ в неделю
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-semibold text-green-600">+{order.price}₽</div>
                    <div className="text-xs text-gray-500">{order.distance}</div>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Подписаться на адрес
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}