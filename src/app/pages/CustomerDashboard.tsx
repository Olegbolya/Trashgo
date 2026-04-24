import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/auth.store';
import { Home, MapPin, User, Plus, Package, CheckCircle, Clock, RefreshCw, Edit, LogOut, Bell, CreditCard, UserPlus, HelpCircle, Wallet, ArrowRightLeft, Moon, Sun, ChevronRight, Star, Phone, MessageCircle, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LevelSystem, type LevelData } from '../components/LevelSystem';
import { AchievementsPanel, type Achievement } from '../components/AchievementsPanel';
import { toast } from 'sonner';
import { getDayLabel } from '../lib/utils';
import { ordersApi } from '../../api/orders';
import type { Order } from '../../types/order';

const ACCENT = '#66BB6A';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'profile' | 'create'>('home');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [createForm, setCreateForm] = useState({ address: '', date: '', time: '', asap: false, volume: 1, price: 50, entrance: '', apartment: '', description: '' });
  const [createPhotos, setCreatePhotos] = useState<File[]>([]);
  const [preloadedPhotoUrls, setPreloadedPhotoUrls] = useState<string[]>([]);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<MyOrder | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  type MyOrder = {
    id: string; address: string; entrance: string; apartment: string;
    date: string; time: string; asap: boolean; volume: number; price: number;
    description: string; photoUrls: string[]; status: 'waiting' | 'active' | 'cancelled';
    responses: number; createdAt: string;
  };

  function apiOrderToMyOrder(o: Order, inMemoryPhotos?: string[]): MyOrder {
    return {
      id: o.id,
      address: o.address,
      entrance: '',
      apartment: '',
      date: o.asap ? '' : (o.scheduledAt?.slice(0, 10) ?? ''),
      time: o.asap ? '' : (o.scheduledAt?.slice(11, 16) ?? ''),
      asap: o.asap ?? false,
      volume: o.volume,
      price: o.price,
      description: o.description,
      photoUrls: inMemoryPhotos ?? o.photoUrls ?? [],
      status: o.status === 'new' ? 'waiting' : o.status === 'cancelled' ? 'cancelled' : 'active',
      responses: 0,
      createdAt: new Date(o.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
    };
  }

  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MyOrder | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const refreshOrders = () => {
    setOrdersLoading(true);
    ordersApi.list().then((res: any) => {
      const orders: Order[] = res?.data ?? [];
      setMyOrders(orders.map((o) => apiOrderToMyOrder(o)));
    }).catch(() => {}).finally(() => setOrdersLoading(false));
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  // Refresh when switching to home tab
  useEffect(() => {
    if (activeTab === 'home') refreshOrders();
  }, [activeTab]);

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
    level: user?.level ?? 1,
    xp: user?.xp ?? 0,
    nextLevelXp: 100,
    title: 'Новый клиент',
    rank: '🌱 Новичок',
    achievements: 0,
    totalOrders: myOrders.length,
  };

  const achievements: Achievement[] = [
    { id: 'first_order', icon: '🎯', title: 'Первый заказ', description: 'Создайте свой первый заказ', unlocked: myOrders.length >= 1, reward: '+10 XP' },
    { id: 'regular_customer', icon: '⭐', title: 'Постоянный клиент', description: 'Совершите 10 заказов', unlocked: myOrders.length >= 10, progress: myOrders.length, maxProgress: 10, reward: '-5% скидка' },
    { id: 'early_bird', icon: '🌅', title: 'Ранняя пташка', description: 'Заказ до 8:00 утра', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'referral_king', icon: '👥', title: 'Король рефералов', description: 'Пригласите 5 соседей', unlocked: false, progress: 0, maxProgress: 5 },
    { id: 'loyal_customer', icon: '💎', title: 'VIP клиент', description: 'Используйте платформу 30 дней подряд', unlocked: false, progress: 0, maxProgress: 30 },
  ];

  const stats = {
    totalOrders: myOrders.length,
    activeOrders: myOrders.filter(o => o.status === 'waiting' || o.status === 'active').length,
    completedOrders: myOrders.filter(o => o.status === 'cancelled').length,
    referrals: 0,
  };

  const today = new Date();
  const todayLabel = today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCapitalized = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  const navItems = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'create', icon: Plus, label: 'Создать заказ' },
    { id: 'calendar', icon: Clock, label: 'История заказов' },
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

              {/* My orders */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold" style={{ color: c.text }}>Мои заказы</h2>
                  {myOrders.length > 0 && (
                    <span className="text-sm px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}18`, color: ACCENT }}>{myOrders.length}</span>
                  )}
                </div>

                {myOrders.length === 0 ? (
                  <div className="text-center py-12" style={card}>
                    <Package className="w-12 h-12 mx-auto mb-4" style={{ color: c.border }} />
                    <div className="font-medium mb-1" style={{ color: c.text }}>Заказов пока нет</div>
                    <div className="text-sm mb-4" style={{ color: c.muted }}>Создайте первый заказ — исполнители увидят его сразу</div>
                    <button
                      className="px-5 py-2.5 rounded-xl font-medium text-sm"
                      style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => setActiveTab('create')}
                    >
                      + Создать заказ
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myOrders.map((order) => (
                      <div key={order.id} style={{ ...card2, borderColor: c.border, cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4" style={{ color: c.muted }} />
                              <span className="font-semibold" style={{ color: c.text }}>{order.address}</span>
                            </div>
                            <div className="text-sm mb-2 flex items-center gap-1.5 flex-wrap" style={{ color: c.muted }}>
                              {order.asap ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: ACCENT, fontWeight: 600 }}>⚡ Как можно скорее</span>
                              ) : (
                                <span>{order.date ? new Date(order.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : ''}{order.time ? ` · ${order.time}` : ''}</span>
                              )}
                              <span>· {order.volume} мешк.</span>
                            </div>
                            {order.status === 'waiting' ? (
                              <div className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg" style={{ background: '#F97316' + '18', color: '#F97316' }}>
                                <Clock className="w-3.5 h-3.5" />
                                <span>Ждёт исполнителя</span>
                              </div>
                            ) : order.status === 'active' ? (
                              <div className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Исполнитель найден</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg" style={{ background: '#9ca3af18', color: '#9ca3af' }}>
                                <span>Отменён</span>
                              </div>
                            )}
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
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: stats.activeOrders, label: 'Активных', color: c.text },
                  { value: stats.totalOrders, label: 'Всего заказов', color: c.text },
                  { value: stats.referrals, label: 'Рефералов', color: ACCENT },
                ].map((s, i) => (
                  <div key={i} style={{ ...card }}>
                    <div className="text-2xl font-semibold text-center mb-1" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-center" style={{ color: c.muted }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Subscriptions placeholder */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold" style={{ color: c.text }}>Подписки</h2>
                  <button className="text-sm flex items-center gap-1" style={{ background: 'none', border: 'none', color: c.muted, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => navigate('/create-subscription')}>
                    <Plus className="w-4 h-4" /> Создать
                  </button>
                </div>
                <div className="text-center py-8" style={card}>
                  <RefreshCw className="w-8 h-8 mx-auto mb-3" style={{ color: c.border }} />
                  <div className="text-sm font-medium mb-1" style={{ color: c.text }}>Нет активных подписок</div>
                  <div className="text-xs" style={{ color: c.muted }}>Регулярный вывоз по расписанию</div>
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: c.text }}>История заказов</h2>
                {myOrders.length === 0 ? (
                  <div className="text-center py-12" style={{ ...card }}>
                    <Package className="w-12 h-12 mx-auto mb-4" style={{ color: c.border }} />
                    <div className="mb-4" style={{ color: c.muted }}>История заказов пуста</div>
                    <button className="px-4 py-2 rounded-xl font-medium" style={{ background: c.text, color: c.surface, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setActiveTab('create')}>
                      + Создать заказ
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between" style={{ ...card, padding: '1rem', cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                        <div>
                          <div className="text-sm font-medium" style={{ color: c.text }}>{order.address}</div>
                          <div className="text-xs" style={{ color: c.muted }}>{order.createdAt} · {order.volume} мешк.</div>
                        </div>
                        <div className="text-sm font-medium" style={{ color: c.text }}>{order.price}₽</div>
                      </div>
                    ))}
                  </div>
                )}
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
                      <h1 className="text-lg font-semibold" style={{ color: c.text }}>{user?.name || '—'}</h1>
                      <div className="text-sm" style={{ color: c.muted }}>{user?.phone || '—'}</div>
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
              if (!createForm.asap && !createForm.date) errors.date = 'Укажите дату';
              if (!createForm.asap && !createForm.time) errors.time = 'Укажите время';
              if (createForm.price <= 0) errors.price = 'Цена должна быть больше 0';
              setCreateErrors(errors);
              if (Object.keys(errors).length > 0) return;

              const newPhotoUrls = await Promise.all(createPhotos.map(toBase64));
              const photoUrls = [...preloadedPhotoUrls, ...newPhotoUrls].slice(0, 5);

              let fullAddress = createForm.address.trim();
              if (createForm.entrance) fullAddress += `, подъезд ${createForm.entrance}`;
              if (createForm.apartment) fullAddress += `, кв. ${createForm.apartment}`;

              const scheduledAt = createForm.asap
                ? undefined
                : new Date(`${createForm.date}T${createForm.time}:00`).toISOString();

              try {
                const res = await ordersApi.create({
                  address: fullAddress,
                  district: user?.district || 'Казань',
                  volume: createForm.volume,
                  price: createForm.price,
                  description: createForm.description,
                  asap: createForm.asap,
                  scheduledAt,
                  photoUrls,
                }) as any;

                const apiOrder: Order = res?.data ?? res;
                const newOrder: MyOrder = {
                  id: apiOrder.id,
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
                setMyOrders((prev) => [newOrder, ...prev]);
                toast.success('Заказ создан!', { description: 'Исполнители уже видят ваш заказ', duration: 3000 });
                setCreateForm({ address: '', date: '', time: '', asap: false, volume: 1, price: 50, entrance: '', apartment: '', description: '' });
                setCreatePhotos([]);
                setPreloadedPhotoUrls([]);
                setCreateErrors({});
                setIsEditing(false);
                setOriginalOrder(null);
                setActiveTab('home');
              } catch (err: any) {
                toast.error(err?.message || 'Не удалось создать заказ');
              }
            };

            return (
              <div className="max-w-2xl mx-auto space-y-4">
                <h1 className="text-xl font-semibold" style={{ color: c.text }}>Новый заказ</h1>

                <div style={card}>
                  <div className="space-y-4">

                    {/* Адрес дома — обязательное */}
                    <div style={{ position: 'relative' }}>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Адрес <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        value={createForm.address}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCreateForm({ ...createForm, address: val });
                          setCreateErrors({ ...createErrors, address: '' });
                          if (val.length > 0) {
                            const pastAddrs = [...new Set(myOrders.map(o => o.address).filter(a => a.toLowerCase().includes(val.toLowerCase())))];
                            const regAddr = user?.district && user.district.toLowerCase().includes(val.toLowerCase()) ? [user.district] : [];
                            const unique = [...new Set([...regAddr, ...pastAddrs])];
                            setAddressSuggestions(unique);
                            setShowAddressSuggestions(unique.length > 0);
                          } else {
                            setShowAddressSuggestions(false);
                          }
                        }}
                        onFocus={() => {
                          if (createForm.address.length === 0) {
                            const pastAddrs = [...new Set(myOrders.map(o => o.address).filter(Boolean))];
                            const regAddr = user?.district ? [user.district] : [];
                            const unique = [...new Set([...regAddr, ...pastAddrs])];
                            if (unique.length > 0) {
                              setAddressSuggestions(unique);
                              setShowAddressSuggestions(true);
                            }
                          }
                        }}
                        onBlur={() => { setTimeout(() => setShowAddressSuggestions(false), 150); }}
                        placeholder="ул. Баумана, 58"
                        style={inputStyle(!!createErrors.address)}
                      />
                      {showAddressSuggestions && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: c.surface, border: `1px solid ${c.border}`, borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginTop: '2px', overflow: 'hidden' }}>
                          {addressSuggestions.map((addr, i) => {
                            const isReg = addr === user?.district;
                            return (
                              <button
                                key={i}
                                type="button"
                                onMouseDown={() => {
                                  setCreateForm({ ...createForm, address: addr });
                                  setShowAddressSuggestions(false);
                                }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: c.text, fontFamily: 'inherit', borderBottom: i < addressSuggestions.length - 1 ? `1px solid ${c.border}` : 'none' }}
                                onMouseEnter={e => (e.currentTarget.style.background = c.subtle)}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <MapPin style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0, color: isReg ? ACCENT : c.muted }} />
                                  {addr}
                                </span>
                                {isReg && (
                                  <span style={{ fontSize: '0.7rem', color: ACCENT, background: `${ACCENT}18`, padding: '0.1rem 0.4rem', borderRadius: '0.25rem', flexShrink: 0 }}>
                                    мой район
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
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

                    {/* Когда — переключатель ASAP / к дате */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>
                        Когда нужен исполнитель <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[
                          { asap: true,  icon: '⚡', label: 'Как можно скорее' },
                          { asap: false, icon: '📅', label: 'К определённой дате' },
                        ].map((opt) => (
                          <button
                            key={String(opt.asap)}
                            type="button"
                            onClick={() => setCreateForm({ ...createForm, asap: opt.asap, date: '', time: '' })}
                            style={{
                              padding: '0.625rem 0.5rem',
                              borderRadius: '0.75rem',
                              border: `1.5px solid ${createForm.asap === opt.asap ? ACCENT : c.border}`,
                              background: createForm.asap === opt.asap ? `${ACCENT}12` : 'transparent',
                              cursor: 'pointer', fontFamily: 'inherit',
                              fontSize: '0.8rem', fontWeight: createForm.asap === opt.asap ? 600 : 400,
                              color: createForm.asap === opt.asap ? ACCENT : c.textSub,
                              transition: 'all 0.15s',
                            }}
                          >
                            <span style={{ marginRight: '0.375rem' }}>{opt.icon}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {!createForm.asap && (
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
                      )}

                      {createForm.asap && (
                        <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.75rem', background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, fontSize: '0.8rem', color: ACCENT }}>
                          ⚡ Исполнители увидят, что заказ срочный
                        </div>
                      )}
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
                              return [originalOrder, ...prev];
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
                        onClick={async () => {
                          if (originalOrder) {
                            try { await ordersApi.updateStatus(originalOrder.id, 'cancelled'); } catch {}
                            setMyOrders((prev) => prev.filter((o) => o.id !== originalOrder.id));
                          }
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
                  onClick={async () => {
                    try { await ordersApi.updateStatus(selectedOrder.id, 'cancelled'); } catch {}
                    setMyOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
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
