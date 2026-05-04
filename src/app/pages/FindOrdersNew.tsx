import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, Package, Filter, RefreshCw, DollarSign, Navigation, Zap, Star, TrendingUp, Briefcase, Award, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getDayLabel } from '../lib/utils';
import { ordersApi } from '../../api/orders';
import { useAuthStore } from '../../stores/auth.store';
import type { Order } from '../../types/order';
import { toast } from 'sonner';

function scoreOrder(order: Order, userDistrict: string): number {
  let score = 0;
  // Same district → big boost
  if (order.district && order.district === userDistrict) score += 30;
  // Higher price → higher rank
  score += order.price / 10;
  // Recency: lose 1 point per hour since creation
  const ageHours = (Date.now() - new Date(order.createdAt).getTime()) / 3_600_000;
  score -= Math.min(ageHours, 24);
  // ASAP urgency bonus
  if (order.asap) score += 20;
  return score;
}

export default function FindOrdersNew() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [filterType, setFilterType] = useState<'all' | 'one-time' | 'subscription'>('all');
  const [sortType, setSortType] = useState<'smart' | 'price_asc' | 'price_desc'>('smart');
  const [isOnShift, setIsOnShift] = useState(true);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    ordersApi.available()
      .then(res => setLiveOrders(res.data))
      .catch(() => toast.error('Не удалось загрузить заказы'))
      .finally(() => setLoadingOrders(false));
  }, []);

  const userDistrict = user?.district ?? '';

  const sortedOrders = [...liveOrders].sort((a, b) => {
    if (sortType === 'smart') return scoreOrder(b, userDistrict) - scoreOrder(a, userDistrict);
    if (sortType === 'price_asc') return a.price - b.price;
    if (sortType === 'price_desc') return b.price - a.price;
    return 0;
  });

  const handleAccept = async (orderId: string) => {
    setAccepting(orderId);
    try {
      await ordersApi.accept(orderId);
      setLiveOrders(prev => prev.filter(o => o.id !== orderId));
      navigate(`/order/${orderId}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Не удалось принять заказ');
    } finally {
      setAccepting(null);
    }
  };

  const formatTime = (order: Order) => {
    if (order.asap) return 'Срочно';
    if (!order.scheduledAt) return 'Время не указано';
    const d = new Date(order.scheduledAt);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return isToday ? `Сегодня в ${h}:${m}` : `${d.getDate()}.${(d.getMonth()+1).toString().padStart(2,'0')} в ${h}:${m}`;
  };

  const formatAge = (createdAt: string) => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин назад`;
    const h = Math.floor(mins / 60);
    return `${h} ч назад`;
  };

  const potentialEarnings = sortedOrders.reduce((s, o) => s + o.price, 0);

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
              { key: 'smart' as const, label: '✨ Умный' },
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
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Все ({sortedOrders.length})
            </button>
            <button
              onClick={() => setFilterType('one-time')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'one-time' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Разовые ({sortedOrders.filter(o => !o.asap).length})
            </button>
            <button
              onClick={() => setFilterType('subscription')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'subscription' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Zap className="w-4 h-4 inline mr-1" />
              Срочные ({sortedOrders.filter(o => o.asap).length})
            </button>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-4">
          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <div className="text-lg font-medium text-gray-900 mb-1">Нет доступных заказов</div>
              <div className="text-sm text-gray-500">Новые заказы появляются регулярно</div>
            </div>
          ) : (
            sortedOrders
              .filter(o => filterType === 'all' || (filterType === 'subscription' ? o.asap : !o.asap))
              .map((order, idx) => {
                const score = scoreOrder(order, userDistrict);
                const isHighScore = sortType === 'smart' && idx === 0 && sortedOrders.length > 1;
                const sameDistrict = order.district === userDistrict && userDistrict;
                return (
                  <div
                    key={order.id}
                    className={`border-2 rounded-2xl overflow-hidden transition-all ${
                      order.asap
                        ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300 hover:border-orange-400'
                        : isHighScore
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 hover:border-blue-400'
                        : 'bg-white border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${order.asap ? 'bg-orange-500' : 'bg-green-500'}`} />
                            <span className="text-xs text-gray-500">{formatAge(order.createdAt)}</span>
                            {order.asap && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">Срочно</span>}
                            {isHighScore && <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" />Лучшее</span>}
                            {sameDistrict && !isHighScore && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Ваш район</span>}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{order.address}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{formatTime(order)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              <span>{order.volume} м³</span>
                            </div>
                          </div>
                          {order.description && (
                            <div className="text-xs text-gray-500">{order.description}</div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-2xl font-semibold ${order.asap ? 'text-orange-600' : 'text-green-600'}`}>+{order.price}₽</div>
                          {order.district && <div className="text-xs text-gray-500">{order.district}</div>}
                        </div>
                      </div>
                      <Button
                        className={`w-full text-white ${order.asap ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-900 hover:bg-gray-800'}`}
                        disabled={accepting === order.id}
                        onClick={() => handleAccept(order.id)}
                      >
                        {accepting === order.id ? 'Принимаем...' : 'Взять заказ'}
                      </Button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}