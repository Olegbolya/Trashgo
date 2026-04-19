import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/auth.store';
import { Home, MapPin, User, Plus, Package, CheckCircle, Clock, Gift, ChevronLeft, ChevronRight, Calendar, Repeat, RefreshCw, Star, Edit, LogOut, Bell, CreditCard, UserPlus, HelpCircle, Award, Wallet, TrendingDown, ArrowRightLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { LevelSystem, type LevelData } from '../components/LevelSystem';
import { AchievementsPanel, type Achievement } from '../components/AchievementsPanel';
import { toast } from 'sonner';
import { getDayLabel } from '../lib/utils';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'profile' | 'create'>('home');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [createForm, setCreateForm] = useState({ address: '', date: '', time: '', volume: 1, price: 50, description: '' });

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

  const today = new Date();
  const todayLabel = today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCapitalized = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

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

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900">TrashGo</div>
              <div className="text-xs text-gray-500">Вынос мусора</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              activeTab === 'home' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="w-5 h-5" />
            Главная
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              activeTab === 'create' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-5 h-5" />
            Создать заказ
          </button>
          <button
            onClick={() => navigate('/my-subscriptions')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw className="w-5 h-5" />
            Подписки
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              activeTab === 'profile' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            Профиль
          </button>
        </nav>

      </aside>

      {/* Mobile header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
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
              onClick={() => setActiveTab('create')}
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
      <div className="flex-1 lg:ml-64">
      <div className="container mx-auto px-3 py-2 pb-20 lg:px-8 lg:py-6 lg:pb-6">
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Level System - компактный вариант */}
            <LevelSystem data={levelData} variant="customer" compact={true} />

            {/* Active orders TODAY */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Сегодня</h2>
                <span className="text-sm text-gray-500">{todayCapitalized}</span>
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
                          <Button variant="outline" className="flex-1" onClick={() => toast.info('Позвоните исполнителю', { description: `+7 (903) 123-45-67 — ${order.contractor}`, duration: 3000 })}>
                            Позвонить
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => toast.info('Чат в разработке', { description: 'Скоро появится встроенный мессенджер', duration: 2500 })}>
                            Написать
                          </Button>
                        </div>
                      )}
                      {order.status === 'waiting' && (
                        <Button variant="outline" className="w-full" onClick={() => toast.info(`${order.responses} откликов на ваш заказ`, { description: 'Выберите подходящего исполнителя', duration: 2500 })}>
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
                <div className="text-2xl font-semibold text-green-600 mb-1">15₽</div>
                <div className="text-xs text-gray-600">Экономия</div>
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
                    <div key={sub.id} className="bg-white border border-gray-200 rounded-2xl p-5">
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
                        <Button variant="outline" size="sm" className="flex-1 bg-white" onClick={() => toast.info('Редактирование подписки', { description: `${sub.address} — ${sub.time}`, duration: 2500 })}>
                          Редактировать
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-white" onClick={() => toast.success('Подписка приостановлена', { description: `${sub.address}`, duration: 2500 })}>
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
                  onClick={() => toast.info('Поиск исполнителей', { description: 'Откройте через меню или используйте раздел "Мои исполнители"', duration: 3000 })}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Найти
                </Button>
              </div>

              <div 
                className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-gray-400 transition-all"
                onClick={() => navigate('/my-contractors')}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-gray-600" />
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
                      <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                        <span className="text-gray-700 font-semibold">-80₽ экономия/месяц</span>
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
                  <Button onClick={() => setActiveTab('create')} className="bg-gray-900 hover:bg-gray-800 text-white">
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
            {/* Profile Header */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <User className="w-7 h-7 text-gray-400" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Александр</h1>
                    <div className="text-sm text-gray-500">+7 (903) 123-45-67</div>
                  </div>
                </div>
                <Button
                  onClick={() => toast.info('Редактирование профиля', { description: 'Функция в разработке' })}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Изменить
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-semibold text-gray-900">{stats.completedOrders}</div>
                  <div className="text-xs text-gray-500">выполнено</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-semibold text-gray-900">{stats.activeOrders}</div>
                  <div className="text-xs text-gray-500">активных</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-semibold text-gray-900">{stats.referrals}</div>
                  <div className="text-xs text-gray-500">рефералов</div>
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
                <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info('Добавление адреса', { description: 'Функция в разработке', duration: 2000 })}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Добавить адрес
                </Button>
              </div>
            </div>

            {/* Switch to Contractor Mode */}
            <button
              onClick={() => navigate('/contractor')}
              className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Хотите заработать?</div>
                  <div className="text-xs text-gray-500">Переключиться в режим исполнителя</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Menu Items */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toast.info('Настройки уведомлений', { description: 'Функция в разработке' })}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Уведомления</div>
                    <div className="text-xs text-gray-500">Настройка push и email</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => toast.info('Способы оплаты', { description: 'Функция в разработке' })}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Способ оплаты</div>
                    <div className="text-xs text-gray-500">Карты и банковские счета</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => navigate('/invite-neighbor')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Пригласить соседей</div>
                    <div className="text-xs text-gray-500">Чем больше вас — тем дешевле каждому</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => toast.info('Помощь и поддержка', { description: 'Функция в разработке' })}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Помощь и поддержка</div>
                    <div className="text-xs text-gray-500">FAQ и связь с поддержкой</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{isDark ? 'Светлая тема' : 'Тёмная тема'}</div>
                  <div className="text-xs text-gray-500">{isDark ? 'Переключиться на светлую' : 'Переключиться на тёмную'}</div>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${isDark ? 'left-5' : 'left-1'}`} />
              </div>
            </button>

            {/* Logout */}
            <Button
              onClick={() => {
                if (confirm('Вы уверены, что хотите выйти?')) {
                  logout();
                  navigate('/');
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

        {/* Create order tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold text-gray-900">Новый заказ</h1>
            </div>

            {/* Form */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Детали заказа</h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">Адрес вывоза</label>
                  <input
                    value={createForm.address}
                    onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                    placeholder="ул. Баумана, 58, кв. 42"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-500 mb-1.5 block">Дата</label>
                    <input
                      type="date"
                      value={createForm.date}
                      onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1.5 block">Время</label>
                    <input
                      type="time"
                      value={createForm.time}
                      onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-500 mb-1.5 block">Мешков</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setCreateForm({ ...createForm, volume: Math.max(1, createForm.volume - 1) })}
                        className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 text-lg leading-none"
                      >−</button>
                      <div className="flex-1 text-center text-sm font-medium text-gray-900">{createForm.volume}</div>
                      <button
                        onClick={() => setCreateForm({ ...createForm, volume: createForm.volume + 1 })}
                        className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 text-lg leading-none"
                      >+</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1.5 block">Цена, ₽</label>
                    <input
                      type="number"
                      value={createForm.price}
                      onChange={(e) => setCreateForm({ ...createForm, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">Комментарий (необязательно)</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Этаж, подъезд, особые пожелания..."
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Итого к оплате</div>
              <div className="text-2xl font-bold text-gray-900">{createForm.price}₽</div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => setActiveTab('home')}
              >
                Отменить
              </Button>
              <Button
                className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                onClick={() => {
                  toast.success('Заказ создан!', { description: 'Исполнители уже видят ваш заказ', duration: 3000 });
                  setCreateForm({ address: '', date: '', time: '', volume: 1, price: 50, description: '' });
                  setActiveTab('home');
                }}
              >
                Опубликовать заказ
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation - mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
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
              onClick={() => setActiveTab('create')}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-2 ${activeTab === 'create' ? 'bg-red-600' : 'bg-gray-900'}`}>
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xs ${activeTab === 'create' ? 'text-red-600' : 'text-gray-900'}`}>Создать</span>
            </button>
          </div>
        </div>
      </nav>
      </div>
    </div>
  );
}