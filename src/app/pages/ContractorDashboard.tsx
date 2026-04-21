import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/auth.store';
import { Home, MapPin, User, Star, Briefcase, TrendingUp, Package, Clock, CheckCircle, Search, Plus, MessageCircle, Phone, Bell, CreditCard, UserPlus, HelpCircle, Edit, LogOut, Wallet, ArrowRightLeft, Moon, Sun, ChevronRight, Calendar, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LevelSystem, type LevelData } from '../components/LevelSystem';
import { AchievementsPanel, type Achievement } from '../components/AchievementsPanel';
import { toast } from 'sonner';
import { getDayLabel } from '../lib/utils';

const ACCENT = '#2196F3';

export default function ContractorDashboard() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'profile' | 'find'>('home');
  const [isOnShift, setIsOnShift] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
    input:   isDark ? '#1f2937' : '#ffffff',
  };

  const levelData: LevelData = {
    level: 18, xp: 4500, nextLevelXp: 5000,
    title: 'Профессиональный исполнитель', rank: '💪 Профи',
    achievements: 12, totalOrders: 143,
  };

  const achievements: Achievement[] = [
    { id: 'first_pickup', icon: '🎯', title: 'Первый вывоз', description: 'Выполните свой первый заказ', unlocked: true, reward: '+10 XP' },
    { id: 'speed_master', icon: '⚡', title: 'Мастер скорости', description: 'Вывезите 100 адресов за день', unlocked: true, progress: 143, maxProgress: 100, reward: '+50 XP' },
    { id: 'reliable_contractor', icon: '⭐', title: 'Надежный исполнитель', description: 'Рейтинг 4.5+ после 20 заказов', unlocked: true, progress: 143, maxProgress: 20, reward: 'Значок надежности' },
    { id: 'subscription_pro', icon: '🔄', title: 'Мастер подписок', description: 'Получите 5 постоянных адресов', unlocked: true, progress: 4, maxProgress: 5, reward: 'Приоритет в поиске' },
    { id: 'early_bird', icon: '🌅', title: 'Ранняя пташка', description: 'Начните вывоз до 7:00', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'marathon_runner', icon: '🏃', title: 'Марафонец', description: 'Работайте 30 дней подряд', unlocked: false, progress: 18, maxProgress: 30 },
    { id: 'top_rated', icon: '🌟', title: 'Лучший рейтинг', description: 'Получите рейтинг 5.0', unlocked: false, progress: 4.8, maxProgress: 5.0 },
    { id: 'big_earner', icon: '💰', title: 'Большой заработок', description: 'Заработайте 50000₽ за месяц', unlocked: false, progress: 32400, maxProgress: 50000 },
  ];

  const handleStartPickup = (order: any) => {
    toast.success('🚀 Вынос начат!', { description: `Клиентам по адресу ${order.address} отправлены уведомления`, duration: 3000 });
    setTimeout(() => toast.info('📱 Уведомления доставлены', { description: `${order.addressCount} клиентов получили push-уведомление`, duration: 2500 }), 1000);
  };

  const myAddresses = [
    { id: 1, address: 'ул. Баумана, 58', building: 'Подъезд 1-3', customer: 'Александр', days: [1, 4], time: '18:00-20:00', addressCount: 12, price: 600, nextOrder: 'Завтра в 18:00', floor: '1-9 этажи', hasLift: true },
    { id: 2, address: 'пр. Победы, 120', building: 'Подъезд 1-2', customer: 'Мария', days: [2, 5], time: '17:00-19:00', addressCount: 8, price: 400, nextOrder: 'Пт в 17:00', floor: '1-5 этажи', hasLift: false },
    { id: 3, address: 'ул. Пушкина, 23', building: 'Подъезд 1-5', customer: 'ЖК "Центральный"', days: [3, 6], time: '16:00-19:00', addressCount: 18, price: 900, nextOrder: 'Ср в 16:00', floor: '1-12 этажи', hasLift: true },
    { id: 4, address: 'ул. Чистопольская, 61', building: 'Подъезды 1-4', customer: 'ТСЖ "Надежда"', days: [1, 3, 5], time: '17:00-20:00', addressCount: 22, price: 1100, nextOrder: 'Завтра в 17:00', floor: '1-9 этажи', hasLift: true },
  ];

  const todayOrders = [
    { id: 1, address: 'ул. Баумана, 58', building: 'Подъезд 1-3', customer: 'Александр', time: '18:00-20:00', addressCount: 12, price: 600, floor: '1-9 этажи', hasLift: true, status: 'upcoming' },
    { id: 2, address: 'ул. Чистопольская, 61', building: 'Подъезды 1-4', customer: 'ТСЖ "Надежда"', time: '17:00-20:00', addressCount: 22, price: 1100, floor: '1-9 этажи', hasLift: true, status: 'upcoming' },
  ];

  const totalAddresses = myAddresses.reduce((sum, a) => sum + a.addressCount, 0);

  const weekDays = [
    { day: 'Пн', date: '10', orders: 2, addresses: 34, earned: 1700 },
    { day: 'Вт', date: '11', orders: 1, addresses: 8, earned: 400 },
    { day: 'Ср', date: '12', orders: 3, addresses: 52, earned: 2600 },
    { day: 'Чт', date: '13', orders: 2, addresses: 34, earned: 1700 },
    { day: 'Пт', date: '14', orders: 1, addresses: 22, earned: 1100 },
    { day: 'Сб', date: '15', orders: 2, addresses: 26, earned: 1300 },
    { day: 'Вс', date: '16', orders: 0, addresses: 0, earned: 0 },
  ];

  const history = [
    { id: 1, address: 'ул. Баумана, 58', date: '9 марта', customer: '12 адресов', price: '600₽' },
    { id: 2, address: 'пр. Победы, 120', date: '7 марта', customer: '8 адресов', price: '400₽' },
    { id: 3, address: 'ул. Пушкина, 23', date: '6 марта', customer: '18 адресов', price: '900₽' },
  ];

  const today = new Date();
  const todayShort = today.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

  const card: React.CSSProperties = {
    background: c.surface, border: `1px solid ${c.border}`,
    borderRadius: '1rem', padding: '1.25rem',
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'find', icon: Search, label: 'Найти заказы' },
    { id: 'orders', icon: MapPin, label: 'Мои адреса' },
    { id: 'profile', icon: User, label: 'Профиль' },
  ] as const;

  return (
    <div className="min-h-screen lg:flex" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 z-50" style={{ background: c.surface, borderRight: `2px solid ${ACCENT}` }}>
        <div className="p-6" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <Briefcase className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="font-bold" style={{ color: c.text }}>TrashGo</div>
              <div className="text-xs" style={{ color: c.muted }}>Исполнитель</div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
          <button
            onClick={() => setIsOnShift(!isOnShift)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: isOnShift ? `${ACCENT}18` : c.subtle, color: isOnShift ? ACCENT : c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <span>{isOnShift ? '🟢 Открыт для заказов' : '⚫ Не принимаю заказы'}</span>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium"
              style={{
                background: activeTab === id ? `${ACCENT}18` : 'transparent',
                color: activeTab === id ? ACCENT : c.textSub,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-1" style={{ borderTop: `1px solid ${c.border}` }}>
          <button
            onClick={() => navigate('/customer')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium"
            style={{ background: 'transparent', color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <ArrowRightLeft className="w-5 h-5" />
            Режим заказчика
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium"
            style={{ background: 'transparent', color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {isDark ? <Sun className="w-5 h-5" style={{ color: '#FBBF24' }} /> : <Moon className="w-5 h-5" />}
            {isDark ? 'Светлая тема' : 'Тёмная тема'}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: c.text, display: 'flex', alignItems: 'center' }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                <Briefcase className="w-3.5 h-3.5" style={{ color: ACCENT }} />
              </div>
              <div className="text-sm font-semibold" style={{ color: c.text }}>TrashGo</div>
            </div>
            <button
              onClick={() => setIsOnShift(!isOnShift)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: isOnShift ? `${ACCENT}18` : c.subtle, color: isOnShift ? ACCENT : c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {isOnShift ? 'Открыт' : 'Закрыт'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="lg:hidden fixed top-0 left-0 h-full z-[70] flex flex-col"
            style={{ width: '72vw', maxWidth: '300px', background: c.surface, borderRight: `2px solid ${ACCENT}` }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                  <Briefcase className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: c.text }}>TrashGo</div>
                  <div className="text-xs" style={{ color: c.muted }}>Исполнитель</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', padding: '0.25rem' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shift toggle */}
            <div className="px-3 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
              <button
                onClick={() => setIsOnShift(!isOnShift)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium"
                style={{ background: isOnShift ? `${ACCENT}18` : c.subtle, color: isOnShift ? ACCENT : c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <span>{isOnShift ? '🟢 Открыт для заказов' : '⚫ Не принимаю заказы'}</span>
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {[
                { id: 'home' as const, icon: Home, label: 'Главная' },
                { id: 'find' as const, icon: Search, label: 'Найти заказы' },
                { id: 'orders' as const, icon: MapPin, label: 'Мои адреса' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: activeTab === id ? `${ACCENT}18` : 'transparent',
                    color: activeTab === id ? ACCENT : c.textSub,
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Drawer footer */}
            <div className="p-3 space-y-1" style={{ borderTop: `1px solid ${c.border}` }}>
              <button
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: activeTab === 'profile' ? `${ACCENT}18` : 'transparent',
                  color: activeTab === 'profile' ? ACCENT : c.muted,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <User className="w-5 h-5" />
                Профиль
              </button>
              <button
                onClick={() => { navigate('/customer'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'transparent', color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <ArrowRightLeft className="w-5 h-5" />
                Режим заказчика
              </button>
              <button
                onClick={() => toggleTheme()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'transparent', color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {isDark ? <Sun className="w-5 h-5" style={{ color: '#FBBF24' }} /> : <Moon className="w-5 h-5" />}
                {isDark ? 'Светлая тема' : 'Тёмная тема'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <div className="container mx-auto px-3 py-3 pb-24 lg:px-8 lg:py-6 lg:pb-6">

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <LevelSystem data={levelData} variant="contractor" compact={true} />

              {/* Today */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-semibold" style={{ color: c.text }}>Сегодня</h2>
                  <span className="text-xs" style={{ color: c.muted }}>{todayShort}</span>
                </div>

                {todayOrders.length > 0 ? (
                  <div className="space-y-2">
                    {todayOrders.map((order) => (
                      <div key={order.id} style={{ ...card, padding: '0.75rem' }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold" style={{ color: c.text }}>{order.time}</span>
                              <span className="px-1.5 py-0.5 text-xs font-medium rounded" style={{ background: ACCENT, color: 'white' }}>{order.addressCount} адр</span>
                            </div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin className="w-3.5 h-3.5" style={{ color: c.muted }} />
                              <span className="text-sm font-medium" style={{ color: c.text }}>{order.address}</span>
                            </div>
                            <div className="text-xs mb-1" style={{ color: c.muted }}>{order.building} • {order.customer}</div>
                            <div className="flex items-center gap-2 text-xs" style={{ color: c.muted }}>
                              <span>{order.floor}</span>
                              <span>•</span>
                              <span>{order.hasLift ? '🛗' : '🚶'}</span>
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>{order.price}₽</div>
                            <div className="text-xs" style={{ color: c.muted }}>{order.addressCount}×50</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex-1 text-xs font-semibold h-8 rounded-lg"
                            style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                            onClick={() => handleStartPickup(order)}
                          >
                            Начать
                          </button>
                          <button
                            className="px-3 h-8 rounded-lg"
                            style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.muted, cursor: 'pointer', fontFamily: 'inherit' }}
                            onClick={() => toast.info(`Клиент: ${order.customer}`, { description: 'Контакт доступен после начала выноса', duration: 2500 })}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12" style={card}>
                    <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: c.border }} />
                    <div className="text-lg font-medium mb-2" style={{ color: c.text }}>Сегодня свободный день</div>
                    <div className="text-sm" style={{ color: c.muted }}>Нет запланированных заказов</div>
                  </div>
                )}
              </div>

              {/* My addresses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-semibold" style={{ color: c.text }}>Мои адреса</h2>
                  <button className="text-xs flex items-center gap-1 h-7 px-2" style={{ background: 'none', border: 'none', color: c.muted, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setActiveTab('find')}>
                    <Plus className="w-3.5 h-3.5" /> Найти
                  </button>
                </div>
                <div className="space-y-2">
                  {myAddresses.map((address) => (
                    <div key={address.id} style={{ ...card, padding: '0.75rem' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPin className="w-3.5 h-3.5" style={{ color: c.muted }} />
                            <span className="text-sm font-semibold" style={{ color: c.text }}>{address.address}</span>
                          </div>
                          <div className="text-xs mb-1.5" style={{ color: c.muted }}>{address.building} • {address.customer}</div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, color: ACCENT }}>
                              <Package className="w-3 h-3" />{address.addressCount} адр
                            </span>
                            <div className="flex items-center gap-1">
                              {address.days.map((dayId) => (
                                <span key={dayId} className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: '#A78BFA' + '20', color: '#A78BFA' }}>{getDayLabel(dayId)}</span>
                              ))}
                              <span className="text-xs" style={{ color: c.muted }}>{address.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs" style={{ color: c.muted }}>
                            <span>{address.floor}</span>
                            <span>•</span>
                            <span>{address.hasLift ? '🛗' : '🚶'}</span>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="text-2xl font-bold" style={{ color: c.text }}>{address.price}₽</div>
                          <div className="text-xs" style={{ color: c.muted }}>{address.addressCount}×50</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 h-7 text-xs rounded-lg" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('Чат в разработке', { duration: 2000 })}>
                          <MessageCircle className="w-3 h-3 inline mr-1" />Чат
                        </button>
                        <button className="flex-1 h-7 text-xs rounded-lg" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info(`Клиент: ${address.customer}`, { description: 'Контакт виден в день вывоза', duration: 2500 })}>
                          <Phone className="w-3 h-3 inline mr-1" />Звонок
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Week calendar */}
              <div>
                <h2 className="text-base font-semibold mb-2" style={{ color: c.text }}>Неделя</h2>
                <div className="grid grid-cols-7 gap-1.5">
                  {weekDays.map((day, index) => (
                    <div key={index} className="p-2 rounded-lg text-center" style={{ background: day.orders > 0 ? `${ACCENT}12` : c.subtle, border: `1px solid ${day.orders > 0 ? ACCENT + '30' : c.border}` }}>
                      <div className="text-xs" style={{ color: c.muted }}>{day.day}</div>
                      <div className="text-base font-semibold" style={{ color: c.text }}>{day.date}</div>
                      {day.orders > 0 && (
                        <>
                          <div className="text-xs" style={{ color: c.muted }}>{day.addresses}а</div>
                          <div className="text-xs font-semibold" style={{ color: '#4CAF50' }}>{day.earned}₽</div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* History */}
              <div>
                <h2 className="text-base font-semibold mb-2" style={{ color: c.text }}>История</h2>
                <div className="space-y-1.5">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between" style={{ ...card, padding: '0.625rem 0.75rem' }}>
                      <div>
                        <div className="text-sm font-medium" style={{ color: c.text }}>{item.address}</div>
                        <div className="text-xs" style={{ color: c.muted }}>{item.date} • {item.customer}</div>
                      </div>
                      <div className="text-sm font-medium" style={{ color: '#4CAF50' }}>{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Profile Header */}
              <div style={card}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
                      <User className="w-7 h-7" style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold" style={{ color: c.text }}>{user?.name || 'Дмитрий'}</h1>
                      <div className="text-sm" style={{ color: c.muted }}>{user?.phone || '+7 (903) 987-65-43'}</div>
                    </div>
                  </div>
                  <button className="h-8 px-3 rounded-lg text-xs" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('Редактирование профиля', { description: 'Функция в разработке' })}>
                    <Edit className="w-3.5 h-3.5 inline mr-1" />Изменить
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: <><Star className="w-3.5 h-3.5 inline" style={{ color: '#FBBF24', fill: '#FBBF24' }} /> 4.8</>, l: '47 отзывов' },
                    { v: totalAddresses, l: 'адресов' },
                    { v: 143, l: 'выполнено' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-3 text-center" style={{ background: c.subtle }}>
                      <div className="text-xl font-semibold" style={{ color: c.text }}>{s.v}</div>
                      <div className="text-xs" style={{ color: c.muted }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earnings */}
              <div style={card}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" style={{ color: c.muted }} />
                    <h2 className="text-sm font-semibold" style={{ color: c.text }}>Заработок</h2>
                  </div>
                  <button className="text-xs flex items-center gap-1" style={{ background: 'none', border: 'none', color: c.muted, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('История выплат')}>
                    История <TrendingUp className="w-3.5 h-3.5 inline" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-4" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <div className="text-xs mb-1" style={{ color: c.muted }}>За неделю</div>
                    <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>8 800₽</div>
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>176 адресов</div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <div className="text-xs mb-1" style={{ color: c.muted }}>За месяц</div>
                    <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>32 400₽</div>
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>648 адресов</div>
                  </div>
                </div>
              </div>

              <LevelSystem data={levelData} variant="contractor" />
              <AchievementsPanel achievements={achievements} variant="contractor" />

              {/* Work Info */}
              <div style={card}>
                <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Рабочая информация</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { l: 'Район работы', v: 'Вахитовский' },
                    { l: 'Транспорт', v: '🚗 Машина' },
                    { l: 'График', v: 'ПН-СБ' },
                    { l: 'Время', v: '17:00-21:00' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ background: c.subtle }}>
                      <div className="text-xs mb-1" style={{ color: c.muted }}>{item.l}</div>
                      <div className="text-sm font-medium" style={{ color: c.text }}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Menu items */}
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {[
                  { icon: Bell, label: 'Уведомления', sub: 'Настройка push и email', action: () => toast.info('Настройки уведомлений') },
                  { icon: CreditCard, label: 'Способ оплаты', sub: 'Карты и банковские счета', action: () => toast.info('Способы оплаты') },
                  { icon: UserPlus, label: 'Реферальная программа', sub: 'Приглашайте друзей — получайте бонусы', action: () => toast.info('Реферальная программа') },
                  { icon: HelpCircle, label: 'Помощь и поддержка', sub: 'FAQ и связь с поддержкой', action: () => toast.info('Помощь и поддержка') },
                ].map((item, i, arr) => (
                  <button key={i} className="w-full flex items-center justify-between p-4" style={{ background: 'transparent', border: 'none', borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={item.action}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.subtle }}>
                        <item.icon className="w-4 h-4" style={{ color: c.muted }} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium" style={{ color: c.text }}>{item.label}</div>
                        <div className="text-xs" style={{ color: c.muted }}>{item.sub}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: c.muted }} />
                  </button>
                ))}
              </div>

              {/* Switch to Customer */}
              <button className="w-full flex items-center justify-between p-4 rounded-2xl" style={{ ...card, cursor: 'pointer' }} onClick={() => navigate('/customer')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#66BB6A' + '18' }}>
                    <ArrowRightLeft className="w-5 h-5" style={{ color: '#66BB6A' }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: c.text }}>Нужно вынести мусор?</div>
                    <div className="text-xs" style={{ color: c.muted }}>Переключиться в режим заказчика</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: c.muted }} />
              </button>

              {/* Theme toggle */}
              <button className="w-full flex items-center justify-between p-4 rounded-2xl" style={{ ...card, cursor: 'pointer' }} onClick={toggleTheme}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.subtle }}>
                    {isDark ? <Sun className="w-5 h-5" style={{ color: '#FBBF24' }} /> : <Moon className="w-5 h-5" style={{ color: c.muted }} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: c.text }}>{isDark ? 'Светлая тема' : 'Тёмная тема'}</div>
                    <div className="text-xs" style={{ color: c.muted }}>{isDark ? 'Переключиться на светлую' : 'Переключиться на тёмную'}</div>
                  </div>
                </div>
                <div className="w-10 h-6 rounded-full relative" style={{ background: isDark ? '#374151' : '#e5e7eb' }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all" style={{ left: isDark ? '1.25rem' : '0.25rem' }} />
                </div>
              </button>

              {/* Logout */}
              <button
                className="w-full py-3 rounded-2xl text-sm font-semibold"
                style={{ border: `1px solid #fca5a5`, background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => { if (confirm('Вы уверены, что хотите выйти?')) { logout(); navigate('/'); } }}
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Выйти из аккаунта
              </button>
            </div>
          )}

          {/* FIND ORDERS TAB */}
          {activeTab === 'find' && (
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold" style={{ color: c.text }}>Заказы рядом</h1>
                <div className="text-sm" style={{ color: c.muted }}>Вахитовский р-н</div>
              </div>

              <div style={card}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3 text-center" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>3 250₽</div>
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>можно заработать</div>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: c.subtle, border: `1px solid ${c.border}` }}>
                    <div className="text-2xl font-bold" style={{ color: c.text }}>5</div>
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>заказов доступно</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { id: 12847, address: 'ул. Баумана, 58', building: 'Подъезд 1-3', time: '14:00–16:00', addressCount: 12, price: 600, distance: '1.2 км', description: '1-9 этажи, есть лифт', customer: 'Александр', rating: 4.9 },
                  { id: 12846, address: 'пр. Победы, 120', building: 'Подъезд 1-2', time: '15:00–17:00', addressCount: 8, price: 400, distance: '2.5 км', description: '1-5 этажи, без лифта', customer: 'Мария', rating: 4.7 },
                  { id: 12845, address: 'ул. Пушкина, 23', building: 'Подъезд 1-5', time: '16:00–19:00', addressCount: 18, price: 900, distance: '3.1 км', description: '1-12 этажи, есть лифт', customer: 'ЖК Центральный', rating: 5.0 },
                  { id: 12844, address: 'ул. Чистопольская, 61', building: 'Подъезды 1-4', time: '17:00–20:00', addressCount: 22, price: 1100, distance: '1.8 км', description: '1-9 этажи, есть лифт', customer: 'ТСЖ Надежда', rating: 4.8 },
                  { id: 12843, address: 'ул. Гаврилова, 12', building: 'Подъезд 1', time: '18:00–20:00', addressCount: 5, price: 250, distance: '0.8 км', description: '1-5 этажи, без лифта', customer: 'Елена', rating: 4.6 },
                ].map((order) => (
                  <div key={order.id} style={card}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4" style={{ color: c.muted }} />
                          <span className="text-base font-semibold" style={{ color: c.text }}>{order.time}</span>
                          <span className="text-xs" style={{ color: c.muted }}>{order.distance}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5" style={{ color: c.muted }} />
                          <span className="text-sm font-medium" style={{ color: c.text }}>{order.address}</span>
                        </div>
                        <div className="text-xs mb-2" style={{ color: c.muted }}>{order.building} • {order.customer}</div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}20`, color: ACCENT }}>
                            <Package className="w-3 h-3" />{order.addressCount} адр
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ background: c.subtle, border: `1px solid ${c.border}`, color: c.muted }}>
                            <Star className="w-3 h-3" style={{ color: '#FBBF24', fill: '#FBBF24' }} />{order.rating}
                          </span>
                          <span className="text-xs" style={{ color: c.muted }}>{order.description}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold" style={{ color: c.text }}>{order.price}₽</div>
                        <div className="text-xs" style={{ color: c.muted }}>{order.addressCount}×50</div>
                      </div>
                    </div>
                    <button
                      className="w-full h-9 rounded-xl text-sm font-semibold"
                      style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => toast.success(`Заявка на заказ #${order.id} отправлена!`, { duration: 2500 })}
                    >
                      Взять заказ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERS TAB (my addresses) */}
          {activeTab === 'orders' && (
            <div className="max-w-2xl mx-auto space-y-3">
              <h1 className="text-xl font-semibold" style={{ color: c.text }}>Мои адреса</h1>
              <div className="space-y-3">
                {myAddresses.map((address) => (
                  <div key={address.id} style={card}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4" style={{ color: c.muted }} />
                          <span className="font-semibold" style={{ color: c.text }}>{address.address}</span>
                        </div>
                        <div className="text-sm mb-2" style={{ color: c.muted }}>{address.building} • {address.customer}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}20`, color: ACCENT }}>
                            <Package className="w-3 h-3" />{address.addressCount} адр
                          </span>
                          <div className="flex gap-1">
                            {address.days.map((dayId) => (
                              <span key={dayId} className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: '#A78BFA' + '20', color: '#A78BFA' }}>{getDayLabel(dayId)}</span>
                            ))}
                          </div>
                          <span className="text-xs" style={{ color: c.muted }}>{address.time}</span>
                        </div>
                        <div className="text-xs" style={{ color: c.muted }}>{address.floor} • {address.hasLift ? '🛗 Есть лифт' : '🚶 Без лифта'}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold" style={{ color: c.text }}>{address.price}₽</div>
                        <div className="text-xs" style={{ color: c.muted }}>следующий: {address.nextOrder}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 text-sm rounded-lg" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('Чат в разработке', { duration: 2000 })}>
                        <MessageCircle className="w-3.5 h-3.5 inline mr-1" />Чат
                      </button>
                      <button className="flex-1 py-2 text-sm rounded-lg" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info(`Клиент: ${address.customer}`, { duration: 2500 })}>
                        <Phone className="w-3.5 h-3.5 inline mr-1" />Звонок
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40" style={{ background: c.surface, borderTop: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <button onClick={() => setActiveTab('home')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'home' ? c.text : c.muted }}>
              <Home className="w-6 h-6" />
              <span className="text-xs">Главная</span>
            </button>
            <button onClick={() => setActiveTab('find')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'find' ? ACCENT : c.muted }}>
              <Search className="w-6 h-6" />
              <span className="text-xs">Найти</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
