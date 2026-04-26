import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuthStore } from '../../stores/auth.store';
import { Home, MapPin, User, Star, Briefcase, TrendingUp, Package, Clock, CheckCircle, Search, Plus, MessageCircle, Phone, Bell, CreditCard, UserPlus, HelpCircle, Edit, LogOut, Wallet, ArrowRightLeft, Moon, Sun, ChevronRight, Calendar, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LevelSystem, type LevelData } from '../components/LevelSystem';
import { AchievementsPanel, type Achievement } from '../components/AchievementsPanel';
import { toast } from 'sonner';
import { getDayLabel } from '../lib/utils';
import { ordersApi } from '../../api/orders';
import { authApi } from '../../api/auth';
import type { Order, ChatMessage } from '../../types/order';
import { MapView } from '../components/MapView';
import { HowItWorksModal } from '../components/HowItWorksModal';
import { RatingModal } from '../components/RatingModal';

const ACCENT = '#2196F3';

export default function ContractorDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const VALID_TABS = ['active', 'home', 'find', 'history', 'profile'] as const;
  type TabType = typeof VALID_TABS[number];
  const activeTab: TabType = (VALID_TABS.includes(searchParams.get('tab') as TabType) ? searchParams.get('tab') : 'active') as TabType;
  const setActiveTab = (tab: TabType) => setSearchParams({ tab });
  const [isOnShift, setIsOnShift] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myJobs, setMyJobs] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [completionPhotos, setCompletionPhotos] = useState<Record<string, File[]>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [chatJobId, setChatJobId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [jobContacts, setJobContacts] = useState<Record<string, { phone: string; name: string }>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [hiddenOrderIds, setHiddenOrderIds] = useState<Set<string>>(new Set());
  const [showMap, setShowMap] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<{ id: string; customerName: string } | null>(null);

  useEffect(() => {
    if (activeTab !== 'find') return;
    const load = (initial: boolean) => {
      if (initial) setOrdersLoading(true);
      ordersApi.available().then((res: any) => {
        setAvailableOrders(res?.data ?? []);
      }).catch(() => {}).finally(() => { if (initial) setOrdersLoading(false); });
    };
    load(true);
    const interval = setInterval(() => load(false), 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'active' && activeTab !== 'home' && activeTab !== 'history') return;
    const load = () => {
      ordersApi.myJobs().then((res: any) => {
        setMyJobs(res?.data ?? []);
      }).catch(() => {});
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Refresh user data (balance) when opening profile
  const { updateUser } = useAuthStore();
  useEffect(() => {
    if (activeTab !== 'profile') return;
    authApi.me().then((u) => updateUser(u)).catch(() => {});
  }, [activeTab]);

  // Poll chat messages while a chat is open
  useEffect(() => {
    if (!chatJobId) return;
    const fetch = () => ordersApi.getMessages(chatJobId).then((res: any) => {
      setChatMessages(res?.data ?? []);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }).catch(() => {});
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [chatJobId]);

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
    title: 'Новый исполнитель',
    rank: '🌱 Новичок',
    achievements: 0,
    totalOrders: 0,
  };

  const achievements: Achievement[] = [
    { id: 'first_pickup', icon: '🎯', title: 'Первый вывоз', description: 'Выполните свой первый заказ', unlocked: false, reward: '+10 XP' },
    { id: 'speed_master', icon: '⚡', title: 'Мастер скорости', description: 'Вывезите 100 адресов', unlocked: false, progress: 0, maxProgress: 100, reward: '+50 XP' },
    { id: 'reliable_contractor', icon: '⭐', title: 'Надежный исполнитель', description: 'Рейтинг 4.5+ после 20 заказов', unlocked: false, progress: 0, maxProgress: 20, reward: 'Значок надежности' },
    { id: 'subscription_pro', icon: '🔄', title: 'Мастер подписок', description: 'Получите 5 постоянных адресов', unlocked: false, progress: 0, maxProgress: 5, reward: 'Приоритет в поиске' },
    { id: 'early_bird', icon: '🌅', title: 'Ранняя пташка', description: 'Начните вывоз до 7:00', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'marathon_runner', icon: '🏃', title: 'Марафонец', description: 'Работайте 30 дней подряд', unlocked: false, progress: 0, maxProgress: 30 },
    { id: 'top_rated', icon: '🌟', title: 'Лучший рейтинг', description: 'Получите рейтинг 5.0', unlocked: false, progress: 0, maxProgress: 5.0 },
    { id: 'big_earner', icon: '💰', title: 'Большой заработок', description: 'Заработайте 50000₽ за месяц', unlocked: false, progress: 0, maxProgress: 50000 },
  ];

  const handleStartPickup = (order: any) => {
    toast.success('🚀 Вынос начат!', { description: `Клиентам по адресу ${order.address} отправлены уведомления`, duration: 3000 });
    setTimeout(() => toast.info('📱 Уведомления доставлены', { description: `${order.addressCount} клиентов получили push-уведомление`, duration: 2500 }), 1000);
  };

  const myAddresses: { id: number; address: string; building: string; customer: string; days: number[]; time: string; addressCount: number; price: number; nextOrder: string; floor: string; hasLift: boolean }[] = [];
  const todayOrders: { id: number; address: string; building: string; customer: string; time: string; addressCount: number; price: number; floor: string; hasLift: boolean; status: string }[] = [];
  const totalAddresses = 0;
  const history: { id: number; address: string; date: string; customer: string; price: string }[] = [];

  const today = new Date();
  const todayShort = today.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

  const card: React.CSSProperties = {
    background: c.surface, border: `1px solid ${c.border}`,
    borderRadius: '1rem', padding: '1.25rem',
  };

  return (
    <div className="min-h-screen lg:flex" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 z-50" style={{ background: c.surface, borderRight: `2px solid ${ACCENT}` }}>
        {/* Profile header — clickable */}
        <button
          onClick={() => setActiveTab('profile')}
          className="w-full flex items-center gap-3 p-5 text-left"
          style={{ borderBottom: `1px solid ${c.border}`, background: 'none', border: 'none', borderBottom: `1px solid ${c.border}`, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: c.text }}>{user?.name || 'Профиль'}</div>
            <div className="text-xs" style={{ color: c.muted }}>Исполнитель</div>
          </div>
        </button>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Shift toggle */}
          <button
            onClick={() => setIsOnShift(!isOnShift)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1"
            style={{ background: isOnShift ? `${ACCENT}18` : c.subtle, color: isOnShift ? ACCENT : c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <span className="text-base">{isOnShift ? '🟢' : '⚫'}</span>
            {isOnShift ? 'Открыт для заказов' : 'Не принимаю заказы'}
          </button>
          {[
            { id: 'active' as const, icon: CheckCircle, label: 'Активные заказы' },
            { id: 'home' as const, icon: Home, label: 'Главная' },
            { id: 'find' as const, icon: Search, label: 'Найти заказ' },
            { id: 'history' as const, icon: Calendar, label: 'История заказов' },
          ].map(({ id, icon: Icon, label }) => (
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
            onClick={() => setShowHowItWorks(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium"
            style={{ background: 'transparent', color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <HelpCircle className="w-5 h-5" />
            Как это работает?
          </button>
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
            {/* Drawer header — profile, clickable */}
            <button
              onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 p-4 text-left"
              style={{ borderBottom: `1px solid ${c.border}`, background: 'none', border: 'none', borderBottom: `1px solid ${c.border}`, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: c.text }}>{user?.name || 'Профиль'}</div>
                <div className="text-xs" style={{ color: c.muted }}>Исполнитель</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', padding: '0.25rem', flexShrink: 0 }}
              >
                <X className="w-5 h-5" />
              </button>
            </button>

            {/* Drawer nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {/* Shift toggle */}
              <button
                onClick={() => setIsOnShift(!isOnShift)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1"
                style={{ background: isOnShift ? `${ACCENT}18` : c.subtle, color: isOnShift ? ACCENT : c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <span className="text-base">{isOnShift ? '🟢' : '⚫'}</span>
                {isOnShift ? 'Открыт для заказов' : 'Не принимаю заказы'}
              </button>
              {[
                { id: 'active' as const, icon: CheckCircle, label: 'Активные заказы' },
                { id: 'home' as const, icon: Home, label: 'Главная' },
                { id: 'find' as const, icon: Search, label: 'Найти заказ' },
                { id: 'history' as const, icon: Calendar, label: 'История заказов' },
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
                onClick={() => { setShowHowItWorks(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'transparent', color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <HelpCircle className="w-5 h-5" />
                Как это работает?
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

          {/* ACTIVE TAB */}
          {activeTab === 'active' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <LevelSystem data={levelData} variant="contractor" compact={true} />

              {/* Active jobs */}
              {(() => {
                const activeJobs = myJobs.filter(j => j.status === 'accepted' || j.status === 'in_progress' || j.status === 'pending_confirmation');
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-base font-semibold" style={{ color: c.text }}>Мои заказы</h2>
                      <span className="text-xs" style={{ color: c.muted }}>{activeJobs.length} активных</span>
                    </div>

                    {activeJobs.length === 0 ? (
                      <div className="text-center py-10" style={card}>
                        <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: c.border }} />
                        <div className="text-sm font-medium mb-1" style={{ color: c.text }}>Нет активных заказов</div>
                        <div className="text-xs mb-3" style={{ color: c.muted }}>Перейдите во вкладку «Найти» и возьмите заказ</div>
                        <button className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setActiveTab('find')}>
                          Найти заказ
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeJobs.map((job) => {
                          const dt = job.scheduledAt ? new Date(job.scheduledAt) : null;
                          const timeStr = dt ? dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '';
                          const dateStr = dt ? dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '';
                          const statusLabel = job.status === 'accepted' ? 'Принят' : job.status === 'in_progress' ? 'В работе' : 'Ждёт подтверждения';
                          const statusColor = job.status === 'accepted' ? ACCENT : job.status === 'in_progress' ? '#FBBF24' : '#F97316';
                          return (
                            <div key={job.id} style={{ ...card, padding: '0.875rem' }}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {job.asap ? (
                                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ACCENT }}>⚡ Как можно скорее</span>
                                    ) : (
                                      <>
                                        <Clock className="w-3.5 h-3.5" style={{ color: c.muted }} />
                                        <span className="text-sm font-semibold" style={{ color: c.text }}>{timeStr}</span>
                                        <span className="text-xs" style={{ color: c.muted }}>{dateStr}</span>
                                      </>
                                    )}
                                    <span className="px-1.5 py-0.5 text-xs font-medium rounded" style={{ background: `${statusColor}20`, color: statusColor }}>{statusLabel}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <MapPin className="w-3.5 h-3.5" style={{ color: c.muted }} />
                                    <span className="text-sm font-medium" style={{ color: c.text }}>{job.address}</span>
                                  </div>
                                  {job.description && (
                                    <div className="text-xs" style={{ color: c.muted }}>{job.description}</div>
                                  )}
                                </div>
                                <div className="text-right ml-3">
                                  <div className="text-xl font-bold" style={{ color: ACCENT }}>{job.price}₽</div>
                                  <div className="text-xs" style={{ color: c.muted }}>{job.volume} мешк.</div>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-col">
                                {job.status === 'accepted' && (
                                  <button
                                    className="w-full text-xs font-semibold h-9 rounded-lg"
                                    style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                                    onClick={async () => {
                                      try {
                                        await ordersApi.updateStatus(job.id, 'in_progress');
                                        setMyJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'in_progress' as const } : j));
                                        toast.success('Отмечено: мусор получен, идёте к баку');
                                      } catch (e: any) { toast.error(e?.message || 'Ошибка'); }
                                    }}
                                  >
                                    ✅ Получено — иду к баку
                                  </button>
                                )}
                                {job.status === 'in_progress' && (
                                  <div className="space-y-2">
                                    <div className="text-xs font-medium" style={{ color: c.muted }}>Сфотографируйте мусор у бака:</div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', border: `1.5px dashed ${c.border}`, borderRadius: '0.625rem', cursor: 'pointer', background: c.subtle }}>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                          const files = Array.from(e.target.files || []);
                                          setCompletionPhotos(prev => ({ ...prev, [job.id]: [...(prev[job.id] || []), ...files].slice(0, 3) }));
                                        }}
                                      />
                                      <span style={{ fontSize: '1.1rem' }}>📷</span>
                                      <span className="text-xs" style={{ color: c.textSub }}>
                                        {(completionPhotos[job.id]?.length ?? 0) > 0
                                          ? `${completionPhotos[job.id].length} фото выбрано`
                                          : 'Добавить фото (до 3)'}
                                      </span>
                                    </label>
                                    {(completionPhotos[job.id]?.length ?? 0) > 0 && (
                                      <div className="flex gap-1.5 flex-wrap">
                                        {completionPhotos[job.id].map((file, i) => (
                                          <div key={i} style={{ position: 'relative' }}>
                                            <img src={URL.createObjectURL(file)} alt="" style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: '0.5rem', border: `1px solid ${c.border}` }} />
                                            <button
                                              onClick={() => setCompletionPhotos(prev => ({ ...prev, [job.id]: prev[job.id].filter((_, idx) => idx !== i) }))}
                                              style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', width: '1rem', height: '1rem', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >✕</button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <button
                                      className="w-full text-xs font-semibold h-9 rounded-lg"
                                      disabled={submittingId === job.id || (completionPhotos[job.id]?.length ?? 0) === 0}
                                      style={{ background: (completionPhotos[job.id]?.length ?? 0) === 0 ? c.border : '#4CAF50', color: (completionPhotos[job.id]?.length ?? 0) === 0 ? c.muted : 'white', border: 'none', cursor: (completionPhotos[job.id]?.length ?? 0) === 0 || submittingId === job.id ? 'not-allowed' : 'pointer', opacity: submittingId === job.id ? 0.6 : 1, fontFamily: 'inherit' }}
                                      onClick={async () => {
                                        const photos = completionPhotos[job.id] || [];
                                        if (photos.length === 0) {
                                          toast.error('Сначала сделайте фото мусора у бака');
                                          return;
                                        }
                                        setSubmittingId(job.id);
                                        try {
                                          const toBase64 = (f: File) => new Promise<string>((resolve) => {
                                            const r = new FileReader();
                                            r.onload = () => resolve(r.result as string);
                                            r.readAsDataURL(f);
                                          });
                                          const urls = await Promise.all(photos.map(toBase64));
                                          await ordersApi.completeOrder(job.id, urls);
                                          setMyJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'pending_confirmation' as const } : j));
                                          setCompletionPhotos(prev => { const n = { ...prev }; delete n[job.id]; return n; });
                                          toast.success('Выполнение отправлено!', { description: 'Ждите подтверждения от заказчика', duration: 3000 });
                                        } catch (e: any) { toast.error(e?.message || 'Ошибка'); }
                                        finally { setSubmittingId(null); }
                                      }}
                                    >
                                      {submittingId === job.id ? 'Отправляем...' : (completionPhotos[job.id]?.length ?? 0) === 0 ? '📷 Сначала сделайте фото' : '🏁 Завершить — отправить фото'}
                                    </button>
                                  </div>
                                )}
                                {job.status === 'pending_confirmation' && (
                                  <div className="w-full h-8 rounded-lg flex items-center justify-center text-xs font-semibold" style={{ background: '#FFF3CD', color: '#856404', border: '1px solid #ffc107' }}>
                                    ⏳ Ждёт подтверждения заказчика
                                  </div>
                                )}
                                {/* Call + Chat */}
                                <div className="flex gap-2 pt-1">
                                  <a
                                    href={jobContacts[job.id]?.phone ? `tel:${jobContacts[job.id].phone}` : undefined}
                                    onClick={!jobContacts[job.id]?.phone ? async (e) => {
                                      e.preventDefault();
                                      const res = await ordersApi.getById(job.id) as any;
                                      const d = res?.data ?? res;
                                      if (d?.customerPhone) {
                                        setJobContacts(prev => ({ ...prev, [job.id]: { phone: d.customerPhone, name: d.customerName ?? '' } }));
                                        window.location.href = `tel:${d.customerPhone}`;
                                      } else toast.info('Телефон заказчика недоступен');
                                    } : undefined}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '2rem', borderRadius: '0.5rem', border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                                  >
                                    <Phone className="w-3 h-3" />Позвонить
                                  </a>
                                  <button
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '2rem', borderRadius: '0.5rem', border: `1px solid ${chatJobId === job.id ? ACCENT : c.border}`, background: chatJobId === job.id ? `${ACCENT}18` : 'transparent', color: chatJobId === job.id ? ACCENT : c.textSub, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                                    onClick={() => { setChatJobId(prev => prev === job.id ? null : job.id); setChatMessages([]); setChatInput(''); }}
                                  >
                                    <MessageCircle className="w-3 h-3" />Чат
                                  </button>
                                </div>
                                {/* Chat panel */}
                                {chatJobId === job.id && (
                                  <div style={{ border: `1.5px solid ${c.border}`, borderRadius: '0.75rem', overflow: 'hidden', marginTop: '0.25rem' }}>
                                    <div style={{ height: '200px', overflowY: 'auto', padding: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: c.subtle }}>
                                      {chatMessages.length === 0 && (
                                        <div style={{ textAlign: 'center', color: c.muted, fontSize: '0.75rem', marginTop: '1.5rem' }}>Начните переписку с заказчиком</div>
                                      )}
                                      {chatMessages.map(msg => {
                                        const isMine = msg.senderId === user?.id;
                                        return (
                                          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                            {!isMine && <span style={{ fontSize: '0.65rem', color: c.muted, marginBottom: '0.1rem', paddingLeft: '0.2rem' }}>{msg.senderName}</span>}
                                            <div style={{ maxWidth: '80%', padding: '0.4rem 0.625rem', borderRadius: isMine ? '0.875rem 0.875rem 0.2rem 0.875rem' : '0.875rem 0.875rem 0.875rem 0.2rem', background: isMine ? ACCENT : c.surface, color: isMine ? 'white' : c.text, fontSize: '0.8rem', wordBreak: 'break-word' }}>{msg.text}</div>
                                            <span style={{ fontSize: '0.6rem', color: c.muted, marginTop: '0.1rem' }}>{new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                                          </div>
                                        );
                                      })}
                                      <div ref={chatBottomRef} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem', padding: '0.5rem', background: c.surface, borderTop: `1px solid ${c.border}` }}>
                                      <input
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={async e => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (!chatInput.trim() || chatSending) return;
                                            const text = chatInput.trim(); setChatInput(''); setChatSending(true);
                                            try {
                                              await ordersApi.sendMessage(job.id, text);
                                              const res = await ordersApi.getMessages(job.id) as any;
                                              setChatMessages(res?.data ?? []);
                                              setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                                            } catch { setChatInput(text); } finally { setChatSending(false); }
                                          }
                                        }}
                                        placeholder="Написать заказчику…"
                                        style={{ flex: 1, height: '2rem', padding: '0 0.625rem', borderRadius: '0.5rem', border: `1px solid ${c.border}`, background: c.input, color: c.text, fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit' }}
                                      />
                                      <button
                                        disabled={!chatInput.trim() || chatSending}
                                        onClick={async () => {
                                          if (!chatInput.trim() || chatSending) return;
                                          const text = chatInput.trim(); setChatInput(''); setChatSending(true);
                                          try {
                                            await ordersApi.sendMessage(job.id, text);
                                            const res = await ordersApi.getMessages(job.id) as any;
                                            setChatMessages(res?.data ?? []);
                                            setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                                          } catch { setChatInput(text); } finally { setChatSending(false); }
                                        }}
                                        style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: chatInput.trim() ? ACCENT : c.border, color: 'white', border: 'none', cursor: chatInput.trim() ? 'pointer' : 'default', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                      >→</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          )}

          {/* HOME TAB — overview */}
          {activeTab === 'home' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <LevelSystem data={levelData} variant="contractor" compact={true} />
              <div style={card}>
                <div className="text-base font-semibold mb-3" style={{ color: c.text }}>Добро пожаловать, {user?.name?.split(' ')[0] || 'Исполнитель'}!</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3 text-center" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <div className="text-2xl font-bold" style={{ color: ACCENT }}>{myJobs.filter(j => j.status === 'accepted' || j.status === 'in_progress' || j.status === 'pending_confirmation').length}</div>
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>активных заказов</div>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: c.subtle, border: `1px solid ${c.border}` }}>
                    <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>{(user?.balance ?? 0).toLocaleString('ru-RU')}₽</div>
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>баланс</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setActiveTab('find')}>
                    Найти заказ
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: c.subtle, color: c.textSub, border: `1px solid ${c.border}`, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setActiveTab('active')}>
                    Мои заказы
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto space-y-3">
              <h1 className="text-xl font-semibold" style={{ color: c.text }}>История заказов</h1>
              {(() => {
                const completedJobs = myJobs.filter(j => j.status === 'completed');
                const cancelledJobs = myJobs.filter(j => j.status === 'cancelled');
                const allDone = [...completedJobs, ...cancelledJobs];
                return allDone.length === 0 ? (
                  <div className="text-center py-12" style={card}>
                    <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: c.border }} />
                    <div className="font-medium mb-1" style={{ color: c.text }}>История пуста</div>
                    <div className="text-sm" style={{ color: c.muted }}>Выполненные заказы появятся здесь</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allDone.map((job) => {
                      const dt = job.scheduledAt ? new Date(job.scheduledAt) : null;
                      const dateStr = dt ? dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '';
                      const timeStr = dt ? dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '';
                      const isDone = job.status === 'completed';
                      return (
                        <div key={job.id} style={{ ...card, padding: '0.875rem' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {isDone
                                  ? <CheckCircle className="w-3.5 h-3.5" style={{ color: '#4CAF50' }} />
                                  : <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>✕</span>
                                }
                                <span className="text-sm font-medium" style={{ color: c.text }}>{job.address}</span>
                              </div>
                              <div className="text-xs" style={{ color: c.muted }}>
                                {job.asap ? '⚡ ASAP' : `${dateStr} · ${timeStr}`} · {job.volume} мешк.
                              </div>
                            </div>
                            <div className="text-base font-bold ml-3" style={{ color: isDone ? '#4CAF50' : '#9ca3af' }}>
                              {isDone ? `+${job.price}₽` : 'Отменён'}
                            </div>
                          </div>
                          {isDone && !(job as any).ratingByContractor && (
                            <button
                              className="w-full mt-2 h-8 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                              style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`, color: ACCENT, cursor: 'pointer', fontFamily: 'inherit' }}
                              onClick={() => setRatingOrder({ id: job.id, customerName: 'Заказчик' })}
                            >
                              ⭐ Оценить заказчика
                            </button>
                          )}
                          {isDone && (job as any).ratingByContractor && (
                            <div className="mt-2 text-xs text-center" style={{ color: c.muted }}>
                              {'★'.repeat((job as any).ratingByContractor)}{'☆'.repeat(5 - (job as any).ratingByContractor)} Вы оценили
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (() => {
            const statusLabel = (user?.level ?? 1) >= 6 ? 'Мастер' : (user?.level ?? 1) >= 4 ? 'Профи' : (user?.level ?? 1) >= 2 ? 'Опытный' : 'Новичок';
            const completedJobsCount = myJobs.filter(j => j.status === 'completed').length;
            const balance = user?.balance ?? 0;
            return (
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Profile Header */}
              <div style={card}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl" style={{ background: `${ACCENT}20`, color: ACCENT }}>
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold" style={{ color: c.text }}>{user?.name || '—'}</h1>
                      <div className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ background: `${ACCENT}18`, color: ACCENT }}>{statusLabel}</div>
                      <div className="text-sm mt-1" style={{ color: c.muted }}>{user?.phone || '—'}</div>
                    </div>
                  </div>
                  <button className="h-8 px-3 rounded-lg text-xs" style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast.info('Редактирование профиля', { description: 'Функция в разработке' })}>
                    <Edit className="w-3.5 h-3.5 inline mr-1" />Изменить
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { v: <><Star className="w-3.5 h-3.5 inline mb-0.5" style={{ color: '#FBBF24', fill: '#FBBF24' }} /> —</>, l: 'рейтинг' },
                    { v: completedJobsCount, l: 'заказов' },
                    { v: achievements.filter(a => a.unlocked).length, l: 'достижений' },
                    { v: '🏆', l: 'награды' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-2.5 text-center" style={{ background: c.subtle }}>
                      <div className="text-lg font-semibold" style={{ color: c.text }}>{s.v}</div>
                      <div className="text-xs" style={{ color: c.muted }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earnings */}
              <div style={card}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" style={{ color: c.muted }} />
                    <h2 className="text-sm font-semibold" style={{ color: c.text }}>Заработок</h2>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl p-3" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <div className="text-xs mb-1" style={{ color: c.muted }}>За день</div>
                    <div className="text-xl font-bold" style={{ color: '#4CAF50' }}>0₽</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <div className="text-xs mb-1" style={{ color: c.muted }}>За неделю</div>
                    <div className="text-xl font-bold" style={{ color: '#4CAF50' }}>0₽</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <div className="text-xs mb-1" style={{ color: c.muted }}>За месяц</div>
                    <div className="text-xl font-bold" style={{ color: '#4CAF50' }}>0₽</div>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-xl flex items-center justify-between" style={{ background: '#4CAF5012', border: '1px solid #4CAF5020' }}>
                  <div className="text-sm" style={{ color: c.text }}>Баланс</div>
                  <div className="text-xl font-bold" style={{ color: '#4CAF50' }}>{balance.toLocaleString('ru-RU')}₽</div>
                </div>
              </div>

              <LevelSystem data={levelData} variant="contractor" />
              <AchievementsPanel achievements={achievements} variant="contractor" />

              {/* Work Info */}
              <div style={card}>
                <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Дополнительная информация</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { l: 'Район работы', v: user?.district || '—' },
                    { l: 'Способ передвижения', v: '🚗 Машина' },
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
            );
          })()}

          {/* FIND ORDERS TAB */}
          {activeTab === 'find' && (() => {
            const visibleOrders = availableOrders.filter(o => !hiddenOrderIds.has(o.id));
            return (
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold" style={{ color: c.text }}>Заказы рядом</h1>
                <div className="text-sm" style={{ color: c.muted }}>{user?.district || 'Все районы'}</div>
              </div>

              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ ...card, padding: '1rem' }}>
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 rounded-lg w-1/2" style={{ background: c.border }} />
                        <div className="h-3 rounded-lg w-3/4" style={{ background: c.border }} />
                        <div className="h-3 rounded-lg w-1/3" style={{ background: c.border }} />
                        <div className="h-10 rounded-lg w-full" style={{ background: c.border }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : visibleOrders.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', padding: '2.5rem 1.25rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                  <div className="font-semibold mb-1" style={{ color: c.text }}>Заказов пока нет</div>
                  <div className="text-sm" style={{ color: c.muted }}>Когда заказчики создадут заявки, они появятся здесь</div>
                </div>
              ) : (
                <>
                  <div style={card}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl p-3 text-center" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                        <div className="text-2xl font-bold" style={{ color: ACCENT }}>
                          {visibleOrders.reduce((s, o) => s + o.price, 0)}₽
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: c.muted }}>можно заработать</div>
                      </div>
                      <div className="rounded-xl p-3 text-center" style={{ background: c.subtle, border: `1px solid ${c.border}` }}>
                        <div className="text-2xl font-bold" style={{ color: c.text }}>{visibleOrders.length}</div>
                        <div className="text-xs mt-0.5" style={{ color: c.muted }}>заказов доступно</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {visibleOrders.map((order) => {
                      const isAsap = order.asap;
                      const dt = order.scheduledAt ? new Date(order.scheduledAt) : null;
                      const timeStr = dt ? dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '';
                      const dateStr = dt ? dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '';
                      return (
                        <div key={order.id} style={{ ...card, cursor: 'pointer', borderColor: isAsap ? ACCENT : c.border }} onClick={() => setSelectedOrder(order)}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {isAsap ? (
                                  <>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: ACCENT }}>⚡ Как можно скорее</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-4 h-4" style={{ color: c.muted }} />
                                    <span className="text-base font-semibold" style={{ color: c.text }}>{timeStr}</span>
                                    <span className="text-xs" style={{ color: c.muted }}>{dateStr}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <MapPin className="w-3.5 h-3.5" style={{ color: c.muted }} />
                                <span className="text-sm font-medium" style={{ color: c.text }}>{order.address}</span>
                              </div>
                              {order.description && (
                                <div className="text-xs mb-2" style={{ color: c.muted }}>{order.description}</div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}20`, color: ACCENT }}>
                                  <Package className="w-3 h-3" />{order.volume} мешк.
                                </span>
                                {(order.photoUrls?.length ?? 0) > 0 && (
                                  <span className="text-xs" style={{ color: c.muted }}>📷 {order.photoUrls.length}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold" style={{ color: c.text }}>{order.price}₽</div>
                              <div className="text-xs mt-1" style={{ color: c.muted }}>Подробнее →</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            );
          })()}

        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[80] flex items-end lg:items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => { setSelectedOrder(null); setShowMap(false); }}>
          <div
            className="w-full lg:max-w-lg rounded-t-2xl lg:rounded-2xl overflow-y-auto"
            style={{ background: c.surface, maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, background: c.surface, zIndex: 1 }}>
              <button onClick={() => { setSelectedOrder(null); setShowMap(false); }} style={{ background: c.subtle, border: 'none', cursor: 'pointer', color: c.textSub, display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Назад
              </button>
              <h2 className="text-base font-bold" style={{ color: c.text }}>Детали заказа</h2>
              <button onClick={() => { setSelectedOrder(null); setShowMap(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Address & time */}
              <div style={{ ...card, padding: '1rem' }}>
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                  <div>
                    <div className="font-semibold" style={{ color: c.text }}>{selectedOrder.address}</div>
                    <div className="text-sm mt-0.5" style={{ color: c.muted }}>{selectedOrder.district}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 flex-shrink-0" style={{ color: selectedOrder.asap ? ACCENT : c.muted }} />
                  {selectedOrder.asap ? (
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: ACCENT }}>⚡ Как можно скорее</span>
                  ) : (
                    <div className="text-sm" style={{ color: c.text }}>
                      {selectedOrder.scheduledAt ? new Date(selectedOrder.scheduledAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : ''}
                      {selectedOrder.scheduledAt ? ' · ' + new Date(selectedOrder.scheduledAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Params */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                  <div className="text-2xl font-bold" style={{ color: ACCENT }}>{selectedOrder.price}₽</div>
                  <div className="text-xs mt-0.5" style={{ color: c.muted }}>оплата</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: c.subtle, border: `1px solid ${c.border}` }}>
                  <div className="text-2xl font-bold" style={{ color: c.text }}>{selectedOrder.volume}</div>
                  <div className="text-xs mt-0.5" style={{ color: c.muted }}>мешков</div>
                </div>
              </div>

              {/* Description */}
              {selectedOrder.description && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: c.muted }}>Описание</div>
                  <div className="text-sm" style={{ color: c.text }}>{selectedOrder.description}</div>
                </div>
              )}

              {/* Photos */}
              {selectedOrder.photoUrls && selectedOrder.photoUrls.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: c.muted }}>Фото ({selectedOrder.photoUrls.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.photoUrls.map((url, i) => (
                      <button key={i} onClick={() => setLightboxUrl(url)} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
                        <img src={url} alt="" style={{ width: '5rem', height: '5rem', objectFit: 'cover', borderRadius: '0.75rem', border: `2px solid ${c.border}` }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Map — toggle */}
              <button
                className="w-full h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: showMap ? `${ACCENT}18` : c.subtle, color: showMap ? ACCENT : c.textSub, border: `1px solid ${showMap ? ACCENT : c.border}`, cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => setShowMap(v => !v)}
              >
                <MapPin className="w-4 h-4" style={{ color: showMap ? ACCENT : '#F97316' }} />
                {showMap ? 'Скрыть карту' : 'Маршрут на карте'}
              </button>

              {/* Embedded map (Leaflet + OpenStreetMap) */}
              {showMap && <MapView address={selectedOrder.address} isDark={isDark} />}

              {/* Accept button */}
              <button
                className="w-full h-12 rounded-xl text-sm font-semibold"
                disabled={acceptingId === selectedOrder.id}
                style={{ background: ACCENT, color: 'white', border: 'none', cursor: acceptingId === selectedOrder.id ? 'not-allowed' : 'pointer', opacity: acceptingId === selectedOrder.id ? 0.6 : 1, fontFamily: 'inherit' }}
                onClick={async () => {
                  setAcceptingId(selectedOrder.id);
                  try {
                    const res = await ordersApi.updateStatus(selectedOrder.id, 'accepted') as any;
                    const accepted = res?.data ?? { ...selectedOrder, status: 'accepted' as const };
                    setAvailableOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
                    setMyJobs((prev) => [accepted, ...prev]);
                    setSelectedOrder(null);
                    setShowMap(false);
                    
                    setActiveTab('active');
                    toast.success('Заказ принят!', { description: 'Он появился в разделе «Активные заказы»', duration: 3000 });
                  } catch (err: any) {
                    toast.error(err?.message || 'Не удалось принять заказ');
                  } finally {
                    setAcceptingId(null);
                  }
                }}
              >
                {acceptingId === selectedOrder.id ? 'Принимаем...' : 'Взять заказ'}
              </button>

              {/* Hide order button */}
              <button
                className="w-full py-2.5 text-sm"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontFamily: 'inherit' }}
                onClick={() => {
                  setHiddenOrderIds(prev => new Set([...prev, selectedOrder.id]));
                  setSelectedOrder(null);
                  setShowMap(false);
                  
                  toast.info('Заявка скрыта', { description: 'Она не будет отображаться в списке', duration: 2000 });
                }}
              >
                Больше не показывать эту заявку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="" style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '0.5rem' }} />
        </div>
      )}

      {/* Bottom nav - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40" style={{ background: c.surface, borderTop: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <button onClick={() => setActiveTab('active')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'active' ? ACCENT : c.muted }}>
              <CheckCircle className="w-6 h-6" />
              <span className="text-xs">Активные</span>
            </button>
            <button onClick={() => setActiveTab('home')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'home' ? ACCENT : c.muted }}>
              <Home className="w-6 h-6" />
              <span className="text-xs">Главная</span>
            </button>
            <button onClick={() => setActiveTab('find')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'find' ? ACCENT : c.muted }}>
              <Search className="w-6 h-6" />
              <span className="text-xs">Найти</span>
            </button>
            <button onClick={() => setActiveTab('history')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'history' ? ACCENT : c.muted }}>
              <Calendar className="w-6 h-6" />
              <span className="text-xs">История</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'profile' ? ACCENT : c.muted }}>
              <User className="w-6 h-6" />
              <span className="text-xs">Профиль</span>
            </button>
          </div>
        </div>
      </nav>

      {showHowItWorks && (
        <HowItWorksModal variant="contractor" isDark={isDark} onClose={() => setShowHowItWorks(false)} />
      )}

      {ratingOrder && (
        <RatingModal
          orderId={ratingOrder.id}
          targetName={ratingOrder.customerName}
          role="contractor"
          isDark={isDark}
          onSubmit={async (rating) => {
            try {
              await ordersApi.rate(ratingOrder.id, rating);
              toast.success('Спасибо за оценку!', { duration: 2000 });
            } catch { }
            setRatingOrder(null);
          }}
          onSkip={() => setRatingOrder(null)}
        />
      )}
    </div>
  );
}
