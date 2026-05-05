import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Home, User, Package, Trash2, MapPin, ChevronRight, Plus, Star, Phone, MessageCircle, Award, Wallet, Gift, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function UnifiedDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const viewMode = 'desktop'; // or 'mobile' - можно сделать динамическим если нужно

  // Mock data - мои заказы на вывоз (я заказчик)
  const myOrders = [
    {
      id: 1,
      address: 'ул. Баумана, 58, кв. 42',
      date: 'Сегодня',
      time: '18:00-20:00',
      status: 'active',
      contractor: 'Дмитрий',
      price: 56,
    },
    {
      id: 2,
      address: 'ул. Баумана, 58, кв. 42',
      date: 'Завтра',
      time: '18:00-20:00',
      status: 'upcoming',
      contractor: 'Дмитрий',
      price: 56,
    },
  ];

  // Mock data - мои выносы (я исполнитель)
  const myTakeouts = [
    {
      id: 1,
      address: 'ул. Баумана, 58',
      apartments: ['38', '45', '47'],
      date: 'Сегодня',
      time: '19:00-20:00',
      status: 'upcoming',
      earned: 150,
    },
    {
      id: 2,
      address: 'ул. Баумана, 58',
      apartments: ['38', '45'],
      date: 'Завтра',
      time: '19:00-20:00',
      status: 'planned',
      earned: 100,
    },
  ];

  const stats = {
    ordersCompleted: 12,
    takeoutsCompleted: 8,
    totalSaved: 168,
    totalEarned: 2400,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">TrashGo</h1>
          <p className="text-sm text-gray-500 mt-1">Помогаем соседям</p>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Александр</div>
              <div className="text-xs text-gray-500">+7 (903) 123-45-67</div>
            </div>
          </div>
          
          {/* Stats Mini */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-lg p-2">
              <div className="text-lg font-bold text-green-600">{stats.totalEarned}₽</div>
              <div className="text-xs text-green-700">Заработано</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <div className="text-lg font-bold text-red-600">{stats.totalSaved}₽</div>
              <div className="text-xs text-red-700">Сэкономлено</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'home'
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Главная</span>
          </button>

          <button
            onClick={() => navigate('/customer?tab=create')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Заказать вывоз</span>
          </button>

          <button
            onClick={() => navigate('/find-orders-new')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">Вынести мусор</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'profile'
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Профиль</span>
          </button>

          <button
            onClick={() => navigate('/invite-neighbor')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            <Gift className="w-5 h-5" />
            <span className="font-medium">Пригласить соседей</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-gray-900">4.9</span>
            <span>• 20 помощей</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${viewMode === 'mobile' ? '' : 'lg:ml-72'} min-h-screen pb-20 ${viewMode === 'mobile' ? 'lg:pb-20' : 'lg:pb-0'}`}>
        {/* Mobile View Wrapper */}
        <div className={viewMode === 'mobile' ? 'lg:flex lg:justify-center lg:py-8 lg:bg-gray-100' : ''}>
          <div className={viewMode === 'mobile' ? 'lg:w-[390px] lg:bg-white lg:rounded-2xl lg:shadow-2xl lg:overflow-hidden lg:border lg:border-gray-300' : ''}>
            {/* Mobile Header */}
            <header className={`${viewMode === 'mobile' ? 'bg-white' : 'lg:hidden bg-white'} border-b border-gray-200 sticky top-0 z-40`}>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">TrashGo</h1>
                    <p className="text-xs text-gray-500">Помогаем соседям</p>
                  </div>
                  <button 
                    onClick={() => navigate('/invite-neighbor')}
                    className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center"
                  >
                    <Gift className="w-5 h-5 text-purple-600" />
                  </button>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="p-4 lg:p-8 max-w-6xl mx-auto">
              {activeTab === 'home' && (
                <div className="space-y-4">
                  {/* Hero Stats */}
                  <div className="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                    
                    <div className="relative">
                      <div className="mb-4">
                        <h2 className="text-2xl font-bold mb-1">Привет, Александр! 👋</h2>
                        <p className="text-sm text-white/80">Ваша активность</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-5 h-5" />
                            <span className="text-sm text-white/80">Заказано</span>
                          </div>
                          <div className="text-3xl font-bold">{stats.ordersCompleted}</div>
                          <div className="text-xs text-white/70 mt-1">Сэкономлено {stats.totalSaved}₽</div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Trash2 className="w-5 h-5" />
                            <span className="text-sm text-white/80">Вынесено</span>
                          </div>
                          <div className="text-3xl font-bold">{stats.takeoutsCompleted}</div>
                          <div className="text-xs text-white/70 mt-1">Заработано {stats.totalEarned}₽</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* My Orders (я заказчик) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold text-gray-900">Мои заказы</h2>
                      <button 
                        onClick={() => navigate('/customer?tab=create')}
                        className="text-sm text-purple-600 font-semibold hover:text-purple-700"
                      >
                        + Создать
                      </button>
                    </div>

                    {myOrders.length > 0 ? (
                      <div className="space-y-3">
                        {myOrders.map((order) => (
                          <div 
                            key={order.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                                    order.status === 'active' 
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {order.date}
                                  </span>
                                  <span className="text-sm text-gray-500">{order.time}</span>
                                </div>
                                <div className="flex items-start gap-2 mb-1">
                                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm font-semibold text-gray-900">{order.address}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Исполнитель: {order.contractor}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-gray-900">{order.price}₽</div>
                              </div>
                            </div>

                            {order.status === 'active' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 h-9">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Чат
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 h-9">
                                  <Phone className="w-4 h-4 mr-2" />
                                  Позвонить
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-sm text-gray-500 mb-4">Нет активных заказов</p>
                        <Button 
                          onClick={() => navigate('/customer?tab=create')}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Заказать вывоз
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* My Takeouts (я исполнитель) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold text-gray-900">Мои выносы</h2>
                      <button 
                        onClick={() => navigate('/find-orders-new')}
                        className="text-sm text-green-600 font-semibold hover:text-green-700"
                      >
                        + Найти
                      </button>
                    </div>

                    {myTakeouts.length > 0 ? (
                      <div className="space-y-3">
                        {myTakeouts.map((takeout) => (
                          <div 
                            key={takeout.id}
                            className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                                    takeout.status === 'upcoming' 
                                      ? 'bg-green-600 text-white'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {takeout.date}
                                  </span>
                                  <span className="text-sm text-gray-500">{takeout.time}</span>
                                </div>
                                <div className="flex items-start gap-2 mb-2">
                                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm font-semibold text-gray-900">{takeout.address}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs text-gray-500">Квартиры:</span>
                                  {takeout.apartments.map((apt) => (
                                    <span key={apt} className="px-2 py-1 bg-white border border-green-200 rounded-lg text-xs font-semibold text-green-700">
                                      {apt}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-green-600">{takeout.earned}₽</div>
                              </div>
                            </div>

                            {takeout.status === 'upcoming' && (
                              <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-10">
                                Начать вынос
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-sm text-gray-500 mb-4">Нет активных выносов</p>
                        <Button 
                          onClick={() => navigate('/find-orders-new')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Найти заказы
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Invite Neighbors */}
                  <div 
                    onClick={() => navigate('/invite-neighbor')}
                    className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Gift className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="font-bold text-lg mb-1">Пригласи соседей</div>
                          <div className="text-sm text-white/90">Чем больше - тем дешевле всем!</div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-4">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                            <User className="w-10 h-10 text-white" />
                          </div>
                          <div>
                            <h1 className="text-3xl font-bold mb-1">Александр</h1>
                            <div className="text-sm text-white/80">+7 (903) 123-45-67</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                            <span className="text-3xl font-bold">4.9</span>
                          </div>
                          <div className="text-sm text-white/80">Рейтинг</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Award className="w-5 h-5" />
                            <span className="text-3xl font-bold">20</span>
                          </div>
                          <div className="text-sm text-white/80">Всего помощей</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5" />
                        <span className="text-sm text-white/80">Заработано</span>
                      </div>
                      <div className="text-3xl font-bold">{stats.totalEarned}₽</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-5 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm text-white/80">Сэкономлено</span>
                      </div>
                      <div className="text-3xl font-bold">{stats.totalSaved}₽</div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Мой адрес</h2>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="text-base font-semibold text-gray-900">ул. Баумана, 58</div>
                          <div className="text-sm text-gray-500">Подъезд 2, Этаж 5, Кв. 42</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button 
                      onClick={() => navigate('/invite-neighbor')}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Gift className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-base font-semibold text-gray-900">Пригласить соседей</div>
                          <div className="text-sm text-gray-500">Скидки для всего подъезда</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button 
                      onClick={() => navigate('/my-subscriptions')}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-base font-semibold text-gray-900">Мои подписки</div>
                          <div className="text-sm text-gray-500">Регулярный вывоз</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-base font-semibold text-gray-900">История и выплаты</div>
                          <div className="text-sm text-gray-500">Все транзакции</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {/* Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'profile' ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Профиль</span>
          </button>

          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'home' ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Главная</span>
          </button>

          {/* Order */}
          <button
            onClick={() => navigate('/customer?tab=create')}
            className="flex flex-col items-center justify-center gap-1 text-red-600"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs font-medium">Заказать</span>
          </button>

          {/* Earn */}
          <button
            onClick={() => navigate('/find-orders-new')}
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