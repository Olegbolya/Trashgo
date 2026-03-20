import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Home, MapPin, User, Plus, Package, CheckCircle, Clock, Gift, ChevronLeft, ChevronRight, Calendar, Repeat, RefreshCw, Star, Edit, LogOut, Bell, CreditCard, UserPlus, HelpCircle, Award, Wallet, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { LevelSystem, type LevelData } from '../components/LevelSystem';
import { AchievementsPanel, type Achievement } from '../components/AchievementsPanel';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'profile'>('home');
  const [currentWeek, setCurrentWeek] = useState(0);

  // Level system data - геймификация!
  const levelData: LevelData = {
    level: 12,
    xp: 2400,
    nextLevelXp: 3000,
    title: 'Постоянный клиент',
    rank: '⚡ Опытный',
    achievements: 8,
    totalOrders: 24,
  };

  // Achievements data - достижения!
  const achievements: Achievement[] = [
    {
      id: 'first_order',
      icon: '🎯',
      title: 'Первый заказ',
      description: 'Создайте свой первый заказ',
      unlocked: true,
      reward: '+10 XP',
    },
    {
      id: 'regular_customer',
      icon: '⭐',
      title: 'Постоянный клиент',
      description: 'Совершите 10 заказов',
      unlocked: true,
      progress: 24,
      maxProgress: 10,
      reward: '-5% скидка',
    },
    {
      id: 'subscription_master',
      icon: '🔄',
      title: 'Мастер подписок',
      description: 'Создайте 2 подписки',
      unlocked: true,
      progress: 2,
      maxProgress: 2,
      reward: '-10₽',
    },
    {
      id: 'early_bird',
      icon: '🌅',
      title: 'Ранняя пташка',
      description: 'Заказ до 8:00 утра',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: 'eco_warrior',
      icon: '🌱',
      title: 'Эко-воин',
      description: 'Сдайте 50 мешков на переработку',
      unlocked: true,
      progress: 73,
      maxProgress: 50,
      reward: 'Эко-значок',
    },
    {
      id: 'referral_king',
      icon: '👥',
      title: 'Король рефералов',
      description: 'Пригласите 5 соседей',
      unlocked: false,
      progress: 3,
      maxProgress: 5,
    },
    {
      id: 'speed_demon',
      icon: '⚡',
      title: 'Скоростной заказ',
      description: 'Создайте заказ за 60 сек',
      unlocked: true,
      reward: '+25 XP',
    },
    {
      id: 'loyal_customer',
      icon: '💎',
      title: 'VIP клиент',
      description: 'Используйте платформу 30 дней подряд',
      unlocked: false,
      progress: 12,
      maxProgress: 30,
    },
  ];

  // Mock data - my booked contractors
  const myContractors = [
    {
      id: 1,
      name: 'Иван Петров',
      avatar: '👨',
      rating: 4.9,
      days: [1, 4], // Monday, Thursday
      time: '18:00',
      price: 40, // with -10₽ discount
      nextOrder: 'Завтра в 18:00',
    },
    {
      id: 2,
      name: 'Алексей Смирнов',
      avatar: '🧑',
      rating: 4.8,
      days: [2, 5], // Tuesday, Friday
      time: '16:00',
      price: 35, // with -10₽ discount
      nextOrder: 'Пт в 16:00',
    },
  ];

  // Today's orders
  const todayOrders = [
    {
      id: 1,
      address: 'ул. Баумана, 58',
      time: '18:00',
      contractor: 'Иван Петров',
      price: 40,
      status: 'confirmed',
    },
  ];

  // Mock data
  const stats = {
    totalOrders: 24,
    activeOrders: 2,
    completedOrders: 22,
    referrals: 3,
  };

  // Week days with orders
  const weekDays = [
    { 
      day: 'Пн', 
      date: '3',
      orders: [
        { id: 1, time: '08:00 - 16:00', address: 'Склад A', people: 3, status: 'active', contractor: 'Дмитрий', price: '50₽' },
        { id: 2, time: '14:00 - 22:00', address: 'Распред. центр', people: 2, status: 'waiting', responses: 5, price: '45₽' },
      ]
    },
    { 
      day: 'Вт', 
      date: '4',
      orders: [
        { id: 3, time: '09:00 - 17:00', address: 'Главный офис', people: 1, status: 'waiting', responses: 2, price: '40₽' },
      ]
    },
    { 
      day: 'Ср', 
      date: '5',
      orders: [
        { id: 4, time: '08:00 - 16:00', address: 'Склад Б', people: 4, status: 'active', contractor: 'Александр', price: '60₽' },
        { id: 5, time: '10:00 - 18:00', address: 'Склад А', people: 3, status: 'active', contractor: 'Игорь', price: '50₽' },
      ]
    },
    { 
      day: 'Чт', 
      date: '6',
      orders: [
        { id: 6, time: '08:00 - 16:00', address: 'Распред. центр', people: 3, status: 'waiting', responses: 8, price: '55₽' },
      ]
    },
    { 
      day: 'Пт', 
      date: '7',
      orders: [
        { id: 7, time: '09:00 - 17:00', address: 'Главный офис', people: 2, status: 'active', contractor: 'Дмитрий', price: '45₽' },
        { id: 8, time: '14:00 - 22:00', address: 'Склад А', people: 1, status: 'waiting', responses: 3, price: '40₽' },
      ]
    },
    { 
      day: 'Сб', 
      date: '8',
      orders: [
        { id: 9, time: '08:00 - 16:00', address: 'Склад Б', people: 5, status: 'waiting', responses: 12, price: '70₽' },
      ]
    },
    { 
      day: 'Вс', 
      date: '9',
      orders: []
    },
  ];

  const history = [
    { id: 10, date: '2 марта', time: '08:00-16:00', address: 'Склад A', status: 'Завершено', price: '₽1 440', earned: '₽1 500' },
    { id: 11, date: '1 марта', time: '16:00-00:00', address: 'Склад Б', status: 'Завершено', price: '₽2 160', earned: '₽1 728' },
    { id: 12, date: '28 февр.', time: '08:00-17:00', address: 'Склад Е', status: 'Завершено', price: '₽1 800', earned: '₽1 620' },
  ];

  const weekOrders = weekDays;
  
  // Mock subscriptions
  const subscriptions = [
    {
      id: 1,
      address: 'ул. Баумана, 58',
      days: [1, 4], // Monday, Thursday
      time: '18:00',
      price: '50₽',
      active: true,
    },
    {
      id: 2,
      address: 'пр. Победы, 120',
      days: [2, 5], // Tuesday, Friday
      time: '16:00',
      price: '45₽',
      active: true,
    },
  ];

  const getDayLabel = (dayId: number) => {
    const labels = ['', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    return labels[dayId];
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        {/* Switch Role Banner */}
        <div 
          onClick={() => navigate('/contractor')}
          className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 px-3 py-2.5 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="container mx-auto flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Хотите заработать?</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/20 px-2 py-1 rounded">5000₽/вечер</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Мои заказы</div>
                <div className="text-xs text-gray-500">{stats.activeOrders} активных</div>
              </div>
            </div>
            <Button
              onClick={() => navigate('/create-order')}
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Создать
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-3 py-2 pb-16">
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Level System - компактный вариант */}
            <LevelSystem data={levelData} variant="customer" compact={true} />

            {/* Active orders TODAY */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Сегодня</h2>
                <span className="text-sm text-gray-500">Понедельник, 10 марта</span>
              </div>

              <div className="space-y-3">
                {weekOrders[0].orders.map((order) => (
                  <div key={order.id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-all">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-lg font-semibold text-gray-900">{order.time}</div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{order.address}</span>
                          </div>
                          {order.status === 'active' ? (
                            <div className="flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-2 rounded-lg inline-flex">
                              <CheckCircle className="w-4 h-4" />
                              <span>Исполнитель: {order.contractor}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm bg-orange-50 text-orange-700 px-3 py-2 rounded-lg inline-flex">
                              <Clock className="w-4 h-4" />
                              <span>{order.responses} откликов</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-semibold text-gray-900">{order.price}</div>
                        </div>
                      </div>
                      
                      {order.status === 'active' && (
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            Позвонить
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Написать
                          </Button>
                        </div>
                      )}
                      {order.status === 'waiting' && (
                        <Button variant="outline" className="w-full">
                          Посмотреть отклики
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-gray-900 mb-1">{stats.activeOrders}</div>
                <div className="text-xs text-gray-600">Активных</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-gray-900 mb-1">{stats.completedOrders}</div>
                <div className="text-xs text-gray-600">Выполнено</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-green-600 mb-1">-15₽</div>
                <div className="text-xs text-gray-600">Скидка</div>
              </div>
            </div>

            {/* Active Subscriptions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Подписки</h2>
                <Button
                  onClick={() => navigate('/create-subscription')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Создать
                </Button>
              </div>

              {subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-gray-900">Регулярный вывоз</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{sub.address}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{sub.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {sub.days.map((dayId) => (
                                <span key={dayId} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                  {getDayLabel(dayId)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-semibold text-gray-900">{sub.price}</div>
                          <div className="text-xs text-gray-500">за раз</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-white">
                          Редактировать
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-white">
                          Пауза
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                  <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-sm font-medium text-gray-900 mb-2">Создайте график вывоза</div>
                  <div className="text-xs text-gray-500 mb-4">
                    Настройте регулярный вывоз мусора и получите скидку
                  </div>
                  <Button
                    onClick={() => navigate('/create-subscription')}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Создать подписку
                  </Button>
                </div>
              )}
            </div>

            {/* My Contractors Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Мои исполнители</h2>
                <Button
                  onClick={() => navigate('/find-contractors')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Найти
                </Button>
              </div>

              <div 
                className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-6 cursor-pointer hover:border-purple-400 transition-all"
                onClick={() => navigate('/my-contractors')}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">Постоянные исполнители</div>
                    <div className="space-y-2 mb-4">
                      {myContractors.map((contractor) => (
                        <div key={contractor.id} className="text-sm text-gray-700">
                          • {contractor.name} ⭐ {contractor.rating} ({getDayLabel(contractor.days[0])}, {getDayLabel(contractor.days[1])} в {contractor.time})
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="bg-white border border-purple-200 px-3 py-1.5 rounded-lg">
                        <span className="text-purple-700 font-semibold">-80₽ экономия/месяц</span>
                      </div>
                      <div className="text-gray-600">
                        2 активных подписки
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Active orders */}
            <div>
              <h2 className="text-lg text-gray-900 mb-4">Активные заказы</h2>
              {weekOrders[currentWeek].orders.length > 0 ? (
                <div className="space-y-3">
                  {weekOrders[currentWeek].orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{order.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>Сегодня в {order.time}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{order.price}</div>
                        </div>
                      </div>
                      {order.status === 'active' ? (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          <span>Исполнитель: {order.contractor}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                          <Clock className="w-4 h-4" />
                          <span>Ожидание • {order.responses} откликов</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <div className="text-gray-600 mb-4">У вас пока нет активных заказов</div>
                  <Button onClick={() => navigate('/create-order')} className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="w-5 h-5 mr-2" />
                    Создать заказ
                  </Button>
                </div>
              )}
            </div>

            {/* History */}
            <div>
              <h2 className="text-lg text-gray-900 mb-4">История</h2>
              <div className="space-y-2">
                {history.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">{order.address}</div>
                      <div className="text-xs text-gray-500">{order.date} • {order.contractor}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{order.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Profile Header - Hero Section */}
            <div className="bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold mb-1">Александр</h1>
                      <div className="text-sm text-white/80">+7 (903) 123-45-67</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => alert('Редактироваие профиля')}
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm h-8"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Редактировать
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-2xl font-bold">{stats.completedOrders}</span>
                    </div>
                    <div className="text-xs text-white/80">выполнено</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4" />
                      <span className="text-2xl font-bold">{stats.activeOrders}</span>
                    </div>
                    <div className="text-xs text-white/80">активных</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <UserPlus className="w-4 h-4" />
                      <span className="text-2xl font-bold">{stats.referrals}</span>
                    </div>
                    <div className="text-xs text-white/80">рефералов</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Level System */}
            <LevelSystem data={levelData} variant="customer" />

            {/* Achievements */}
            <AchievementsPanel achievements={achievements} variant="customer" />

            {/* Address Info */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Адреса вывоза</h2>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">ул. Баумана, 58</div>
                      <div className="text-xs text-gray-500">Подъезд 2, Этаж 5, Кв. 42</div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                        <RefreshCw className="w-3 h-3" />
                        Подписка активна
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Добавить адрес
                </Button>
              </div>
            </div>

            {/* Switch to Contractor Mode */}
            <div 
              onClick={() => navigate('/contractor')}
              className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl p-5 text-white relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30">
                      <ArrowRightLeft className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">Хотите заработать?</div>
                      <div className="text-sm text-white/80">Переключитесь в режим исполнителя</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white" />
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold">5000₽</div>
                      <div className="text-xs text-white/80">за вечер</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">100+</div>
                      <div className="text-xs text-white/80">адресов</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">3-4ч</div>
                      <div className="text-xs text-white/80">работы</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button 
                onClick={() => alert('Настройки уведомлений')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Уведомления</div>
                    <div className="text-xs text-gray-500">Настройка push и email</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button 
                onClick={() => alert('Способы оплаты')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Спооб оплаты</div>
                    <div className="text-xs text-gray-500">Карты и банковские счета</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button 
                onClick={() => navigate('/invite-neighbor')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Пригласить соседей</div>
                    <div className="text-xs text-gray-500">Чем больше вас - тем дешевле каждому</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button 
                onClick={() => alert('Помощь и поддержка')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Помощь и поддержка</div>
                    <div className="text-xs text-gray-500">FAQ и связь с поддержкой</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Logout */}
            <Button 
              onClick={() => {
                if (confirm('Вы уверены, что хотите выйти?')) {
                  navigate('/role-select');
                }
              }}
              variant="outline" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-11"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти из аккаунта
            </Button>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 ${
                activeTab === 'profile' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs">Профиль</span>
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 ${
                activeTab === 'home' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs">Главная</span>
            </button>
            <button
              onClick={() => navigate('/create-order')}
              className="flex flex-col items-center gap-1 text-gray-900"
            >
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center -mt-2">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs">Создать</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}