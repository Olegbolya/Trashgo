import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/auth.store';
import { Home, MapPin, User, Plus, Package, CheckCircle, Clock, RefreshCw, Edit, LogOut, Bell, CreditCard, UserPlus, HelpCircle, Wallet, ArrowRightLeft, Moon, Sun, ChevronRight, Star, Phone, MessageCircle, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LevelSystem, type LevelData } from '../components/LevelSystem';
import { AchievementsPanel, type Achievement } from '../components/AchievementsPanel';
import { toast } from 'sonner';
import { getDayLabel } from '../lib/utils';

const ACCENT = '#66BB6A';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'profile' | 'create'>('home');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [createForm, setCreateForm] = useState({ address: '', date: '', time: '', volume: 1, price: 50, entrance: '', apartment: '', description: '' });
  const [createPhotos, setCreatePhotos] = useState<File[]>([]);
  const [preloadedPhotoUrls, setPreloadedPhotoUrls] = useState<string[]>([]);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<MyOrder | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  type MyOrder = {
    id: number; address: string; entrance: string; apartment: string;
    date: string; time: string; volume: number; price: number;
    description: string; photoUrls: string[]; status: 'waiting' | 'active' | 'cancelled';
    responses: number; createdAt: string;
  };
  const [myOrders, setMyOrders] = useState<MyOrder[]>(() => {
    try {
      const stored = localStorage.getItem('trashgo_my_orders');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [selectedOrder, setSelectedOrder] = useState<MyOrder | null>(null);

  useEffect(() => {
    localStorage.setItem('trashgo_my_orders', JSON.stringify(myOrders));
  }, [myOrders]);

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
    level: 12, xp: 2400, nextLevelXp: 3000,
    title: 'Постоянный клиент', rank: '⚡ Опытный',
    achievements: 8, totalOrders: 24,
  };

  const achievements: Achievement[] = [
    { id: 'first_order', icon: '🎯', title: 'Первый заказ', description: 'Создайте свой первый заказ', unlocked: true, reward: '+10 XP' },
    { id: 'regular_customer', icon: '⭐', title: 'Постоянный клиент', description: 'Совершите 10 заказов', unlocked: true, progress: 24, maxProgress: 10, reward: '-5% скидка' },
    { id: 'subscription_master', icon: '🔄', title: 'Мастер подписок', description: 'Создайте 2 подписки', unlocked: true, progress: 2, maxProgress: 2, reward: '-10₽' },
    { id: 'early_bird', icon: '🌅', title: 'Ранняя пташка', description: 'Заказ до 8:00 утра', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'eco_warrior', icon: '🌱', title: 'Эко-воин', description: 'Сдайте 50 мешков на переработку', unlocked: true, progress: 73, maxProgress: 50, reward: 'Эко-значок' },
    { id: 'referral_king', icon: '👥', title: 'Король рефералов', description: 'Пригласите 5 соседей', unlocked: false, progress: 3, maxProgress: 5 },
    { id: 'speed_demon', icon: '⚡', title: 'Скоростной заказ', description: 'Создайте заказ за 60 сек', unlocked: true, reward: '+25 XP' },
    { id: 'loyal_customer', icon: '💎', title: 'VIP клиент', description: 'Используйте платформу 30 дней подряд', unlocked: false, progress: 12, maxProgress: 30 },
  ];

  const myContractors = [
    { id: 1, name: 'Иван Петров', rating: 4.9, days: [1, 4], time: '18:00', price: 40, nextOrder: 'Завтра в 18:00' },
    { id: 2, name: 'Алексей Смирнов', rating: 4.8, days: [2, 5], time: '16:00', price: 35, nextOrder: 'Пт в 16:00' },
  ];

  const stats = { totalOrders: 24, activeOrders: 2, completedOrders: 22, referrals: 3 };

  const weekOrders = [
    { day: 'Пн', date: '3', orders: [
      { id: 1, time: '08:00 - 16:00', address: 'Склад A', status: 'active', contractor: 'Дмитрий', responses: 0, price: '50₽' },
      { id: 2, time: '14:00 - 22:00', address: 'Распред. центр', status: 'waiting', responses: 5, contractor: '', price: '45₽' },
    ]},
    { day: 'Вт', date: '4', orders: [
      { id: 3, time: '09:00 - 17:00', address: 'Главный офис', status: 'waiting', responses: 2, contractor: '', price: '40₽' },
    ]},
    { day: 'Ср', date: '5', orders: [
      { id: 4, time: '08:00 - 16:00', address: 'Склад Б', status: 'active', contractor: 'Александр', responses: 0, price: '60₽' },
    ]},
    { day: 'Чт', date: '6', orders: [
      { id: 6, time: '08:00 - 16:00', address: 'Распред. центр', status: 'waiting', responses: 8, contractor: '', price: '55₽' },
    ]},
    { day: 'Пт', date: '7', orders: [
      { id: 7, time: '09:00 - 17:00', address: 'Главный офис', status: 'active', contractor: 'Дмитрий', responses: 0, price: '45₽' },
    ]},
    { day: 'Сб', date: '8', orders: [
      { id: 9, time: '08:00 - 16:00', address: 'Склад Б', status: 'waiting', responses: 12, contractor: '', price: '70₽' },
    ]},
    { day: 'Вс', date: '9', orders: [] },
  ];

  const history = [
    { id: 10, date: '2 марта', address: 'Склад A', price: '₽1 440' },
    { id: 11, date: '1 марта', address: 'Склад Б', price: '₽2 160' },
    { id: 12, date: '28 февр.', address: 'Склад Е', price: '₽1 800' },
  ];

  const subscriptions = [
    { id: 1, address: 'ул. Баумана, 58', days: [1, 4], time: '18:00', price: '50₽', active: true },
    { id: 2, address: 'пр. Победы, 120', days: [2, 5], time: '16:00', price: '45₽', active: true },
  ];

  const today = new Date();
  const todayLabel = today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCapitalized = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  const navItems = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'create', icon: Plus, label: 'Создать заказ' },
    { id: 'profile', icon: User, label: 'Профиль' },
  ] as const;

  const card: React.CSSProperties = {
    background: c.surface, border: `1px solid ${c.border}`,
    borderRadius: '1rem', padding: '1.25rem',
  };

  const card2: React.CSSProperties = { ...card, borderWidth: '2px' };

  return (
    <div className="min-h-screen lg:flex" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 z-50" style={{ background: c.surface, borderRight: `2px solid ${ACCENT}` }}>
        <div className="p-6" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <Package className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="font-bold" style={{ color: c.text }}>TrashGo</div>
              <div className="text-xs" style={{ color: c.muted }}>Вынос мусора</div>
            </div>
          </div>
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
          <button
            onClick={() => navigate('/my-subscriptions')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium"
            style={{ background: 'transparent', color: c.textSub, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <RefreshCw className="w-5 h-5" />
            Подписки
          </button>
        </nav>

        <div className="p-4 space-y-1" style={{ borderTop: `1px solid ${c.border}` }}>
          <button
            onClick={() => navigate('/contractor')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium"
            style={{ background: 'transparent', color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <ArrowRightLeft className="w-5 h-5" />
            Режим исполнителя
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
                <Package className="w-3.5 h-3.5" style={{ color: ACCENT }} />
              </div>
              <div className="text-sm font-semibold" style={{ color: c.text }}>TrashGo</div>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: c.text, color: c.surface, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              + Создать
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div
            className="lg:hidden fixed top-0 left-0 h-full z-[70] flex flex-col"
            style={{ width: '72vw', maxWidth: '300px', background: c.surface, borderRight: `2px solid ${ACCENT}` }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                  <Package className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: c.text }}>TrashGo</div>
                  <div className="text-xs" style={{ color: c.muted }}>Вынос мусора</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', padding: '0.25rem' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {[
                { id: 'home' as const, icon: Home, label: 'Главная' },
                { id: 'create' as const, icon: Plus, label: 'Создать заказ' },
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
              <button
                onClick={() => { setActiveTab('calendar'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: activeTab === 'calendar' ? `${ACCENT}18` : 'transparent',
                  color: activeTab === 'calendar' ? ACCENT : c.textSub,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Clock className="w-5 h-5" />
                История заказов
              </button>
              <button
                onClick={() => { navigate('/my-subscriptions'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'transparent', color: c.textSub, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <RefreshCw className="w-5 h-5" />
                Подписки
              </button>
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
                onClick={() => { navigate('/contractor'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'transparent', color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <ArrowRightLeft className="w-5 h-5" />
                Режим исполнителя
              </button>
              <button
                onClick={() => { toggleTheme(); }}
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
              <LevelSystem data={levelData} variant="customer" compact={true} />

              {/* My created orders */}
              {myOrders.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold" style={{ color: c.text }}>Мои заказы</h2>
                    <span className="text-sm px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}18`, color: ACCENT }}>{myOrders.length}</span>
                  </div>
                  <div className="space-y-3">
                    {myOrders.map((order) => (
                      <div key={order.id} style={{ ...card2, borderColor: c.border, cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4" style={{ color: c.muted }} />
                              <span className="font-semibold" style={{ color: c.text }}>{order.address}</span>
                            </div>
                            <div className="text-sm mb-2" style={{ color: c.muted }}>
                              {new Date(order.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · {order.time} · {order.volume} мешк.
                            </div>
                            <div className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg" style={{ background: '#F97316' + '18', color: '#F97316' }}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Ждёт исполнителя · {order.responses} откликов</span>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-xl font-bold" style={{ color: c.text }}>{order.price}₽</div>
                            <div className="text-xs mt-1 px-2 py-0.5 rounded-lg" style={{ background: c.subtle, color: c.muted }}>Подробнее →</div>
                          </div>
                        </div>
                        {order.photoUrls.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {order.photoUrls.slice(0, 3).map((url, i) => (
                              <img key={i} src={url} alt="" style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: '0.5rem', border: `1px solid ${c.border}` }} />
                            ))}
                            {order.photoUrls.length > 3 && (
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-medium" style={{ background: c.subtle, color: c.muted, border: `1px solid ${c.border}` }}>+{order.photoUrls.length - 3}</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Today */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold" style={{ color: c.text }}>Сегодня</h2>
                  <span className="text-sm" style={{ color: c.muted }}>{todayCapitalized}</span>
                </div>
                <div className="space-y-3">
                  {weekOrders[0].orders.map((order) => (
                    <div key={order.id} style={{ ...card2, borderColor: c.border }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-lg font-semibold mb-1" style={{ color: c.text }}>{order.time}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4" style={{ color: c.muted }} />
                            <span style={{ color: c.textSub }}>{order.address}</span>
                          </div>
                          {order.status === 'active' ? (
                            <div className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                              <CheckCircle className="w-4 h-4" />
                              <span>Исполнитель: {order.contractor}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg" style={{ background: '#F97316' + '18', color: '#F97316' }}>
                              <Clock className="w-4 h-4" />
                              <span>{order.responses} откликов</span>
                            </div>
                          )}
                        </div>
                        <div className="text-2xl font-semibold ml-4" style={{ color: c.text }}>{order.price}</div>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'active' ? (
                          <>
                            <button className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('Позвоните исполнителю', { description: `+7 (903) 123-45-67 — ${order.contractor}`, duration: 3000 })}>Позвонить</button>
                            <button className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('Чат в разработке', { duration: 2500 })}>Написать</button>
                          </>
                        ) : (
                          <button className="w-full py-2 rounded-lg text-sm font-medium" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info(`${order.responses} откликов на ваш заказ`, { duration: 2500 })}>Посмотреть отклики</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: stats.activeOrders, label: 'Активных', color: c.text },
                  { value: stats.completedOrders, label: 'Выполнено', color: c.text },
                  { value: '15₽', label: 'Экономия', color: ACCENT },
                ].map((s, i) => (
                  <div key={i} style={{ ...card }}>
                    <div className="text-2xl font-semibold text-center mb-1" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-center" style={{ color: c.muted }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Subscriptions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold" style={{ color: c.text }}>Подписки</h2>
                  <button className="text-sm flex items-center gap-1" style={{ background: 'none', border: 'none', color: c.muted, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => navigate('/create-subscription')}>
                    <Plus className="w-4 h-4" /> Создать
                  </button>
                </div>
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} style={card}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <RefreshCw className="w-4 h-4" style={{ color: '#A78BFA' }} />
                            <span className="font-semibold" style={{ color: c.text }}>Регулярный вывоз</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4" style={{ color: c.muted }} />
                            <span style={{ color: c.textSub }}>{sub.address}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm" style={{ color: c.muted }}>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{sub.time}</span>
                            </div>
                            <div className="flex gap-1">
                              {sub.days.map((dayId) => (
                                <span key={dayId} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#A78BFA' + '20', color: '#A78BFA' }}>{getDayLabel(dayId)}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-semibold" style={{ color: c.text }}>{sub.price}</div>
                          <div className="text-xs" style={{ color: c.muted }}>за раз</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-1.5 text-sm rounded-lg" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('Редактирование подписки', { duration: 2500 })}>Редактировать</button>
                        <button className="flex-1 py-1.5 text-sm rounded-lg" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.success('Подписка приостановлена', { duration: 2500 })}>Пауза</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Contractors */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold" style={{ color: c.text }}>Мои исполнители</h2>
                  <button className="text-sm flex items-center gap-1" style={{ background: 'none', border: 'none', color: c.muted, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('Поиск исполнителей', { duration: 3000 })}>
                    <Plus className="w-4 h-4" /> Найти
                  </button>
                </div>
                <div style={{ ...card, cursor: 'pointer' }} onClick={() => navigate('/my-contractors')}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.subtle }}>
                      <User className="w-6 h-6" style={{ color: c.muted }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold mb-2" style={{ color: c.text }}>Постоянные исполнители</div>
                      <div className="space-y-1 mb-3">
                        {myContractors.map((contractor) => (
                          <div key={contractor.id} className="text-sm" style={{ color: c.textSub }}>
                            • {contractor.name} ⭐ {contractor.rating} ({getDayLabel(contractor.days[0])}, {getDayLabel(contractor.days[1])} в {contractor.time})
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="px-3 py-1.5 rounded-lg" style={{ background: c.subtle, border: `1px solid ${c.border}` }}>
                          <span className="font-semibold" style={{ color: c.textSub }}>-80₽ экономия/месяц</span>
                        </div>
                        <span style={{ color: c.muted }}>2 активных подписки</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: c.text }}>Активные заказы</h2>
                {weekOrders[currentWeek].orders.length > 0 ? (
                  <div className="space-y-3">
                    {weekOrders[currentWeek].orders.map((order) => (
                      <div key={order.id} style={card}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4" style={{ color: c.muted }} />
                              <span className="font-medium" style={{ color: c.text }}>{order.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm" style={{ color: c.muted }}>
                              <Clock className="w-4 h-4" />
                              <span>Сегодня в {order.time}</span>
                            </div>
                          </div>
                          <div className="font-semibold" style={{ color: c.text }}>{order.price}</div>
                        </div>
                        {order.status === 'active' ? (
                          <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                            <CheckCircle className="w-4 h-4" />
                            <span>Исполнитель: {order.contractor}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: '#F97316' + '18', color: '#F97316' }}>
                            <Clock className="w-4 h-4" />
                            <span>Ожидание • {order.responses} откликов</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12" style={{ ...card }}>
                    <Package className="w-12 h-12 mx-auto mb-4" style={{ color: c.border }} />
                    <div className="mb-4" style={{ color: c.muted }}>У вас пока нет активных заказов</div>
                    <button className="px-4 py-2 rounded-xl font-medium" style={{ background: c.text, color: c.surface, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setActiveTab('create')}>
                      + Создать заказ
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: c.text }}>История</h2>
                <div className="space-y-2">
                  {history.map((order) => (
                    <div key={order.id} className="flex items-center justify-between" style={{ ...card, padding: '1rem' }}>
                      <div>
                        <div className="text-sm font-medium" style={{ color: c.text }}>{order.address}</div>
                        <div className="text-xs" style={{ color: c.muted }}>{order.date}</div>
                      </div>
                      <div className="text-sm font-medium" style={{ color: c.text }}>{order.price}</div>
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
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: c.subtle }}>
                      <User className="w-7 h-7" style={{ color: c.muted }} />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold" style={{ color: c.text }}>{user?.name || 'Александр'}</h1>
                      <div className="text-sm" style={{ color: c.muted }}>{user?.phone || '+7 (903) 123-45-67'}</div>
                    </div>
                  </div>
                  <button className="h-8 px-3 rounded-lg text-xs" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('Редактирование профиля', { description: 'Функция в разработке' })}>
                    <Edit className="w-3.5 h-3.5 inline mr-1" />Изменить
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: stats.completedOrders, l: 'выполнено' },
                    { v: stats.activeOrders, l: 'активных' },
                    { v: stats.referrals, l: 'рефералов' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-3 text-center" style={{ background: c.subtle }}>
                      <div className="text-xl font-semibold" style={{ color: c.text }}>{s.v}</div>
                      <div className="text-xs" style={{ color: c.muted }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <LevelSystem data={levelData} variant="customer" />
              <AchievementsPanel achievements={achievements} variant="customer" />

              {/* Address */}
              <div style={card}>
                <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Адреса вывоза</h2>
                <div className="space-y-3">
                  <div className="rounded-lg p-3" style={{ background: c.subtle }}>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5" style={{ color: c.muted }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: c.text }}>ул. Баумана, 58</div>
                        <div className="text-xs" style={{ color: c.muted }}>Подъезд 2, Этаж 5, Кв. 42</div>
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ background: '#A78BFA' + '18', color: '#A78BFA', border: `1px solid ${'#A78BFA' + '30'}` }}>
                          <RefreshCw className="w-3 h-3" /> Подписка активна
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-2 text-sm rounded-lg" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('Добавление адреса', { duration: 2000 })}>
                    + Добавить адрес
                  </button>
                </div>
              </div>

              {/* Switch to Contractor */}
              <button className="w-full flex items-center justify-between p-4 rounded-2xl" style={{ ...card, cursor: 'pointer' }} onClick={() => navigate('/contractor')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
                    <ArrowRightLeft className="w-5 h-5" style={{ color: ACCENT }} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium" style={{ color: c.text }}>Хотите заработать?</div>
                    <div className="text-xs" style={{ color: c.muted }}>Переключиться в режим исполнителя</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: c.muted }} />
              </button>

              {/* Menu items */}
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {[
                  { icon: Bell, label: 'Уведомления', sub: 'Настройка push и email', action: () => toast.info('Настройки уведомлений') },
                  { icon: CreditCard, label: 'Способ оплаты', sub: 'Карты и банковские счета', action: () => toast.info('Способы оплаты') },
                  { icon: UserPlus, label: 'Пригласить соседей', sub: 'Чем больше вас — тем дешевле каждому', action: () => navigate('/invite-neighbor') },
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

          {/* CREATE TAB */}
          {activeTab === 'create' && (() => {
            const inputStyle = (hasError?: boolean): React.CSSProperties => ({
              width: '100%', padding: '0.625rem 0.75rem',
              border: `1px solid ${hasError ? '#ef4444' : c.border}`,
              borderRadius: '0.75rem', fontSize: '0.875rem',
              outline: 'none', background: c.input, color: c.text,
              boxSizing: 'border-box', fontFamily: 'inherit',
            });

            const toBase64 = (file: File): Promise<string> =>
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
              });

            const handlePublish = async () => {
              const errors: Record<string, string> = {};
              if (!createForm.address.trim()) errors.address = 'Укажите адрес дома';
              if (!createForm.date) errors.date = 'Укажите дату';
              if (!createForm.time) errors.time = 'Укажите время';
              if (createForm.price <= 0) errors.price = 'Цена должна быть больше 0';
              setCreateErrors(errors);
              if (Object.keys(errors).length > 0) return;
              const newPhotoUrls = await Promise.all(createPhotos.map(toBase64));
              const photoUrls = [...preloadedPhotoUrls, ...newPhotoUrls].slice(0, 5);
              const newOrder: MyOrder = {
                id: Date.now(),
                address: createForm.address,
                entrance: createForm.entrance,
                apartment: createForm.apartment,
                date: createForm.date,
                time: createForm.time,
                volume: createForm.volume,
                price: createForm.price,
                description: createForm.description,
                photoUrls,
                status: 'waiting',
                responses: 0,
                createdAt: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
              };
              setMyOrders((prev) => {
                const updated = [newOrder, ...prev];
                localStorage.setItem('trashgo_my_orders', JSON.stringify(updated));
                return updated;
              });
              toast.success('Заказ создан!', { description: 'Исполнители уже видят ваш заказ', duration: 3000 });
              setCreateForm({ address: '', date: '', time: '', volume: 1, price: 50, entrance: '', apartment: '', description: '' });
              setCreatePhotos([]);
              setPreloadedPhotoUrls([]);
              setCreateErrors({});
              setIsEditing(false);
              setOriginalOrder(null);
              setActiveTab('home');
            };

            return (
              <div className="max-w-2xl mx-auto space-y-4">
                <h1 className="text-xl font-semibold" style={{ color: c.text }}>Новый заказ</h1>

                <div style={card}>
                  <div className="space-y-4">

                    {/* Адрес дома — обязательное */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Адрес <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        value={createForm.address}
                        onChange={(e) => { setCreateForm({ ...createForm, address: e.target.value }); setCreateErrors({ ...createErrors, address: '' }); }}
                        placeholder="ул. Баумана, 58"
                        style={inputStyle(!!createErrors.address)}
                      />
                      {createErrors.address && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{createErrors.address}</p>}
                    </div>

                    {/* Подъезд + Квартира — необязательные без пометки */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Подъезд</label>
                        <input
                          value={createForm.entrance}
                          onChange={(e) => setCreateForm({ ...createForm, entrance: e.target.value })}
                          placeholder="1"
                          style={inputStyle()}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Квартира</label>
                        <input
                          value={createForm.apartment}
                          onChange={(e) => setCreateForm({ ...createForm, apartment: e.target.value })}
                          placeholder="42"
                          style={inputStyle()}
                        />
                      </div>
                    </div>

                    {/* Дата + Время — обязательные */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Дата <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          type="date"
                          value={createForm.date}
                          onChange={(e) => { setCreateForm({ ...createForm, date: e.target.value }); setCreateErrors({ ...createErrors, date: '' }); }}
                          style={inputStyle(!!createErrors.date)}
                        />
                        {createErrors.date && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{createErrors.date}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Время <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          type="time"
                          value={createForm.time}
                          onChange={(e) => { setCreateForm({ ...createForm, time: e.target.value }); setCreateErrors({ ...createErrors, time: '' }); }}
                          style={inputStyle(!!createErrors.time)}
                        />
                        {createErrors.time && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{createErrors.time}</p>}
                      </div>
                    </div>

                    {/* Мешков + Цена — обязательные */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Мешков <span style={{ color: '#ef4444' }}>*</span></label>
                        <div className="flex items-center overflow-hidden rounded-xl" style={{ border: `1px solid ${c.border}` }}>
                          <button onClick={() => setCreateForm({ ...createForm, volume: Math.max(1, createForm.volume - 1) })} style={{ padding: '0.625rem 0.75rem', background: 'transparent', border: 'none', color: c.muted, cursor: 'pointer', fontSize: '1.25rem', fontFamily: 'inherit' }}>−</button>
                          <div className="flex-1 text-center text-sm font-medium" style={{ color: c.text }}>{createForm.volume}</div>
                          <button onClick={() => setCreateForm({ ...createForm, volume: createForm.volume + 1 })} style={{ padding: '0.625rem 0.75rem', background: 'transparent', border: 'none', color: c.muted, cursor: 'pointer', fontSize: '1.25rem', fontFamily: 'inherit' }}>+</button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Цена, ₽ <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          type="number"
                          min={1}
                          value={createForm.price}
                          onChange={(e) => { setCreateForm({ ...createForm, price: parseInt(e.target.value) || 0 }); setCreateErrors({ ...createErrors, price: '' }); }}
                          style={inputStyle(!!createErrors.price)}
                        />
                        {createErrors.price && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{createErrors.price}</p>}
                      </div>
                    </div>

                    {/* Комментарий — необязательное с пометкой */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>
                        Комментарий <span style={{ color: c.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(необязательно)</span>
                      </label>
                      <textarea
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        placeholder="Например: позвоните за 10 минут, домофон не работает..."
                        rows={3}
                        style={{ ...inputStyle(), resize: 'none' }}
                      />
                    </div>

                    {/* Добавить фото — необязательное с пометкой */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>
                        Фото мусора <span style={{ color: c.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(необязательно)</span>
                      </label>
                      <label
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: '0.5rem', padding: '1.25rem',
                          border: `2px dashed ${c.border}`, borderRadius: '0.75rem',
                          cursor: 'pointer', background: c.subtle,
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setCreatePhotos((prev) => [...prev, ...files].slice(0, 5));
                          }}
                        />
                        <div style={{ fontSize: '1.5rem' }}>📷</div>
                        <div className="text-sm font-medium" style={{ color: c.textSub }}>Нажмите, чтобы добавить фото</div>
                        <div className="text-xs" style={{ color: c.muted }}>Помогает исполнителю оценить объём. До 5 фото.</div>
                      </label>
                      {(preloadedPhotoUrls.length > 0 || createPhotos.length > 0) && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {preloadedPhotoUrls.map((url, i) => (
                            <div key={`pre-${i}`} style={{ position: 'relative' }}>
                              <img src={url} alt="" style={{ width: '4rem', height: '4rem', objectFit: 'cover', borderRadius: '0.5rem', border: `1px solid ${c.border}` }} />
                              <button
                                onClick={() => setPreloadedPhotoUrls((prev) => prev.filter((_, idx) => idx !== i))}
                                style={{ position: 'absolute', top: '-0.375rem', right: '-0.375rem', width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
                              >✕</button>
                            </div>
                          ))}
                          {createPhotos.map((file, i) => (
                            <div key={`new-${i}`} style={{ position: 'relative' }}>
                              <img
                                src={URL.createObjectURL(file)}
                                alt=""
                                style={{ width: '4rem', height: '4rem', objectFit: 'cover', borderRadius: '0.5rem', border: `1px solid ${c.border}` }}
                              />
                              <button
                                onClick={() => setCreatePhotos((prev) => prev.filter((_, idx) => idx !== i))}
                                style={{
                                  position: 'absolute', top: '-0.375rem', right: '-0.375rem',
                                  width: '1.25rem', height: '1.25rem', borderRadius: '50%',
                                  background: '#ef4444', color: 'white', border: 'none',
                                  cursor: 'pointer', fontSize: '0.7rem', lineHeight: 1,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: 'inherit',
                                }}
                              >✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: c.subtle, border: `1px solid ${c.border}` }}>
                  <div className="text-sm" style={{ color: c.muted }}>Итого к оплате</div>
                  <div className="text-2xl font-bold" style={{ color: c.text }}>{createForm.price > 0 ? `${createForm.price}₽` : '—'}</div>
                </div>

                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <button
                      className="w-full h-12 rounded-xl text-sm font-semibold"
                      style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={handlePublish}
                    >
                      Сохранить изменения
                    </button>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 h-11 rounded-xl text-sm font-medium"
                        style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={() => {
                          if (originalOrder) {
                            setMyOrders((prev) => {
                              const updated = [originalOrder, ...prev];
                              localStorage.setItem('trashgo_my_orders', JSON.stringify(updated));
                              return updated;
                            });
                          }
                          setCreateErrors({});
                          setPreloadedPhotoUrls([]);
                          setCreatePhotos([]);
                          setIsEditing(false);
                          setOriginalOrder(null);
                          setActiveTab('home');
                        }}
                      >
                        Отменить изменения
                      </button>
                      <button
                        className="flex-1 h-11 rounded-xl text-sm font-medium"
                        style={{ border: `1px solid #fca5a5`, background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={() => {
                          setCreateErrors({});
                          setPreloadedPhotoUrls([]);
                          setCreatePhotos([]);
                          setIsEditing(false);
                          setOriginalOrder(null);
                          setActiveTab('home');
                          toast.success('Заказ отменён');
                        }}
                      >
                        Отменить заказ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      className="flex-1 h-12 rounded-xl text-sm font-medium"
                      style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => { setCreateErrors({}); setPreloadedPhotoUrls([]); setCreatePhotos([]); setActiveTab('home'); }}
                    >
                      Отменить
                    </button>
                    <button
                      className="flex-1 h-12 rounded-xl text-sm font-semibold"
                      style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={handlePublish}
                    >
                      Опубликовать заказ
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <img
            src={lightboxUrl}
            alt=""
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '0.75rem' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              width: '2.5rem', height: '2.5rem', borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: 'white', fontSize: '1.25rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >✕</button>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{ width: '100%', maxWidth: '600px', background: c.surface, borderRadius: '1.25rem 1.25rem 0 0', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: '2.5rem', height: '0.25rem', borderRadius: '2px', background: c.border, margin: '0 auto 1.25rem' }} />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: c.text }}>Детали заказа #{selectedOrder.id}</h2>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                background: selectedOrder.status === 'waiting' ? '#F97316' + '18' : `${ACCENT}18`,
                color: selectedOrder.status === 'waiting' ? '#F97316' : ACCENT,
              }}>
                {selectedOrder.status === 'waiting' ? `Ждёт исполнителя · ${selectedOrder.responses} откликов` : 'Принят'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Адрес */}
              <div style={{ background: c.subtle, borderRadius: '0.75rem', padding: '0.875rem' }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: c.muted }}>Адрес</div>
                <div className="font-medium" style={{ color: c.text }}>
                  {selectedOrder.address}
                  {selectedOrder.entrance && `, подъезд ${selectedOrder.entrance}`}
                  {selectedOrder.apartment && `, кв. ${selectedOrder.apartment}`}
                </div>
              </div>

              {/* Дата и время */}
              <div className="grid grid-cols-2 gap-3">
                <div style={{ background: c.subtle, borderRadius: '0.75rem', padding: '0.875rem' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: c.muted }}>Дата</div>
                  <div className="font-medium" style={{ color: c.text }}>
                    {new Date(selectedOrder.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </div>
                </div>
                <div style={{ background: c.subtle, borderRadius: '0.75rem', padding: '0.875rem' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: c.muted }}>Время</div>
                  <div className="font-medium" style={{ color: c.text }}>{selectedOrder.time}</div>
                </div>
              </div>

              {/* Мешки и цена */}
              <div className="grid grid-cols-2 gap-3">
                <div style={{ background: c.subtle, borderRadius: '0.75rem', padding: '0.875rem' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: c.muted }}>Мешков</div>
                  <div className="font-medium" style={{ color: c.text }}>{selectedOrder.volume} шт.</div>
                </div>
                <div style={{ background: c.subtle, borderRadius: '0.75rem', padding: '0.875rem' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: c.muted }}>Цена</div>
                  <div className="text-xl font-bold" style={{ color: ACCENT }}>{selectedOrder.price}₽</div>
                </div>
              </div>

              {/* Комментарий */}
              {selectedOrder.description && (
                <div style={{ background: c.subtle, borderRadius: '0.75rem', padding: '0.875rem' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: c.muted }}>Комментарий</div>
                  <div className="text-sm" style={{ color: c.text }}>{selectedOrder.description}</div>
                </div>
              )}

              {/* Фото */}
              {selectedOrder.photoUrls.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: c.muted }}>Фото</div>
                  <div className="flex gap-2 flex-wrap">
                    {selectedOrder.photoUrls.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxUrl(url)}
                        style={{ position: 'relative', flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        <img src={url} alt="" style={{ width: '5rem', height: '5rem', objectFit: 'cover', borderRadius: '0.625rem', border: `1px solid ${c.border}`, display: 'block' }} />
                        <div style={{
                          position: 'absolute', bottom: '0.25rem', right: '0.25rem',
                          background: 'rgba(0,0,0,0.55)', borderRadius: '0.375rem',
                          padding: '0.125rem 0.3rem', fontSize: '0.65rem', color: 'white', lineHeight: 1.4,
                        }}>⤢</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Создан */}
              <div className="text-xs text-center" style={{ color: c.muted }}>Создан {selectedOrder.createdAt}</div>
            </div>

            <div className="flex flex-col gap-2 mt-5">
              <button
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => {
                  setCreateForm({
                    address: selectedOrder.address,
                    entrance: selectedOrder.entrance,
                    apartment: selectedOrder.apartment,
                    date: selectedOrder.date,
                    time: selectedOrder.time,
                    volume: selectedOrder.volume,
                    price: selectedOrder.price,
                    description: selectedOrder.description,
                  });
                  setPreloadedPhotoUrls(selectedOrder.photoUrls);
                  setCreatePhotos([]);
                  setOriginalOrder(selectedOrder);
                  setIsEditing(true);
                  setMyOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
                  setSelectedOrder(null);
                  setActiveTab('create');
                }}
              >
                Редактировать заказ
              </button>
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={() => setSelectedOrder(null)}
                >
                  Закрыть
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ border: `1px solid #fca5a5`, background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={() => {
                    setMyOrders((prev) => {
                      const updated = prev.filter((o) => o.id !== selectedOrder.id);
                      localStorage.setItem('trashgo_my_orders', JSON.stringify(updated));
                      return updated;
                    });
                    setSelectedOrder(null);
                    toast.success('Заказ отменён');
                  }}
                >
                  Отменить заказ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40" style={{ background: c.surface, borderTop: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <button onClick={() => setActiveTab('home')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'home' ? c.text : c.muted }}>
              <Home className="w-6 h-6" />
              <span className="text-xs">Главная</span>
            </button>
            <button onClick={() => setActiveTab('create')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'create' ? ACCENT : c.muted }}>
              <Plus className="w-6 h-6" />
              <span className="text-xs">Создать</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
