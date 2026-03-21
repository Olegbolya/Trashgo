import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Home, MapPin, User, Star, Briefcase, TrendingUp, Gift, Package, Clock, ChevronLeft, ChevronRight, CheckCircle, Calendar, Search, Navigation, Plus, MessageCircle, Phone, Bell, CreditCard, UserPlus, HelpCircle, Edit, LogOut, Award, Wallet, ArrowRightLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { LevelSystem, type LevelData } from '../components/LevelSystem';
import { AchievementsPanel, type Achievement } from '../components/AchievementsPanel';
import { toast } from 'sonner';

export default function ContractorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'profile' | 'find'>('home');
  const [isOnShift, setIsOnShift] = useState(true);

  // Level system data - геймификация для исполнителей!
  const levelData: LevelData = {
    level: 18,
    xp: 4500,
    nextLevelXp: 5000,
    title: 'Профессиональный исполнитель',
    rank: '💪 Профи',
    achievements: 12,
    totalOrders: 143,
  };

  // Achievements data - достижения для исполнителей!
  const achievements: Achievement[] = [
    {
      id: 'first_pickup',
      icon: '🎯',
      title: 'Первый вывоз',
      description: 'Выполните свой первый заказ',
      unlocked: true,
      reward: '+10 XP',
    },
    {
      id: 'speed_master',
      icon: '⚡',
      title: 'Мастер скорости',
      description: 'Вывезите 100 адресов за день',
      unlocked: true,
      progress: 143,
      maxProgress: 100,
      reward: '+50 XP',
    },
    {
      id: 'reliable_contractor',
      icon: '⭐',
      title: 'Надежный исполнитель',
      description: 'Рейтинг 4.5+ после 20 заказов',
      unlocked: true,
      progress: 143,
      maxProgress: 20,
      reward: 'Значок надежности',
    },
    {
      id: 'subscription_pro',
      icon: '🔄',
      title: 'Мастер подписок',
      description: 'Получите 5 постоянных адресов',
      unlocked: true,
      progress: 4,
      maxProgress: 5,
      reward: 'Приоритет в поиске',
    },
    {
      id: 'early_bird',
      icon: '🌅',
      title: 'Ранняя пташка',
      description: 'Начните вывоз до 7:00',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: 'marathon_runner',
      icon: '🏃',
      title: 'Марафонец',
      description: 'Работайте 30 дней подряд',
      unlocked: false,
      progress: 18,
      maxProgress: 30,
    },
    {
      id: 'top_rated',
      icon: '🌟',
      title: 'Лучший рейтинг',
      description: 'Получите рейтинг 5.0',
      unlocked: false,
      progress: 4.8,
      maxProgress: 5.0,
    },
    {
      id: 'big_earner',
      icon: '💰',
      title: 'Большой заработок',
      description: 'Заработайте 50000₽ за месяц',
      unlocked: false,
      progress: 32400,
      maxProgress: 50000,
    },
  ];

  // Функция для уведомления клиентов
  const handleStartPickup = (order: any) => {
    // Показываем уведомление исполнителю
    toast.success('🚀 Вынос начат!', {
      description: `Клиентам по адресу ${order.address} отправлены уведомления`,
      duration: 3000,
    });

    // Имитируем отправку уведомлений клиентам
    setTimeout(() => {
      toast.info('📱 Уведомления доставлены', {
        description: `${order.addressCount} клиентов получили push-уведомление`,
        duration: 2500,
      });
    }, 1000);
  };

  // Mock data - my subscribed addresses
  const myAddresses = [
    {
      id: 1,
      address: 'ул. Баумана, 58',
      building: 'Подъезд 1-3',
      customer: 'Александр',
      days: [1, 4], // Monday, Thursday
      time: '18:00-20:00',
      addressCount: 12,
      price: 600, // 12 × 50₽
      nextOrder: 'Завтра в 18:00',
      floor: '1-9 этажи',
      hasLift: true,
    },
    {
      id: 2,
      address: 'пр. Победы, 120',
      building: 'Подъезд 1-2',
      customer: 'Мария',
      days: [2, 5], // Tuesday, Friday
      time: '17:00-19:00',
      addressCount: 8,
      price: 400, // 8 × 50₽
      nextOrder: 'Пт в 17:00',
      floor: '1-5 этажи',
      hasLift: false,
    },
    {
      id: 3,
      address: 'ул. Пушкина, 23',
      building: 'Подъезд 1-5',
      customer: 'ЖК "Центральный"',
      days: [3, 6], // Wednesday, Saturday
      time: '16:00-19:00',
      addressCount: 18,
      price: 900, // 18 × 50₽
      nextOrder: 'Ср в 16:00',
      floor: '1-12 этажи',
      hasLift: true,
    },
    {
      id: 4,
      address: 'ул. Чистопольская, 61',
      building: 'Подъезды 1-4',
      customer: 'ТСЖ "Надежда"',
      days: [1, 3, 5], // Mon, Wed, Fri
      time: '17:00-20:00',
      addressCount: 22,
      price: 1100, // 22 × 50₽
      nextOrder: 'Завтра в 17:00',
      floor: '1-9 этажи',
      hasLift: true,
    },
  ];

  // Today's orders from subscribed addresses
  const todayOrders = [
    {
      id: 1,
      address: 'ул. Баумана, 58',
      building: 'Подъезд 1-3',
      customer: 'Александр',
      time: '18:00-20:00',
      addressCount: 12,
      price: 600,
      floor: '1-9 этажи',
      hasLift: true,
      status: 'upcoming',
    },
    {
      id: 2,
      address: 'ул. Чистопольская, 61',
      building: 'Подъезды 1-4',
      customer: 'ТСЖ "Надежда"',
      time: '17:00-20:00',
      addressCount: 22,
      price: 1100,
      floor: '1-9 этажи',
      hasLift: true,
      status: 'upcoming',
    },
  ];

  const getDayLabel = (dayId: number) => {
    const labels = ['', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    return labels[dayId];
  };

  const totalAddresses = myAddresses.reduce((sum, addr) => sum + addr.addressCount, 0);
  const todayTotalAddresses = todayOrders.reduce((sum, order) => sum + order.addressCount, 0);
  const todayTotalEarned = todayOrders.reduce((sum, order) => sum + order.price, 0);

  const [currentWeek, setCurrentWeek] = useState(0);

  const weekDays = [
    { day: 'Пн', date: '10', orders: 2, addresses: 34, earned: 1700 },
    { day: 'Вт', date: '11', orders: 1, addresses: 8, earned: 400 },
    { day: 'Ср', date: '12', orders: 3, addresses: 52, earned: 2600 },
    { day: 'Чт', date: '13', orders: 2, addresses: 34, earned: 1700 },
    { day: 'Пт', date: '14', orders: 1, addresses: 22, earned: 1100 },
    { day: 'Сб', date: '15', orders: 2, addresses: 26, earned: 1300 },
    { day: 'Вс', date: '16', orders: 0, addresses: 0, earned: 0 },
  ];

  const today = new Date();
  const todayShort = today.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

  const history = [
    { id: 1, address: 'ул. Баумана, 58', date: '9 марта', customer: '12 адресов', price: '600₽' },
    { id: 2, address: 'пр. Победы, 120', date: '7 марта', customer: '8 адресов', price: '400₽' },
    { id: 3, address: 'ул. Пушкина, 23', date: '6 марта', customer: '18 адресов', price: '900₽' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900">TrashGo</div>
              <div className="text-xs text-gray-500">Исполнитель</div>
            </div>
          </div>
        </div>

        {/* Status toggle */}
        <div className="px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setIsOnShift(!isOnShift)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isOnShift ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span>{isOnShift ? '🟢 Открыт для заказов' : '⚫ Не принимаю заказы'}</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              activeTab === 'home' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="w-5 h-5" />
            Главная
          </button>
          <button
            onClick={() => setActiveTab('find')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              activeTab === 'find' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Search className="w-5 h-5" />
            Найти заказы
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              activeTab === 'orders' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-5 h-5" />
            Мои адреса
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              activeTab === 'profile' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-100'
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
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Мои заказы</div>
                <div className="text-xs text-gray-500">{totalAddresses} адресов</div>
              </div>
            </div>
            <button
              onClick={() => setIsOnShift(!isOnShift)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isOnShift ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isOnShift ? 'Открыт' : 'Закрыт'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
      <div className="container mx-auto px-3 py-2 pb-20 lg:px-8 lg:py-6 lg:pb-6">
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Level System - компактный вариант */}
            <LevelSystem data={levelData} variant="contractor" compact={true} />

            {/* Today's schedule */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-gray-900">Сегодня</h2>
                <span className="text-xs text-gray-500">{todayShort}</span>
              </div>

              {todayOrders.length > 0 ? (
                <div className="space-y-2">
                  {todayOrders.map((order) => (
                    <div key={order.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl overflow-hidden">
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-sm font-semibold text-gray-900">{order.time}</div>
                              <div className="px-1.5 py-0.5 bg-green-600 text-white text-xs font-medium rounded">
                                {order.addressCount} адр
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-sm text-gray-900 font-medium">{order.address}</span>
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                              {order.building} • {order.customer}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{order.floor}</span>
                              <span>•</span>
                              <span>{order.hasLift ? '🛗' : '🚶'}</span>
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-2xl font-bold text-green-600">{order.price}₽</div>
                            <div className="text-xs text-gray-500">{order.addressCount}×50</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                            onClick={() => handleStartPickup(order)}
                          >
                            Начать
                          </Button>
                          <Button variant="outline" size="sm" className="px-3 h-8" onClick={() => toast.info(`Клиент: ${order.customer}`, { description: 'Контакт доступен после начала выноса', duration: 2500 })}>
                            <Phone className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-900 mb-2">Сегодня свободный день</div>
                  <div className="text-sm text-gray-500">
                    Нет запланированных заказов
                  </div>
                </div>
              )}
            </div>

            {/* My subscribed addresses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-gray-900">Мои адреса</h2>
                <Button
                  onClick={() => setActiveTab('find')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 h-7 text-xs px-2"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Найти
                </Button>
              </div>

              <div className="space-y-2">
                {myAddresses.map((address) => (
                  <div key={address.id} className="bg-white border border-gray-200 rounded-xl p-3 hover:border-gray-300 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-900">{address.address}</span>
                        </div>
                        <div className="text-xs text-gray-600 mb-1.5">
                          {address.building} • {address.customer}
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 border border-green-200 rounded">
                            <Package className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">{address.addressCount} адр</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {address.days.map((dayId) => (
                              <span key={dayId} className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                {getDayLabel(dayId)}
                              </span>
                            ))}
                            <span className="text-xs text-gray-600">{address.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{address.floor}</span>
                          <span>•</span>
                          <span>{address.hasLift ? '🛗' : '🚶'}</span>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-2xl font-bold text-gray-900">{address.price}₽</div>
                        <div className="text-xs text-gray-500">{address.addressCount}×50</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => toast.info('Чат в разработке', { description: 'Скоро появится встроенный мессенджер', duration: 2000 })}>
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Чат
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => toast.info(`Клиент: ${address.customer}`, { description: 'Контакт виден в день вывоза', duration: 2500 })}>
                        <Phone className="w-3 h-3 mr-1" />
                        Звонок
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {myAddresses.length === 0 && (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-900 mb-2">Нет подписок</div>
                  <div className="text-sm text-gray-500 mb-6">
                    Найдите остоянные адреса для стабильного дохода
                  </div>
                  <Button
                    onClick={() => setActiveTab('find')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Найти адреса
                  </Button>
                </div>
              )}
            </div>

            {/* Week calendar */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Неделя</h2>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg text-center ${
                      day.orders > 0
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="text-xs text-gray-600">{day.day}</div>
                    <div className="text-base font-semibold text-gray-900">{day.date}</div>
                    {day.orders > 0 && (
                      <>
                        <div className="text-xs text-gray-500">{day.addresses}а</div>
                        <div className="text-xs font-semibold text-green-600">{day.earned}₽</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">История</h2>
              <div className="space-y-1.5">
                {history.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.address}</div>
                      <div className="text-xs text-gray-500">{item.date} • {item.customer}</div>
                    </div>
                    <div className="text-sm font-medium text-green-600">{item.price}</div>
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
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                    <User className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Дмитрий</h1>
                    <div className="text-sm text-gray-500">+7 (903) 987-65-43</div>
                  </div>
                </div>
                <Button
                  onClick={() => alert('Редактирование профиля')}
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
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xl font-semibold text-gray-900">4.8</span>
                  </div>
                  <div className="text-xs text-gray-500">47 отзывов</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-semibold text-gray-900">{totalAddresses}</div>
                  <div className="text-xs text-gray-500">адресов</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-semibold text-gray-900">143</div>
                  <div className="text-xs text-gray-500">выполнено</div>
                </div>
              </div>
            </div>

            {/* Earnings Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Заработок</h2>
                </div>
                <button
                  onClick={() => alert('История выплат')}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  История
                  <TrendingUp className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">За неделю</div>
                  <div className="text-2xl font-bold text-green-700">8 800₽</div>
                  <div className="text-xs text-gray-400 mt-0.5">176 адресов</div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">За месяц</div>
                  <div className="text-2xl font-bold text-green-700">32 400₽</div>
                  <div className="text-xs text-gray-400 mt-0.5">648 адресов</div>
                </div>
              </div>
            </div>

            {/* Level System */}
            <LevelSystem data={levelData} variant="contractor" />

            {/* Achievements */}
            <AchievementsPanel achievements={achievements} variant="contractor" />

            {/* Work Info */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Рабочая информация</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Район работы</div>
                  <div className="text-sm font-medium text-gray-900">Вахитовский</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Транспорт</div>
                  <div className="text-sm font-medium text-gray-900">🚗 Машина</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">График</div>
                  <div className="text-sm font-medium text-gray-900">ПН-СБ</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Время</div>
                  <div className="text-sm font-medium text-gray-900">17:00-21:00</div>
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
                onClick={() => alert('Способы оплаты')}
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
                onClick={() => alert('Реферальная программа')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Реферальная программа</div>
                    <div className="text-xs text-gray-500">Приглашайте друзей — получайте бонусы</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => alert('Помощь и поддержка')}
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

            {/* Logout */}
            <Button 
              onClick={() => {
                if (confirm('Вы уверены, что хотите выйти?')) {
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

        {/* Find orders tab */}
        {activeTab === 'find' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Заказы рядом</h1>
              <div className="text-sm text-gray-500">Вахитовский р-н</div>
            </div>

            {/* Summary card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">3 250₽</div>
                  <div className="text-xs text-gray-500 mt-0.5">можно заработать</div>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div className="text-xs text-gray-500 mt-0.5">заказов доступно</div>
                </div>
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-2">
              {[
                { id: 12847, address: 'ул. Баумана, 58', building: 'Подъезд 1-3', time: '14:00–16:00', addressCount: 12, price: 600, distance: '1.2 км', description: '1-9 этажи, есть лифт', customer: 'Александр', rating: 4.9 },
                { id: 12846, address: 'пр. Победы, 120', building: 'Подъезд 1-2', time: '15:00–17:00', addressCount: 8, price: 400, distance: '2.5 км', description: '1-5 этажи, без лифта', customer: 'Мария', rating: 4.7 },
                { id: 12845, address: 'ул. Пушкина, 23', building: 'Подъезд 1-5', time: '16:00–19:00', addressCount: 18, price: 900, distance: '3.1 км', description: '1-12 этажи, есть лифт', customer: 'ЖК Центральный', rating: 5.0 },
                { id: 12844, address: 'ул. Чистопольская, 61', building: 'Подъезды 1-4', time: '17:00–20:00', addressCount: 22, price: 1100, distance: '1.8 км', description: '1-9 этажи, есть лифт', customer: 'ТСЖ Надежда', rating: 4.8 },
                { id: 12843, address: 'ул. Гаврилова, 12', building: 'Подъезд 1', time: '18:00–20:00', addressCount: 5, price: 250, distance: '0.8 км', description: '1-5 этажи, без лифта', customer: 'Елена', rating: 4.6 },
              ].map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-base font-semibold text-gray-900">{order.time}</span>
                        <span className="text-xs text-gray-400">{order.distance}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{order.address}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{order.building} • {order.customer}</div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-100 rounded text-xs text-green-700 font-medium">
                          <Package className="w-3 h-3" />
                          {order.addressCount} адр
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {order.rating}
                        </span>
                        <span className="text-xs text-gray-500">{order.description}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-gray-900">{order.price}₽</div>
                      <div className="text-xs text-gray-400">{order.addressCount}×50</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-9"
                    onClick={() => toast.success(`Заявка на заказ #${order.id} отправлена!`, { duration: 2500 })}
                  >
                    Взять заказ
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation - mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-around h-14">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'profile' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Профиль</span>
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'home' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Главная</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'orders' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span className="text-xs">Адреса</span>
            </button>
            <button
              onClick={() => setActiveTab('find')}
              className={`flex flex-col items-center gap-0.5 ${activeTab === 'find' ? 'text-green-600' : 'text-gray-400'}`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center -mt-1 ${activeTab === 'find' ? 'bg-green-600' : 'bg-gray-800'}`}>
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs">Найти</span>
            </button>
          </div>
        </div>
      </nav>
      </div>
    </div>
  );
}