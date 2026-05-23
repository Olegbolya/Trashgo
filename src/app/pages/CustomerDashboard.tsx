import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api/auth';
import { Home, MapPin, User, Plus, Package, CheckCircle, Clock, RefreshCw, Edit, LogOut, Bell, CreditCard, UserPlus, HelpCircle, Wallet, ArrowRightLeft, Moon, Sun, ChevronRight, Star, Phone, MessageCircle, Menu, X, Trophy } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LevelSystem, type LevelData } from '../components/LevelSystem';
import { AchievementsPanel, type Achievement } from '../components/AchievementsPanel';
import { toast } from 'sonner';
import { getDayLabel } from '../lib/utils';
import { ordersApi } from '../../api/orders';
import { referralsApi } from '../../api/referrals';
import { achievementsApi, type AchievementItem } from '../../api/achievements';
import type { Order, ChatMessage } from '../../types/order';
import { HowItWorksModal } from '../components/HowItWorksModal';
import { RatingModal } from '../components/RatingModal';
import { OrderTimeline } from '../components/OrderTimeline';
import { OnboardingSlider } from '../components/OnboardingSlider';
import { NotificationBell } from '../components/NotificationBell';
import { FrozenBanner } from '../components/FrozenBanner';
import { useNotificationsStore } from '../../stores/notifications.store';
import { searchKazanStreets } from '../../data/kazanStreets';
import { uploadPhotoWithFallback } from '../../api/upload';
import { MapPicker } from '../components/MapPicker';
import { TelegramReminder } from '../components/TelegramReminder';

const ACCENT = '#66BB6A';

function parseAddressParts(full: string): { address: string; entrance: string; floor: string; apartment: string } {
  let remaining = full;
  let entrance = '';
  let floor = '';
  let apartment = '';
  const aptMatch = remaining.match(/,\s*кв\.?\s*(\S+)\s*$/i);
  if (aptMatch) { apartment = aptMatch[1]; remaining = remaining.slice(0, aptMatch.index!); }
  const floorMatch = remaining.match(/,\s*этаж\s*(\S+)\s*$/i);
  if (floorMatch) { floor = floorMatch[1]; remaining = remaining.slice(0, floorMatch.index!); }
  const entranceMatch = remaining.match(/,\s*подъезд\s*(\S+)\s*$/i);
  if (entranceMatch) { entrance = entranceMatch[1]; remaining = remaining.slice(0, entranceMatch.index!); }
  return { address: remaining.trim(), entrance, floor, apartment };
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, updateUser } = useAuthStore();
  const { addNotification } = useNotificationsStore();
  const VALID_TABS_C = ['home', 'calendar', 'profile', 'create'] as const;
  type CTabType = typeof VALID_TABS_C[number];
  const activeTab: CTabType = (VALID_TABS_C.includes(searchParams.get('tab') as CTabType) ? searchParams.get('tab') : 'home') as CTabType;
  const setActiveTab = (tab: CTabType) => setSearchParams({ tab });
  const [currentWeek, setCurrentWeek] = useState(0);
  const [createForm, setCreateForm] = useState({ address: '', date: '', time: '', asap: false, volume: 1, price: 50, entrance: '', floor: '', apartment: '', description: '', wasteType: 'household' as 'household' | 'construction' | 'bulky' });
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [createPhotos, setCreatePhotos] = useState<File[]>([]);
  const [preloadedPhotoUrls, setPreloadedPhotoUrls] = useState<string[]>([]);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<MyOrder | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('trashgo_onboarded'));
  const [isPublishing, setIsPublishing] = useState(false);
  const publishingRef = useRef(false);
  const isEditingRef = useRef(false);
  const prevXpRef = useRef<number | null>(null);
  const prevLevelRef = useRef<number | null>(null);
  const prevOrderStatusesRef = useRef<Record<string, string>>({});
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [orderContact, setOrderContact] = useState<{ contractorPhone: string; contractorName: string; contractorAvgRating?: number | null; contractorRatingCount?: number; contractorCompletedOrders?: number; acceptedAt?: string | null; history?: Array<{ status: string; createdAt: string; note: string }> } | null>(null);
  const [cancelSecondsLeft, setCancelSecondsLeft] = useState<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<{ id: string; contractorName: string } | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: '', district: '', email: '' });
  const [editProfileSaving, setEditProfileSaving] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [apiAchievements, setApiAchievements] = useState<AchievementItem[]>([]);
  const [tgBotUsername, setTgBotUsername] = useState<string | null>(null);

  const refreshAchievements = () => {
    achievementsApi.getMy().then(setApiAchievements).catch(() => {});
  };
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSending, setDisputeSending] = useState(false);
  const [sentDisputeOrders, setSentDisputeOrders] = useState<string[]>([]);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [sbpModal, setSbpModal] = useState<{ orderId: string; phone: string; amount: number; contractorName: string } | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);

  type MyOrder = {
    id: string; address: string; entrance: string; floor: string; apartment: string;
    date: string; time: string; asap: boolean; volume: number; price: number;
    description: string; photoUrls: string[]; completionPhotoUrls: string[];
    status: 'waiting' | 'active' | 'pending' | 'payment' | 'cancelled' | 'completed';
    responses: number; createdAt: string; ratingByCustomer: number | null;
    contractorName?: string;
    pickedUp?: boolean;
    wasteType?: 'household' | 'construction' | 'bulky';
  };

  function apiOrderToMyOrder(o: Order, inMemoryPhotos?: string[]): MyOrder {
    const status = o.status === 'new' ? 'waiting'
      : o.status === 'cancelled' ? 'cancelled'
      : o.status === 'completed' ? 'completed'
      : o.status === 'pending_confirmation' ? 'pending'
      : o.status === 'pending_payment' ? 'payment'
      : 'active';
    return {
      id: o.id,
      address: o.address,
      entrance: '',
      floor: '',
      apartment: '',
      date: o.asap ? '' : (o.scheduledAt?.slice(0, 10) ?? ''),
      time: o.asap ? '' : (o.scheduledAt?.slice(11, 16) ?? ''),
      asap: o.asap ?? false,
      volume: o.volume,
      price: o.price,
      description: o.description,
      photoUrls: inMemoryPhotos ?? o.photoUrls ?? [],
      completionPhotoUrls: o.completionPhotoUrls ?? [],
      status,
      responses: 0,
      createdAt: new Date(o.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
      ratingByCustomer: o.ratingByCustomer ?? null,
      contractorName: o.contractorName ?? '',
      pickedUp: o.status === 'in_progress' || o.status === 'pending_confirmation' || o.status === 'pending_payment',
      wasteType: (o.wasteType as 'household' | 'construction' | 'bulky') ?? 'household',
    };
  }

  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MyOrder | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);
  const [ordersHasMore, setOrdersHasMore] = useState(false);
  const [ordersLoadingMore, setOrdersLoadingMore] = useState(false);
  const [historySort, setHistorySort] = useState<'date' | 'price'>('date');
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [geocodeSuggestions, setGeocodeSuggestions] = useState<{ label: string; full: string }[]>([]);
  const [geocodeNoResults, setGeocodeNoResults] = useState(false);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshOrders = (silent = false) => {
    if (!silent) setOrdersLoading(true);
    ordersApi.list().then((res: any) => {
      const orders: Order[] = res?.data ?? [];
      const mapped = orders.map((o) => apiOrderToMyOrder(o));

      // Detect status changes and show real-time toasts (item 12)
      if (silent && Object.keys(prevOrderStatusesRef.current).length > 0) {
        mapped.forEach(order => {
          const prev = prevOrderStatusesRef.current[order.id];
          if (!prev || prev === order.status) return;
          if (prev === 'waiting' && order.status === 'active') {
            toast.success('🎉 Вашу заявку взяли!', { description: 'Исполнитель уже в пути', duration: 5000 });
            addNotification({ type: 'order_status', title: 'Заявку взяли!', message: `Исполнитель уже в пути: ${order.address}`, orderId: order.id });
          } else if ((prev === 'waiting' || prev === 'active') && order.status === 'pending') {
            toast.info('📸 Исполнитель выполнил заявку', { description: 'Нажмите «Подтвердить», чтобы завершить', duration: 8000 });
            addNotification({ type: 'order_status', title: 'Заявка выполнена', message: `Нажмите «Подтвердить» для завершения: ${order.address}`, orderId: order.id });
          } else if (order.status === 'cancelled') {
            toast.error('❌ Заявка была отменена', { duration: 4000 });
            addNotification({ type: 'order_status', title: 'Заявка отменена', message: order.address, orderId: order.id });
          } else if (prev === 'pending' && order.status === 'payment') {
            // customer triggered this themselves, no need for notification
          } else if (prev === 'payment' && order.status === 'completed') {
            toast.success('✅ Заказ завершён!', { description: `Исполнитель подтвердил получение оплаты: ${order.address}`, duration: 5000 });
            addNotification({ type: 'order_status', title: 'Заказ завершён!', message: `Исполнитель подтвердил оплату: ${order.address}`, orderId: order.id });
            setRatingOrder({ id: order.id, contractorName: orderContact?.contractorName || 'Исполнитель' });
            setTimeout(refreshAchievements, 1000);
          } else if (prev === 'pending' && order.status === 'completed') {
            // auto-completed order (legacy path)
            addNotification({ type: 'order_status', title: 'Заявка завершена!', message: `Спасибо за использование TrashGo: ${order.address}`, orderId: order.id });
          }
        });
      }
      prevOrderStatusesRef.current = Object.fromEntries(mapped.map(o => [o.id, o.status]));

      // Don't overwrite local state while user is editing an order (race condition fix)
      if (isEditingRef.current) return;
      setMyOrders(mapped);
      setOrdersHasMore(res?.meta?.hasMore ?? false);
      setSelectedOrder(prev => {
        if (!prev) return prev;
        const updated = mapped.find(o => o.id === prev.id);
        return updated ?? prev;
      });
    }).catch(() => { if (!silent) setOrdersError(true); }).finally(() => { if (!silent) setOrdersLoading(false); });
  };

  const loadMoreOrders = () => {
    if (ordersLoadingMore || !ordersHasMore) return;
    setOrdersLoadingMore(true);
    ordersApi.list({ offset: myOrders.length }).then((res: any) => {
      const more: Order[] = res?.data ?? [];
      setMyOrders(prev => [...prev, ...more.map((o: Order) => apiOrderToMyOrder(o))]);
      setOrdersHasMore(res?.meta?.hasMore ?? false);
    }).catch(() => {}).finally(() => setOrdersLoadingMore(false));
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const doConfirmOrder = async (orderId: string) => {
    setConfirmingId(orderId);
    try {
      await ordersApi.confirmOrder(orderId); // → pending_payment
      setMyOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: 'payment' as const } : o));
      setSelectedOrder(prev => prev ? { ...prev, status: 'payment' as const } : prev);
      const price = myOrders.find(o => o.id === orderId)?.price ?? selectedOrder?.price ?? 0;
      setSbpModal({
        orderId,
        phone: orderContact?.contractorPhone || '',
        amount: price,
        contractorName: orderContact?.contractorName || 'Исполнитель',
      });
    } catch (err: any) {
      toast.error(err?.message || 'Ошибка подтверждения');
    } finally {
      setConfirmingId(null);
    }
  };

  // Poll user data (XP, level, balance) and detect changes (item 11)
  useEffect(() => {
    const poll = () => authApi.me().then((u) => {
      updateUser(u);
      if (prevXpRef.current !== null && u.xp > prevXpRef.current) {
        const gained = u.xp - prevXpRef.current;
        toast.success(`+${gained} XP`, { description: 'Опыт начислен за выполненный заказ!', duration: 3000 });
      }
      if (prevLevelRef.current !== null && u.level > prevLevelRef.current) {
        toast.success(`🎉 Уровень ${u.level}!`, { description: 'Вы перешли на новый уровень', duration: 5000 });
      }
      prevXpRef.current = u.xp;
      prevLevelRef.current = u.level;
    }).catch(() => {});
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, []);

  // Refresh when switching to home tab + poll every 10s while on home tab
  useEffect(() => {
    if (activeTab === 'home') {
      refreshOrders();
      const interval = setInterval(() => refreshOrders(true), 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Fetch contractor contact when opening an active/pending order
  useEffect(() => {
    setChatOpen(false);
    setChatMessages([]);
    setChatInput('');
    setOrderContact(null);
    if (selectedOrder) {
      ordersApi.getById(selectedOrder.id).then((res: any) => {
        const d = res?.data ?? res;
        setOrderContact({
          contractorPhone: d?.contractorPhone ?? '',
          contractorName: d?.contractorName ?? '',
          contractorAvgRating: d?.contractorAvgRating ?? null,
          contractorRatingCount: d?.contractorRatingCount,
          contractorCompletedOrders: d?.contractorCompletedOrders,
          acceptedAt: d?.acceptedAt ?? null,
          history: d?.history ?? [],
        });
      }).catch(() => {});
    }
  }, [selectedOrder?.id]);

  // Live countdown for 10-minute cancel window
  useEffect(() => {
    if (!orderContact?.acceptedAt) { setCancelSecondsLeft(null); return; }
    const update = () => {
      const elapsed = (Date.now() - new Date(orderContact.acceptedAt!).getTime()) / 1000;
      setCancelSecondsLeft(Math.max(0, Math.floor(600 - elapsed)));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [orderContact?.acceptedAt]);

  // Load referral count + server achievements + bot info; refresh on achievement_unlocked SSE event
  useEffect(() => {
    referralsApi.getMyReferral().then((d) => setReferralCount(d.count)).catch(() => {});
    achievementsApi.getMy().then(setApiAchievements).catch(() => {});
    authApi.botInfo().then((d) => setTgBotUsername(d.username ?? null)).catch(() => {});
    const onUnlock = () => achievementsApi.getMy().then(setApiAchievements).catch(() => {});
    window.addEventListener('sse:achievement_unlocked', onUnlock);
    return () => window.removeEventListener('sse:achievement_unlocked', onUnlock);
  }, []);

  // Restore edit mode after page refresh (survives accidental reloads)
  useEffect(() => {
    const pendingEditId = sessionStorage.getItem('trashgo_pending_edit');
    if (!pendingEditId) return;
    isEditingRef.current = true; // prevent polling from overwriting orders list
    ordersApi.getById(pendingEditId).then((res: any) => {
      const o = res?.data ?? res;
      if (!o?.id) { sessionStorage.removeItem('trashgo_pending_edit'); isEditingRef.current = false; return; }
      const mapped = apiOrderToMyOrder(o);
      const parsed = parseAddressParts(mapped.address);
      setCreateForm({ address: parsed.address, entrance: parsed.entrance, floor: parsed.floor, apartment: parsed.apartment, date: mapped.date, time: mapped.time, asap: mapped.asap, volume: mapped.volume, price: mapped.price, description: mapped.description });
      setPreloadedPhotoUrls(mapped.photoUrls);
      setCreatePhotos([]);
      setOriginalOrder(mapped);
      setIsEditing(true);
      setMyOrders((prev) => prev.filter((o) => o.id !== pendingEditId));
      setActiveTab('create');
    }).catch(() => { sessionStorage.removeItem('trashgo_pending_edit'); isEditingRef.current = false; });
  }, []);

  // Poll chat messages while chat is open + SSE push for instant updates
  const prevChatCountsRef = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!chatOpen || !selectedOrder) return;
    const fetch = () => ordersApi.getMessages(selectedOrder.id).then((res: any) => {
      const msgs = res?.data ?? [];
      setChatMessages(msgs);
      prevChatCountsRef.current[selectedOrder.id] = msgs.length;
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }).catch(() => {});
    fetch();
    const interval = setInterval(fetch, 15000);

    const sseHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.orderId === selectedOrder.id) fetch();
    };
    window.addEventListener('sse:chat', sseHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sse:chat', sseHandler);
    };
  }, [chatOpen, selectedOrder?.id]);

  // Detect new chat messages on active orders when chat is closed
  useEffect(() => {
    const activeOrders = myOrders.filter(o => o.status === 'active' || o.status === 'pending' || o.status === 'payment');
    if (!activeOrders.length || chatOpen) return;
    const poll = () => {
      activeOrders.forEach(order => {
        ordersApi.getMessages(order.id).then((res: any) => {
          const msgs: any[] = res?.data ?? [];
          const prev = prevChatCountsRef.current[order.id] ?? msgs.length;
          if (msgs.length > prev) {
            const last = msgs[msgs.length - 1];
            addNotification({ type: 'chat', title: 'Новое сообщение', message: last?.text ? `${last.senderName}: ${last.text}` : 'Новое сообщение в чате', orderId: order.id });
          }
          prevChatCountsRef.current[order.id] = msgs.length;
        }).catch(() => {});
      });
    };
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [myOrders, chatOpen]);

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

  const XP_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5800, 8000];
  const currentXp = user?.xp ?? 0;
  const currentLevel = user?.level ?? 1;
  const nextLevelXp = XP_THRESHOLDS[Math.min(currentLevel, XP_THRESHOLDS.length - 1)] || 1000;

  const levelData: LevelData = {
    level: currentLevel,
    xp: currentXp,
    nextLevelXp,
    title: 'Новый клиент',
    rank: '🌱 Новичок',
    achievements: apiAchievements.filter(a => a.unlocked).length,
    totalOrders: myOrders.length,
  };

  // Local-only achievements not tracked in DB (level-based)
  const localOnlyAchievements: Achievement[] = [
    { id: 'level_2',  icon: '🌱', title: 'Новый уровень', description: 'Достигните 2-го уровня',  unlocked: (user?.level ?? 1) >= 2,  reward: 'Значок клиента' },
    { id: 'level_5',  icon: '🌿', title: 'Уровень 5',     description: 'Достигните 5-го уровня',  unlocked: (user?.level ?? 1) >= 5,  progress: user?.level ?? 1, maxProgress: 5,  reward: '+100 XP' },
    { id: 'level_10', icon: '🌳', title: 'Уровень 10',    description: 'Достигните 10-го уровня', unlocked: (user?.level ?? 1) >= 10, progress: user?.level ?? 1, maxProgress: 10, reward: '—' },
  ];
  const achievements: Achievement[] = [
    ...apiAchievements.map(a => ({ ...a, reward: `+${a.xp} XP` })),
    ...localOnlyAchievements,
  ];

  const stats = {
    totalOrders: myOrders.length,
    activeOrders: myOrders.filter(o => o.status === 'waiting' || o.status === 'active' || o.status === 'pending' || o.status === 'payment').length,
    completedOrders: myOrders.filter(o => o.status === 'completed').length,
    referrals: referralCount,
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
    <div className="min-h-screen lg:flex overflow-x-hidden" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 z-50" style={{ background: c.surface, borderRight: `2px solid ${ACCENT}` }}>
        {/* Profile header — clickable */}
        <div className="flex items-center" style={{ borderBottom: `1px solid ${c.border}` }}>
          <button
            onClick={() => setActiveTab('profile')}
            className="flex-1 flex items-center gap-3 p-5 text-left"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate" style={{ color: c.text }}>{user?.name || 'Профиль'}</div>
              <div className="text-xs" style={{ color: c.muted }}>Заказчик</div>
            </div>
          </button>
          <div className="pr-3">
            <NotificationBell accentColor={ACCENT} />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'home' as const, icon: Home, label: 'Главная' },
            { id: 'create' as const, icon: Plus, label: 'Создать заказ' },
            { id: 'calendar' as const, icon: Clock, label: 'История заказов' },
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
            onClick={() => setShowHowItWorks(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium"
            style={{ background: 'transparent', color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <HelpCircle className="w-5 h-5" />
            Как это работает?
          </button>
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
            <div className="flex items-center gap-1">
              <NotificationBell accentColor={ACCENT} />
              <button
                onClick={() => setActiveTab('create')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: c.text, color: c.surface, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                + Создать
              </button>
            </div>
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
            {/* Drawer header — profile, clickable */}
            <button
              onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 p-4 text-left"
              style={{ borderBottom: `1px solid ${c.border}`, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: c.text }}>{user?.name || 'Профиль'}</div>
                <div className="text-xs" style={{ color: c.muted }}>Заказчик</div>
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
              {[
                { id: 'home' as const, icon: Home, label: 'Главная' },
                { id: 'create' as const, icon: Plus, label: 'Создать заказ' },
                { id: 'calendar' as const, icon: Clock, label: 'История заказов' },
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
                onClick={() => { setShowHowItWorks(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'transparent', color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <HelpCircle className="w-5 h-5" />
                Как это работает?
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

          {/* FROZEN BANNER */}
          {user?.frozen && <FrozenBanner reason={user.freezeReason} isDark={isDark} />}

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold" style={{ color: c.text }}>{user?.name || 'Привет!'}</div>
                  {user?.avgRating != null ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5" style={{ color: '#FBBF24', fill: '#FBBF24' }} />
                      <span className="text-sm font-medium" style={{ color: c.text }}>{user.avgRating.toFixed(1)}</span>
                      <span className="text-xs" style={{ color: c.muted }}>({user.ratingCount} оценок)</span>
                    </div>
                  ) : (
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>Рейтинг появится после первой оценки</div>
                  )}
                </div>
                <div className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: `${ACCENT}18`, color: ACCENT }}>Заказчик</div>
              </div>
              <LevelSystem data={levelData} variant="customer" compact={true} />

              {/* My orders */}
              {(() => {
                const activeOrders = myOrders.filter(o => o.status === 'waiting' || o.status === 'active' || o.status === 'pending' || o.status === 'payment');
                return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold" style={{ color: c.text }}>Мои заказы</h2>
                  {activeOrders.length > 0 && (
                    <span className="text-sm px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}18`, color: ACCENT }}>{activeOrders.length}</span>
                  )}
                </div>

                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} style={{ ...card, padding: '1.25rem' }}>
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 rounded-lg w-3/4" style={{ background: c.border }} />
                          <div className="h-3 rounded-lg w-1/2" style={{ background: c.border }} />
                          <div className="h-8 rounded-lg w-full" style={{ background: c.border }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-10" style={card}>
                    <div className="text-2xl mb-2">⚠️</div>
                    <div className="font-medium mb-1" style={{ color: c.text }}>Не удалось загрузить заказы</div>
                    <div className="text-sm mb-4" style={{ color: c.muted }}>Проверьте соединение и попробуйте снова</div>
                    <button
                      className="px-4 py-2 rounded-xl text-sm font-medium"
                      style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => { setOrdersError(false); refreshOrders(); }}
                    >Повторить</button>
                  </div>
                ) : activeOrders.length === 0 ? (
                  <div className="text-center py-12" style={card}>
                    <Package className="w-12 h-12 mx-auto mb-4" style={{ color: c.border }} />
                    <div className="font-medium mb-1" style={{ color: c.text }}>Активных заказов нет</div>
                    <div className="text-sm mb-4" style={{ color: c.muted }}>Создайте заказ — исполнители увидят его сразу</div>
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
                    {activeOrders.map((order) => (
                      <div key={order.id} style={{ ...card2, borderColor: c.border, cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: c.muted }} />
                              <span className="font-semibold truncate" style={{ color: c.text }}>{order.address}</span>
                            </div>
                            <div className="text-sm mb-2 flex items-center gap-1.5 flex-wrap" style={{ color: c.muted }}>
                              {order.asap ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: ACCENT, fontWeight: 600 }}>⚡ Как можно скорее</span>
                              ) : (
                                <span>{order.date ? new Date(order.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : ''}{order.time ? ` · ${order.time}` : ''}</span>
                              )}
                              <span>· {order.volume} мешк.</span>
                              {order.wasteType && order.wasteType !== 'household' && (
                                <span>· {order.wasteType === 'construction' ? '🧱 Строительный' : '🛋️ Крупногабаритный'}</span>
                              )}
                            </div>
                            {order.status === 'waiting' ? (
                              <div className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg" style={{ background: '#F97316' + '18', color: '#F97316' }}>
                                <Clock className="w-3.5 h-3.5" />
                                <span>Ждёт исполнителя</span>
                              </div>
                            ) : order.status === 'pending' ? (
                              <div className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg" style={{ background: '#FBBF2418', color: '#92400e', border: '1px solid #fbbf2450' }}>
                                <span>⏳ Ждёт подтверждения</span>
                              </div>
                            ) : order.status === 'payment' ? (
                              <div className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
                                <span>💳 Ожидание оплаты СБП</span>
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
                );
              })()}

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
          {activeTab === 'calendar' && (() => {
            const historyOrders = [...myOrders.filter(o => o.status === 'completed' || o.status === 'cancelled')]
              .sort((a, b) => historySort === 'price' ? b.price - a.price : 0);
            return (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold" style={{ color: c.text }}>История заказов</h2>
                  <div className="flex gap-1.5">
                    {(['date', 'price'] as const).map(s => (
                      <button key={s} onClick={() => setHistorySort(s)} style={{ padding: '0.25rem 0.625rem', borderRadius: '0.5rem', border: `1px solid ${historySort === s ? ACCENT : c.border}`, background: historySort === s ? `${ACCENT}18` : 'transparent', color: historySort === s ? ACCENT : c.muted, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: historySort === s ? 600 : 400 }}>
                        {s === 'date' ? 'По дате' : 'По цене'}
                      </button>
                    ))}
                  </div>
                </div>
                {ordersLoading ? (
                  <div className="text-center py-12" style={{ ...card }}>
                    <div className="w-10 h-10 mx-auto mb-4 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${c.border} ${c.border} ${c.border} ${ACCENT}` }} />
                    <div className="font-medium mb-1" style={{ color: c.text }}>Загружаем информацию...</div>
                    <div className="text-sm" style={{ color: c.muted }}>Пожалуйста, подождите</div>
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-10" style={{ ...card }}>
                    <div className="text-2xl mb-2">⚠️</div>
                    <div className="font-medium mb-1" style={{ color: c.text }}>Не удалось загрузить историю</div>
                    <button className="mt-3 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => { setOrdersError(false); refreshOrders(); }}>Повторить</button>
                  </div>
                ) : historyOrders.length === 0 ? (
                  <div className="text-center py-12" style={{ ...card }}>
                    <Package className="w-12 h-12 mx-auto mb-4" style={{ color: c.border }} />
                    <div className="mb-4" style={{ color: c.muted }}>Завершённых заказов пока нет</div>
                    <button className="px-4 py-2 rounded-xl font-medium" style={{ background: c.text, color: c.surface, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setActiveTab('create')}>
                      + Создать заказ
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historyOrders.map((order) => (
                      <div key={order.id} style={{ ...card, padding: '1rem' }}>
                        <div className="flex items-center justify-between gap-2" style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: c.text }}>{order.address}</div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <div className="text-xs" style={{ color: c.muted }}>{order.createdAt} · {order.volume} мешк.</div>
                              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: order.status === 'completed' ? `${ACCENT}18` : '#9ca3af18', color: order.status === 'completed' ? ACCENT : '#9ca3af' }}>
                                {order.status === 'completed' ? '✓ Выполнен' : 'Отменён'}
                              </span>
                            </div>
                            {order.contractorName && (
                              <div className="text-xs mt-0.5 truncate" style={{ color: c.muted }}>👤 {order.contractorName}</div>
                            )}
                          </div>
                          <div className="text-sm font-medium flex-shrink-0" style={{ color: c.text }}>{order.price}₽</div>
                        </div>
                        {order.status === 'completed' && !order.ratingByCustomer && (
                          <button
                            className="w-full mt-2 h-8 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                            style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`, color: ACCENT, cursor: 'pointer', fontFamily: 'inherit' }}
                            onClick={() => setRatingOrder({ id: order.id, contractorName: order.contractorName || 'Исполнитель' })}
                          >
                            ⭐ Оценить исполнителя
                          </button>
                        )}
                        {order.status === 'completed' && order.ratingByCustomer && (
                          <div className="mt-2 text-xs text-center" style={{ color: c.muted }}>
                            {'★'.repeat(order.ratingByCustomer)}{'☆'.repeat(5 - order.ratingByCustomer)} Вы оценили
                          </div>
                        )}
                      </div>
                    ))}
                    {ordersHasMore && (
                      <button
                        onClick={loadMoreOrders}
                        disabled={ordersLoadingMore}
                        className="w-full py-3 rounded-xl text-sm font-medium mt-2"
                        style={{ background: c.subtle, color: c.text, border: `1px solid ${c.border}`, cursor: ordersLoadingMore ? 'not-allowed' : 'pointer', opacity: ordersLoadingMore ? 0.6 : 1, fontFamily: 'inherit' }}
                      >
                        {ordersLoadingMore ? 'Загружаем...' : '↓ Загрузить ещё'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            );
          })()}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (() => {
            const statusLabel = (user?.level ?? 1) >= 6 ? 'Мастер' : (user?.level ?? 1) >= 4 ? 'Профи' : (user?.level ?? 1) >= 2 ? 'Опытный' : 'Новичок';
            return (
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Profile Header */}
              <div style={card}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-lg font-semibold truncate" style={{ color: c.text }}>{user?.name || '—'}</h1>
                      <div className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ background: `${ACCENT}18`, color: ACCENT }}>{statusLabel}</div>
                      <div className="text-sm mt-1" style={{ color: c.muted }}>{user?.phone || '—'}</div>
                    </div>
                  </div>
                  <button
                    className="h-8 px-3 rounded-lg text-xs flex-shrink-0"
                    style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }}
                    onClick={() => { setEditProfileForm({ name: user?.name || '', district: user?.district || '', email: user?.email || '' }); setEditProfileOpen(true); }}
                  >
                    <Edit className="w-3.5 h-3.5 inline mr-1" />Изменить
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { v: <><Star className="w-3.5 h-3.5 inline mb-0.5" style={{ color: '#FBBF24', fill: '#FBBF24' }} /> {user?.avgRating != null ? user.avgRating.toFixed(1) : '—'}</>, l: user?.ratingCount ? `${user.ratingCount} оценок` : 'рейтинг' },
                    { v: stats.totalOrders, l: 'заказов' },
                    { v: achievements.filter(a => a.unlocked).length, l: 'достижений' },
                    { v: '🏆', l: 'награды' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-2.5 text-center" style={{ background: c.subtle }}>
                      <div className="text-lg font-semibold truncate" style={{ color: c.text }}>{s.v}</div>
                      <div className="text-xs truncate" style={{ color: c.muted }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <LevelSystem data={levelData} variant="customer" />
              <AchievementsPanel achievements={achievements} variant="customer" />

              {/* Address */}
              <div style={card}>
                <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Адреса вывоза</h2>
                <div className="space-y-2">
                  {/* Primary address from registration */}
                  {user?.district && (
                    <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: c.subtle }}>
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium" style={{ color: c.text }}>{user.district}</div>
                        <div className="text-xs mt-0.5" style={{ color: c.muted }}>Основной адрес</div>
                      </div>
                    </div>
                  )}
                  {/* Extra addresses */}
                  {(user?.addresses ?? []).map((addr, i) => (
                    <div key={i} className="rounded-lg p-3 flex items-start gap-2" style={{ background: c.subtle }}>
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: c.muted }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm" style={{ color: c.text }}>{addr}</div>
                      </div>
                      <button
                        onClick={async () => {
                          const updated = (user.addresses ?? []).filter((_, j) => j !== i);
                          const res = await authApi.updateProfile({ addresses: updated });
                          updateUser(res);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, padding: '2px', flexShrink: 0 }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    className="w-full py-2 text-sm rounded-lg"
                    style={{ border: `1px dashed ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }}
                    onClick={() => { setNewAddress(''); setAddAddressOpen(true); }}
                  >
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
                  { icon: Bell, label: 'Уведомления', sub: 'Настройка push и email', action: () => navigate('/notifications') },
                  { icon: CreditCard, label: 'Способ оплаты', sub: 'Карты и банковские счета', action: () => navigate('/payment') },
                  { icon: UserPlus, label: 'Пригласить соседей', sub: 'Чем больше вас — тем дешевле каждому', action: () => navigate('/invite-neighbor') },
                  { icon: Trophy, label: 'Рейтинг исполнителей', sub: 'Лучшие напарники вашего района', action: () => navigate('/leaderboard') },
                  { icon: HelpCircle, label: 'Помощь и поддержка', sub: 'FAQ и связь с поддержкой', action: () => navigate('/help') },
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

              {/* Telegram connect */}
              {tgBotUsername && (
                <div style={card}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#229ED918' }}>
                        <span style={{ fontSize: '1.1rem' }}>✈️</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: c.text }}>Telegram-уведомления</div>
                        <div className="text-xs" style={{ color: c.muted }}>
                          {user?.telegramLinked ? '✅ Подключён — уведомления приходят в бот' : 'Получайте уведомления даже без push'}
                        </div>
                      </div>
                    </div>
                    {!user?.telegramLinked ? (
                      <a
                        href={`https://t.me/${tgBotUsername}?start=${encodeURIComponent(user?.phone ?? '')}`}
                        target="_blank" rel="noreferrer"
                        style={{ flexShrink: 0, padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: '#229ED9', color: 'white', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}
                      >Подключить</a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#4CAF50', fontWeight: 600 }}>Активен</span>
                    )}
                  </div>
                </div>
              )}

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

          {/* CREATE TAB */}
          {activeTab === 'create' && (() => {
            const inputStyle = (hasError?: boolean): React.CSSProperties => ({
              width: '100%', padding: '0.625rem 0.75rem',
              border: `1px solid ${hasError ? '#ef4444' : c.border}`,
              borderRadius: '0.75rem', fontSize: '0.875rem',
              outline: 'none', background: c.input, color: c.text,
              boxSizing: 'border-box', fontFamily: 'inherit',
            });

            const handlePublish = async () => {
              if (publishingRef.current) return;
              const errors: Record<string, string> = {};
              if (!createForm.address.trim()) errors.address = 'Укажите адрес дома';
              if (!createForm.asap && !createForm.date) errors.date = 'Укажите дату';
              if (!createForm.asap && !createForm.time) errors.time = 'Укажите время';
              if (createForm.price <= 0) errors.price = 'Цена должна быть больше 0';
              setCreateErrors(errors);
              if (Object.keys(errors).length > 0) return;

              publishingRef.current = true;
              setIsPublishing(true);
              const newPhotoUrls = await Promise.all(createPhotos.map(f => uploadPhotoWithFallback(f, 'orders')));
              const photoUrls = [...preloadedPhotoUrls, ...newPhotoUrls].slice(0, 5);

              let fullAddress = createForm.address.trim();
              if (createForm.entrance) fullAddress += `, подъезд ${createForm.entrance}`;
              if (createForm.floor) fullAddress += `, этаж ${createForm.floor}`;
              if (createForm.apartment) fullAddress += `, кв. ${createForm.apartment}`;

              const scheduledAt = createForm.asap
                ? undefined
                : new Date(`${createForm.date}T${createForm.time}:00`).toISOString();

              try {
                let resultOrder: MyOrder;

                if (isEditing && originalOrder) {
                  // Update existing order
                  const res = await ordersApi.update(originalOrder.id, {
                    address: fullAddress,
                    district: user?.district || 'Казань',
                    volume: createForm.volume,
                    price: createForm.price,
                    description: createForm.description,
                    asap: createForm.asap,
                    scheduledAt,
                    photoUrls,
                  }) as any;
                  resultOrder = {
                    ...originalOrder,
                    address: createForm.address,
                    entrance: createForm.entrance,
                    floor: createForm.floor,
                    apartment: createForm.apartment,
                    date: createForm.date,
                    time: createForm.time,
                    asap: createForm.asap,
                    volume: createForm.volume,
                    price: createForm.price,
                    description: createForm.description,
                    photoUrls,
                  };
                  setMyOrders((prev) => [resultOrder, ...prev.filter(o => o.id !== originalOrder.id)]);
                  toast.success('Заказ обновлён!', { description: 'Изменения сохранены', duration: 3000 });
                } else {
                  // Create new order
                  const res = await ordersApi.create({
                    address: fullAddress,
                    district: user?.district || 'Казань',
                    volume: createForm.volume,
                    price: createForm.price,
                    description: createForm.description,
                    asap: createForm.asap,
                    scheduledAt,
                    photoUrls,
                    wasteType: createForm.wasteType,
                  }) as any;
                  const apiOrder: Order = res?.data ?? res;
                  resultOrder = {
                    id: apiOrder.id,
                    address: createForm.address,
                    entrance: createForm.entrance,
                    floor: createForm.floor,
                    apartment: createForm.apartment,
                    date: createForm.date,
                    time: createForm.time,
                    asap: createForm.asap,
                    volume: createForm.volume,
                    price: createForm.price,
                    description: createForm.description,
                    photoUrls,
                    completionPhotoUrls: [],
                    status: 'waiting',
                    responses: 0,
                    createdAt: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
                  };
                  setMyOrders((prev) => [resultOrder, ...prev]);
                  toast.success('Заказ создан!', { description: 'Исполнители уже видят ваш заказ', duration: 3000 });
                }

                setCreateForm({ address: '', date: '', time: '', asap: false, volume: 1, price: 50, entrance: '', floor: '', apartment: '', description: '' });
                setCreatePhotos([]);
                setPreloadedPhotoUrls([]);
                setCreateErrors({});
                setIsEditing(false);
                isEditingRef.current = false;
                setOriginalOrder(null);
                sessionStorage.removeItem('trashgo_pending_edit');
                setActiveTab('home');
              } catch (err: any) {
                toast.error(err?.message || (isEditing ? 'Не удалось обновить заказ' : 'Не удалось создать заказ'));
              } finally {
                publishingRef.current = false;
                setIsPublishing(false);
              }
            };

            return (
              <div className="max-w-2xl mx-auto space-y-4">
                <h1 className="text-xl font-semibold" style={{ color: c.text }}>Новый заказ</h1>

                <div style={card}>
                  <div className="space-y-4">

                    {/* Адрес дома — обязательное */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Адрес <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
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
                            setShowAddressSuggestions(true);
                          } else {
                            setShowAddressSuggestions(false);
                            setGeocodeSuggestions([]);
                          }
                          // Instant local Kazan streets (≥2 chars) + debounced Nominatim fallback
                          if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
                          setGeocodeNoResults(false);
                          if (val.length >= 2) {
                            // Show local streets immediately
                            const local = searchKazanStreets(val, 5);
                            if (local.length > 0) {
                              setGeocodeSuggestions(local.map(s => ({ label: `${s.label} (${s.district})`, full: s.label })));
                              setShowAddressSuggestions(true);
                              setGeocodeNoResults(false);
                            } else {
                              setGeocodeSuggestions([]);
                            }
                            // Nominatim as secondary (slower, but catches house numbers)
                            if (val.length >= 4) {
                              geocodeTimerRef.current = setTimeout(async () => {
                                try {
                                  const res = await fetch(`/api/v1/geocode?q=${encodeURIComponent(val + ' Казань')}&limit=5`);
                                  const data: any[] = await res.json();
                                  const suggestions = data
                                    .filter(d => d.address)
                                    .map(d => {
                                      const a = d.address;
                                      const road = a.road || a.pedestrian || a.footway || '';
                                      const house = a.house_number || '';
                                      const label = [road, house].filter(Boolean).join(', ') || d.display_name.split(',')[0];
                                      return { label, full: label };
                                    })
                                    .filter(s => s.label.length > 0);
                                  if (suggestions.length > 0) {
                                    setGeocodeSuggestions(suggestions);
                                    setShowAddressSuggestions(true);
                                    setGeocodeNoResults(false);
                                  } else if (local.length === 0) {
                                    setGeocodeNoResults(true);
                                  }
                                } catch {}
                              }, 800);
                            }
                          } else {
                            setGeocodeSuggestions([]);
                            setGeocodeNoResults(false);
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
                        style={{ ...inputStyle(!!createErrors.address), paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        title="Выбрать на карте"
                        onClick={() => setMapPickerOpen(true)}
                        style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontSize: '1.1rem', padding: '0.25rem', lineHeight: 1 }}
                      >🗺️</button>
                      {showAddressSuggestions && (addressSuggestions.length > 0 || geocodeSuggestions.length > 0) && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: c.surface, border: `1px solid ${c.border}`, borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginTop: '2px', overflow: 'hidden', maxHeight: '14rem', overflowY: 'auto' }}>
                          {/* Past/registered addresses */}
                          {addressSuggestions.map((addr, i) => {
                            const isReg = addr === user?.district;
                            return (
                              <button
                                key={`past-${i}`}
                                type="button"
                                onMouseDown={() => {
                                  const parsed = parseAddressParts(addr);
                                  setCreateForm({ ...createForm, address: parsed.address, entrance: parsed.entrance, floor: parsed.floor, apartment: parsed.apartment });
                                  setShowAddressSuggestions(false);
                                  setGeocodeSuggestions([]);
                                }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: c.text, fontFamily: 'inherit', borderBottom: `1px solid ${c.border}` }}
                                onMouseEnter={e => (e.currentTarget.style.background = c.subtle)}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <MapPin style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0, color: isReg ? ACCENT : c.muted }} />
                                  {addr}
                                </span>
                                {isReg && <span style={{ fontSize: '0.7rem', color: ACCENT, background: `${ACCENT}18`, padding: '0.1rem 0.4rem', borderRadius: '0.25rem', flexShrink: 0 }}>мой адрес</span>}
                              </button>
                            );
                          })}
                          {/* Real Kazan addresses from geocoding */}
                          {geocodeSuggestions.map((s, i) => (
                            <button
                              key={`geo-${i}`}
                              type="button"
                              onMouseDown={() => {
                                setCreateForm({ ...createForm, address: s.full });
                                setShowAddressSuggestions(false);
                                setGeocodeSuggestions([]);
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: c.text, fontFamily: 'inherit', borderBottom: i < geocodeSuggestions.length - 1 ? `1px solid ${c.border}` : 'none' }}
                              onMouseEnter={e => (e.currentTarget.style.background = c.subtle)}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                            >
                              <MapPin style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0, color: '#9ca3af' }} />
                              <span style={{ flex: 1 }}>{s.label}</span>
                              <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Казань</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {createErrors.address && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{createErrors.address}</p>}
                      {geocodeNoResults && !createErrors.address && createForm.address.length >= 4 && (
                        <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>⚠️ Адрес не найден. Проверьте написание или введите вручную.</p>
                      )}
                      {createForm.address.length > 5 && !/\d/.test(createForm.address) && (
                        <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          ⚠️ Укажите номер дома — например, «ул. Баумана, 58»
                        </div>
                      )}
                      </div>{/* closes position:relative input wrapper */}
                    </div>

                    {/* Подъезд + Этаж + Квартира — необязательные без пометки */}
                    <div className="grid grid-cols-3 gap-3">
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
                        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Этаж</label>
                        <input
                          value={createForm.floor}
                          onChange={(e) => setCreateForm({ ...createForm, floor: e.target.value })}
                          placeholder="5"
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

                    {/* Тип мусора */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: c.muted }}>Тип мусора <span style={{ color: '#ef4444' }}>*</span></label>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { value: 'household', icon: '🗑️', label: 'Бытовой' },
                          { value: 'construction', icon: '🧱', label: 'Строительный' },
                          { value: 'bulky', icon: '🛋️', label: 'Крупногабаритный' },
                        ] as const).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setCreateForm({ ...createForm, wasteType: opt.value })}
                            style={{
                              padding: '0.5rem 0.25rem',
                              borderRadius: '0.75rem',
                              border: `1.5px solid ${createForm.wasteType === opt.value ? ACCENT : c.border}`,
                              background: createForm.wasteType === opt.value ? `${ACCENT}12` : 'transparent',
                              cursor: 'pointer', fontFamily: 'inherit',
                              fontSize: '0.75rem', fontWeight: createForm.wasteType === opt.value ? 600 : 400,
                              color: createForm.wasteType === opt.value ? ACCENT : c.textSub,
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '1.25rem', marginBottom: '0.125rem' }}>{opt.icon}</div>
                            {opt.label}
                          </button>
                        ))}
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
                        <p className="text-xs mt-1.5" style={{ color: c.muted }}>💡 1 мешок ≈ 35–50 л</p>
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
                        {createErrors.price
                          ? <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{createErrors.price}</p>
                          : <p className="text-xs mt-1.5" style={{ color: c.muted }}>💡 В Казани ~50–80₽/мешок</p>
                        }
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
                          border: `2px dashed #2196F3`, borderRadius: '0.75rem',
                          cursor: 'pointer', background: '#2196F308',
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
                        <div className="text-sm font-medium" style={{ color: '#2196F3' }}>Нажмите, чтобы добавить фото</div>
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
                      disabled={isPublishing}
                      style={{ background: ACCENT, color: 'white', border: 'none', cursor: isPublishing ? 'not-allowed' : 'pointer', opacity: isPublishing ? 0.7 : 1, fontFamily: 'inherit', transition: 'opacity 0.15s' }}
                      onClick={handlePublish}
                    >
                      {isPublishing ? '⏳ Сохраняем...' : 'Сохранить изменения'}
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
                          isEditingRef.current = false;
                          setOriginalOrder(null);
                          sessionStorage.removeItem('trashgo_pending_edit');
                          setActiveTab('home');
                        }}
                      >
                        Отменить изменения
                      </button>
                      <button
                        className="flex-1 h-11 rounded-xl text-sm font-medium"
                        disabled={cancelingId === (originalOrder?.id ?? '')}
                        style={{ border: `1px solid #fca5a5`, background: 'transparent', color: '#ef4444', cursor: cancelingId === (originalOrder?.id ?? '') ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: cancelingId === (originalOrder?.id ?? '') ? 0.6 : 1 }}
                        onClick={async () => {
                          if (originalOrder) {
                            setCancelingId(originalOrder.id);
                            try { await ordersApi.updateStatus(originalOrder.id, 'cancelled'); } catch {}
                            setMyOrders((prev) => prev.filter((o) => o.id !== originalOrder.id));
                            setCancelingId(null);
                          }
                          setCreateErrors({});
                          setPreloadedPhotoUrls([]);
                          setCreatePhotos([]);
                          setIsEditing(false);
                          isEditingRef.current = false;
                          setOriginalOrder(null);
                          sessionStorage.removeItem('trashgo_pending_edit');
                          setActiveTab('home');
                          toast.success('Заказ отменён');
                        }}
                      >
                        {cancelingId === (originalOrder?.id ?? '') ? '⏳ Отмена...' : 'Отменить заказ'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      className="flex-1 h-12 rounded-xl text-sm font-medium"
                      disabled={isPublishing}
                      style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: isPublishing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: isPublishing ? 0.5 : 1 }}
                      onClick={() => { setCreateErrors({}); setPreloadedPhotoUrls([]); setCreatePhotos([]); setActiveTab('home'); }}
                    >
                      Отменить
                    </button>
                    <button
                      className="flex-1 h-12 rounded-xl text-sm font-semibold"
                      disabled={isPublishing}
                      style={{ background: ACCENT, color: 'white', border: 'none', cursor: isPublishing ? 'not-allowed' : 'pointer', opacity: isPublishing ? 0.7 : 1, fontFamily: 'inherit', transition: 'opacity 0.15s' }}
                      onClick={handlePublish}
                    >
                      {isPublishing ? '⏳ Публикуем...' : 'Опубликовать заказ'}
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
      {selectedOrder && (() => {
        const sendChatMessage = async () => {
          if (!chatInput.trim() || chatSending || !selectedOrder) return;
          const text = chatInput.trim();
          setChatInput('');
          setChatSending(true);
          try {
            await ordersApi.sendMessage(selectedOrder.id, text);
            const res = await ordersApi.getMessages(selectedOrder.id) as any;
            setChatMessages(res?.data ?? []);
            setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          } catch { setChatInput(text); }
          finally { setChatSending(false); }
        };
        return (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{ width: '100%', maxWidth: '600px', background: c.surface, borderRadius: '1.25rem 1.25rem 0 0', padding: '1.5rem', paddingBottom: '5rem', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: '2.5rem', height: '0.25rem', borderRadius: '2px', background: c.border, margin: '0 auto 1.25rem' }} />

            {/* Confirm banner — shown at the top for maximum visibility */}
            {selectedOrder.status === 'pending' && (
              <button
                disabled={confirmingId === selectedOrder.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.875rem', marginBottom: '1rem',
                  background: ACCENT, color: 'white', border: 'none', borderRadius: '0.875rem',
                  fontSize: '0.9375rem', fontWeight: 700,
                  cursor: confirmingId === selectedOrder.id ? 'not-allowed' : 'pointer',
                  opacity: confirmingId === selectedOrder.id ? 0.7 : 1,
                  fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(102,187,106,0.4)',
                  transition: 'opacity 0.15s',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirmingId) return;
                  doConfirmOrder(selectedOrder.id);
                }}
              >
                {confirmingId === selectedOrder.id ? '⏳ Подтверждаем...' : '✅ Работа выполнена — к оплате'}
              </button>
            )}

            <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
              <h2 className="text-base font-bold" style={{ color: c.text }}>Заказ #{selectedOrder.id.slice(-6)}</h2>
              <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap" style={{
                background: selectedOrder.status === 'waiting' ? '#F97316' + '18' : selectedOrder.status === 'pending' ? '#FBBF2420' : selectedOrder.status === 'payment' ? '#dcfce7' : `${ACCENT}18`,
                color: selectedOrder.status === 'waiting' ? '#F97316' : selectedOrder.status === 'pending' ? '#92400e' : selectedOrder.status === 'payment' ? '#166534' : ACCENT,
              }}>
                {selectedOrder.status === 'waiting' ? `${selectedOrder.responses} откл.` : selectedOrder.status === 'pending' ? '⏳ Подтверждение' : selectedOrder.status === 'payment' ? '💳 Ожидание оплаты' : 'Принят'}
              </span>
            </div>

            {/* Call + Chat bar — shown when contractor is assigned */}
            {(selectedOrder.status === 'active' || selectedOrder.status === 'pending' || selectedOrder.status === 'payment') && (
              <div className="flex gap-2 mb-4">
                <a
                  href={orderContact?.contractorPhone ? `tel:${orderContact.contractorPhone}` : undefined}
                  onClick={!orderContact?.contractorPhone ? (e) => { e.preventDefault(); toast.info('Контакт исполнителя загружается…'); } : undefined}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', height: '2.75rem', borderRadius: '0.75rem', border: `1.5px solid ${c.border}`, background: c.subtle, color: c.text, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}
                >
                  <Phone style={{ width: '1rem', height: '1rem' }} />
                  Позвонить
                </a>
                <button
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', height: '2.75rem', borderRadius: '0.75rem', border: `1.5px solid ${chatOpen ? ACCENT : c.border}`, background: chatOpen ? `${ACCENT}18` : c.subtle, color: chatOpen ? ACCENT : c.text, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={() => setChatOpen(v => !v)}
                >
                  <MessageCircle style={{ width: '1rem', height: '1rem' }} />
                  Чат
                </button>
              </div>
            )}

            {/* Contractor profile card — shown when order is accepted */}
            {selectedOrder.status === 'active' && orderContact?.contractorName && (
              <div style={{ background: c.subtle, borderRadius: '0.625rem', padding: '0.625rem 0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${ACCENT}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>👷</div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: c.text, marginBottom: '0.125rem' }}>{orderContact.contractorName}</div>
                  <div style={{ fontSize: '0.72rem', color: c.muted, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {orderContact.contractorAvgRating != null ? (
                      <span>⭐ {orderContact.contractorAvgRating.toFixed(1)} ({orderContact.contractorRatingCount} отз.)</span>
                    ) : <span>Нет оценок</span>}
                    {(orderContact.contractorCompletedOrders ?? 0) > 0 && (
                      <span>· {orderContact.contractorCompletedOrders} выполнено</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chat panel */}
            {chatOpen && selectedOrder && (
              <div style={{ marginBottom: '1rem', border: `1.5px solid ${c.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
                <div style={{ height: '240px', overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: c.subtle }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', color: c.muted, fontSize: '0.8rem', marginTop: '2rem' }}>
                      Начните переписку с исполнителем
                    </div>
                  )}
                  {chatMessages.map(msg => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                        {!isMine && <span style={{ fontSize: '0.7rem', color: c.muted, marginBottom: '0.15rem', paddingLeft: '0.25rem' }}>{msg.senderName}</span>}
                        <div style={{ maxWidth: '80%', padding: '0.5rem 0.75rem', borderRadius: isMine ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem', background: isMine ? ACCENT : c.surface, color: isMine ? 'white' : c.text, fontSize: '0.875rem', wordBreak: 'break-word' }}>
                          {msg.text}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: c.muted, marginTop: '0.15rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
                          {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.625rem', background: c.surface, borderTop: `1px solid ${c.border}` }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={async e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); await sendChatMessage(); } }}
                    placeholder="Написать исполнителю…"
                    style={{ flex: 1, height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.625rem', border: `1.5px solid ${c.border}`, background: c.input, color: c.text, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button
                    disabled={!chatInput.trim() || chatSending}
                    onClick={sendChatMessage}
                    style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: chatInput.trim() ? ACCENT : c.border, color: 'white', border: 'none', cursor: chatInput.trim() ? 'pointer' : 'default', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >→</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Адрес */}
              <div style={{ background: c.subtle, borderRadius: '0.75rem', padding: '0.875rem' }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: c.muted }}>Адрес</div>
                <div className="font-medium" style={{ color: c.text }}>
                  {selectedOrder.address}
                  {selectedOrder.entrance && `, подъезд ${selectedOrder.entrance}`}
                  {selectedOrder.floor && `, этаж ${selectedOrder.floor}`}
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

              {/* Фото заказчика */}
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

              {/* Фото выполнения (от исполнителя) */}
              {selectedOrder.status === 'pending' && selectedOrder.completionPhotoUrls.length > 0 && (
                <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#92400e' }}>📷 Фото выполнения от исполнителя</div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {selectedOrder.completionPhotoUrls.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxUrl(url)}
                        style={{ position: 'relative', flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        <img src={url} alt="" style={{ width: '5rem', height: '5rem', objectFit: 'cover', borderRadius: '0.625rem', border: '2px solid #FDE68A', display: 'block' }} />
                      </button>
                    ))}
                  </div>
                  <div className="text-xs" style={{ color: '#92400e' }}>Исполнитель выбросил мусор и ждёт вашего подтверждения</div>
                </div>
              )}

              {/* Создан */}
              <div className="text-xs text-center" style={{ color: c.muted }}>Создан {selectedOrder.createdAt}</div>

              {/* Timeline */}
              <OrderTimeline history={orderContact?.history as any} isDark={isDark} />
            </div>

            <div className="flex flex-col gap-2 mt-5">
              {selectedOrder.status === 'pending' ? (
                <>
                  <button
                    className="w-full py-3 rounded-xl text-sm font-semibold"
                    disabled={confirmingId === selectedOrder.id}
                    style={{ background: ACCENT, color: 'white', border: 'none', cursor: confirmingId === selectedOrder.id ? 'not-allowed' : 'pointer', opacity: confirmingId === selectedOrder.id ? 0.7 : 1, fontFamily: 'inherit', transition: 'opacity 0.15s' }}
                    onClick={() => {
                      if (confirmingId) return;
                      doConfirmOrder(selectedOrder.id);
                    }}
                  >
                    {confirmingId === selectedOrder.id ? '⏳ Подтверждаем...' : '✅ Работа выполнена — к оплате'}
                  </button>
                  {!disputeOpen ? (
                    <button
                      className="w-full py-2.5 rounded-xl text-sm font-medium"
                      style={{ border: '1px solid #fca5a5', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => setDisputeOpen(true)}
                    >
                      ⚠️ Работа не выполнена
                    </button>
                  ) : (
                    <div className="rounded-xl p-3" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
                      <div className="text-sm font-medium mb-2" style={{ color: '#ef4444' }}>Опишите проблему</div>
                      <textarea
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Что именно пошло не так?"
                        rows={3}
                        style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid #fca5a5', padding: '0.5rem', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'none', outline: 'none', background: 'white' }}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          className="flex-1 py-2 rounded-lg text-sm font-medium"
                          style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#9ca3af', cursor: 'pointer', fontFamily: 'inherit' }}
                          onClick={() => { setDisputeOpen(false); setDisputeReason(''); }}
                        >
                          Отмена
                        </button>
                        <button
                          disabled={!disputeReason.trim() || disputeSending}
                          className="flex-1 py-2 rounded-lg text-sm font-semibold"
                          style={{ background: disputeReason.trim() ? '#ef4444' : '#fca5a5', color: 'white', border: 'none', cursor: disputeReason.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
                          onClick={async () => {
                            if (!disputeReason.trim() || disputeSending) return;
                            setDisputeSending(true);
                            try {
                              await ordersApi.disputeOrder(selectedOrder.id, disputeReason);
                              toast.success('Жалоба отправлена', { description: 'Поддержка рассмотрит в течение 7 дней' });
                              setSentDisputeOrders(prev => [...prev, selectedOrder.id]);
                              setDisputeOpen(false);
                              setDisputeReason('');
                              setSelectedOrder(null);
                            } catch {
                              toast.error('Ошибка отправки жалобы');
                            } finally {
                              setDisputeSending(false);
                            }
                          }}
                        >
                          {disputeSending ? 'Отправляем...' : 'Отправить'}
                        </button>
                      </div>
                      <div className="text-xs mt-2 text-center" style={{ color: '#9ca3af' }}>Поддержка рассмотрит в течение 7 дней</div>
                    </div>
                  )}
                  {sentDisputeOrders.includes(selectedOrder.id) && !disputeOpen && (
                    <button
                      className="w-full py-2.5 rounded-xl text-sm font-medium"
                      style={{ border: '1px solid #86efac', background: 'transparent', color: '#16a34a', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => {
                        setSentDisputeOrders(prev => prev.filter(id => id !== selectedOrder.id));
                        toast.success('Рады что вопрос решился!', { description: 'Обратитесь в поддержку если нужна помощь с выплатой.' });
                        setSelectedOrder(null);
                      }}
                    >
                      ✅ Спор решён
                    </button>
                  )}
                  <button
                    className="w-full py-2.5 rounded-xl text-sm font-medium"
                    style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }}
                    onClick={() => { setSelectedOrder(null); setDisputeOpen(false); setDisputeReason(''); }}
                  >
                    Закрыть
                  </button>
                </>
              ) : selectedOrder.status === 'payment' ? (
                <>
                  <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '0.875rem', padding: '0.875rem 1rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#166534', marginBottom: '0.25rem' }}>💳 Ожидание подтверждения оплаты</div>
                    <div style={{ fontSize: '0.8rem', color: '#15803d' }}>
                      Исполнитель получит уведомление и подтвердит получение {selectedOrder.price}₽ по СБП.
                      После этого заказ завершится.
                    </div>
                  </div>
                  <button
                    className="w-full py-2.5 rounded-xl text-sm font-medium"
                    style={{ border: '1px solid #86efac', background: '#f0fdf4', color: '#166534', cursor: 'pointer', fontFamily: 'inherit' }}
                    onClick={() => setSbpModal({
                      orderId: selectedOrder.id,
                      phone: orderContact?.contractorPhone || '',
                      amount: selectedOrder.price,
                      contractorName: orderContact?.contractorName || 'Исполнитель',
                    })}
                  >
                    📋 Реквизиты для СБП
                  </button>
                  <button
                    className="w-full py-2.5 rounded-xl text-sm font-medium"
                    style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }}
                    onClick={() => setSelectedOrder(null)}
                  >
                    Закрыть
                  </button>
                </>
              ) : (
                <>
                  {selectedOrder.status === 'waiting' && (
                    <button
                      className="w-full py-3 rounded-xl text-sm font-semibold"
                      style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => {
                        setCreateForm({
                          address: selectedOrder.address,
                          entrance: selectedOrder.entrance,
                          floor: selectedOrder.floor,
                          apartment: selectedOrder.apartment,
                          date: selectedOrder.date,
                          time: selectedOrder.time,
                          asap: selectedOrder.asap,
                          volume: selectedOrder.volume,
                          price: selectedOrder.price,
                          description: selectedOrder.description,
                        });
                        setPreloadedPhotoUrls(selectedOrder.photoUrls);
                        setCreatePhotos([]);
                        setOriginalOrder(selectedOrder);
                        setIsEditing(true);
                        isEditingRef.current = true;
                        sessionStorage.setItem('trashgo_pending_edit', selectedOrder.id);
                        setMyOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
                        setSelectedOrder(null);
                        setActiveTab('create');
                      }}
                    >
                      Редактировать заказ
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                      style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => setSelectedOrder(null)}
                    >
                      Закрыть
                    </button>
                    {selectedOrder.status === 'waiting' && (
                      <button
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                        disabled={cancelingId === selectedOrder.id}
                        style={{ border: `1px solid #fca5a5`, background: 'transparent', color: '#ef4444', cursor: cancelingId === selectedOrder.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: cancelingId === selectedOrder.id ? 0.6 : 1 }}
                        onClick={async () => {
                          setCancelingId(selectedOrder.id);
                          try { await ordersApi.updateStatus(selectedOrder.id, 'cancelled'); } catch {}
                          setMyOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
                          setSelectedOrder(null);
                          setCancelingId(null);
                          toast.success('Заказ отменён');
                        }}
                      >
                        {cancelingId === selectedOrder.id ? '⏳ Отмена...' : 'Отменить заказ'}
                      </button>
                    )}
                    {selectedOrder.status === 'active' && !selectedOrder.pickedUp && cancelSecondsLeft !== null && cancelSecondsLeft > 0 && (
                      <button
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                        disabled={cancelingId === selectedOrder.id}
                        style={{ border: `1px solid #fca5a5`, background: 'transparent', color: '#ef4444', cursor: cancelingId === selectedOrder.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: cancelingId === selectedOrder.id ? 0.6 : 1 }}
                        onClick={async () => {
                          setCancelingId(selectedOrder.id);
                          try {
                            await ordersApi.updateStatus(selectedOrder.id, 'cancelled');
                            setMyOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
                            setSelectedOrder(null);
                            toast.success('Заказ отменён');
                          } catch (err: any) {
                            const code = err?.response?.data?.error?.code ?? err?.code;
                            if (code === 'CANCEL_WINDOW_EXPIRED') {
                              toast.error('Окно отмены истекло', { description: 'Исполнителя можно отменить только в первые 10 минут' });
                            } else {
                              toast.error(err?.message || 'Ошибка отмены');
                            }
                          } finally {
                            setCancelingId(null);
                          }
                        }}
                      >
                        {cancelingId === selectedOrder.id
                          ? '⏳ Отмена...'
                          : `Отменить исполнителя (${Math.floor(cancelSecondsLeft / 60)}:${String(cancelSecondsLeft % 60).padStart(2, '0')})`}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Bottom nav - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40" style={{ background: c.surface, borderTop: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <button onClick={() => setActiveTab('home')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'home' ? ACCENT : c.muted }}>
              <Home className="w-6 h-6" />
              <span className="text-xs">Главная</span>
            </button>
            <button onClick={() => setActiveTab('create')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'create' ? ACCENT : c.muted }}>
              <Plus className="w-6 h-6" />
              <span className="text-xs">Создать</span>
            </button>
            <button onClick={() => setActiveTab('calendar')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'calendar' ? ACCENT : c.muted }}>
              <Clock className="w-6 h-6" />
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
        <HowItWorksModal variant="customer" isDark={isDark} onClose={() => setShowHowItWorks(false)} />
      )}

      {ratingOrder && (
        <RatingModal
          orderId={ratingOrder.id}
          targetName={ratingOrder.contractorName}
          role="customer"
          isDark={isDark}
          onSubmit={async (rating) => {
            try {
              await ordersApi.rate(ratingOrder.id, rating);
              setMyOrders(prev => prev.map(o => o.id === ratingOrder.id ? { ...o, ratingByCustomer: rating } : o));
              authApi.me().then(u => updateUser(u)).catch(() => {});
              toast.success('Спасибо за оценку!', { duration: 2000 });
              setRatingOrder(null);
            } catch (err: any) {
              toast.error(err?.message || 'Не удалось отправить оценку. Попробуйте ещё раз.');
            }
          }}
          onSkip={() => setRatingOrder(null)}
        />
      )}

      {editProfileOpen && (
        <div className="fixed inset-0 z-[90] flex items-end lg:items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setEditProfileOpen(false)}>
          <div className="w-full lg:max-w-sm rounded-t-2xl lg:rounded-2xl" style={{ background: c.surface }} onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-base font-bold" style={{ color: c.text }}>Редактирование профиля</div>
                <button onClick={() => setEditProfileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontSize: '1.1rem' }}>✕</button>
              </div>
              <div className="mb-4">
                <div className="text-xs font-medium mb-1.5" style={{ color: c.muted }}>Имя</div>
                <input
                  value={editProfileForm.name}
                  onChange={e => setEditProfileForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ваше имя"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: `1px solid ${c.border}`, borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', background: c.input, color: c.text, boxSizing: 'border-box' as const, fontFamily: 'inherit' }}
                />
              </div>
              <div className="mb-4">
                <div className="text-xs font-medium mb-1.5" style={{ color: c.muted }}>Адрес (для автозаполнения заявок)</div>
                <input
                  value={editProfileForm.district}
                  onChange={e => setEditProfileForm(f => ({ ...f, district: e.target.value }))}
                  placeholder="ул. Баумана, 58, подъезд 1"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: `1px solid ${c.border}`, borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', background: c.input, color: c.text, boxSizing: 'border-box' as const, fontFamily: 'inherit' }}
                />
              </div>
              <div className="mb-5">
                <div className="text-xs font-medium mb-1.5" style={{ color: c.muted }}>Email</div>
                <input
                  type="email"
                  value={editProfileForm.email}
                  onChange={e => setEditProfileForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: `1px solid ${c.border}`, borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', background: c.input, color: c.text, boxSizing: 'border-box' as const, fontFamily: 'inherit' }}
                />
                <div className="text-xs mt-1" style={{ color: c.muted }}>Используется для входа в аккаунт</div>
              </div>
              <button
                disabled={editProfileSaving || !editProfileForm.name.trim()}
                onClick={async () => {
                  setEditProfileSaving(true);
                  try {
                    const patch: Record<string, any> = { name: editProfileForm.name.trim(), district: editProfileForm.district.trim() };
                    if (editProfileForm.email.trim()) patch.email = editProfileForm.email.trim();
                    const updated = await authApi.updateProfile(patch);
                    updateUser(updated);
                    setEditProfileOpen(false);
                    toast.success('Профиль обновлён');
                  } catch {
                    toast.error('Не удалось сохранить');
                  } finally {
                    setEditProfileSaving(false);
                  }
                }}
                className="w-full h-11 rounded-xl text-sm font-semibold"
                style={{ background: ACCENT, color: 'white', border: 'none', cursor: (editProfileSaving || !editProfileForm.name.trim()) ? 'not-allowed' : 'pointer', opacity: (editProfileSaving || !editProfileForm.name.trim()) ? 0.6 : 1, fontFamily: 'inherit' }}
              >
                {editProfileSaving ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add address modal */}
      {addAddressOpen && (
        <div className="fixed inset-0 z-[90] flex items-end lg:items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setAddAddressOpen(false)}>
          <div className="w-full lg:max-w-sm rounded-t-2xl lg:rounded-2xl" style={{ background: c.surface }} onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-base font-bold" style={{ color: c.text }}>Новый адрес</div>
                <button onClick={() => setAddAddressOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontSize: '1.1rem' }}>✕</button>
              </div>
              <div className="mb-5">
                <div className="text-xs font-medium mb-1.5" style={{ color: c.muted }}>Адрес вывоза мусора</div>
                <input
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  placeholder="ул. Ленина, 45, кв. 12"
                  autoFocus
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: `1px solid ${c.border}`, borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', background: c.input, color: c.text, boxSizing: 'border-box' as const, fontFamily: 'inherit' }}
                />
              </div>
              <button
                disabled={addressSaving || !newAddress.trim()}
                onClick={async () => {
                  setAddressSaving(true);
                  try {
                    const current = user?.addresses ?? [];
                    const res = await authApi.updateProfile({ addresses: [...current, newAddress.trim()] });
                    updateUser(res);
                    setAddAddressOpen(false);
                    toast.success('Адрес добавлен');
                  } catch {
                    toast.error('Не удалось добавить адрес');
                  } finally {
                    setAddressSaving(false);
                  }
                }}
                className="w-full h-11 rounded-xl text-sm font-semibold"
                style={{ background: ACCENT, color: 'white', border: 'none', cursor: (addressSaving || !newAddress.trim()) ? 'not-allowed' : 'pointer', opacity: (addressSaving || !newAddress.trim()) ? 0.6 : 1, fontFamily: 'inherit' }}
              >
                {addressSaving ? 'Сохраняем...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telegram reminder (shown once a week to users without Telegram) */}
      {!user?.telegramLinked && <TelegramReminder />}

      {/* Map Picker Modal */}
      {mapPickerOpen && (
        <MapPicker
          onSelect={(address) => setCreateForm(f => ({ ...f, address }))}
          onClose={() => setMapPickerOpen(false)}
        />
      )}

      {/* СБП Payment Modal */}
      {sbpModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 0 env(safe-area-inset-bottom,0)',
          }}
          onClick={() => setSbpModal(null)}
        >
          <div
            style={{
              width: '100%', maxWidth: '480px',
              background: '#fff', borderRadius: '1.25rem 1.25rem 0 0',
              padding: '1.5rem 1.25rem 2rem',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: '2.5rem', height: '0.25rem', background: '#e5e7eb', borderRadius: '9999px', margin: '0 auto 1.25rem' }} />

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>
                Оплатите через СБП
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                После оплаты исполнитель подтвердит получение и заказ завершится
              </div>
            </div>

            {/* Amount */}
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Сумма к оплате</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d' }}>{sbpModal.amount.toLocaleString('ru-RU')} ₽</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.125rem' }}>{sbpModal.contractorName}</div>
            </div>

            {/* Phone */}
            {sbpModal.phone ? (
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '0.875rem 1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Номер для СБП</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', letterSpacing: '0.04em' }}>{sbpModal.phone}</div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(sbpModal.phone); toast.success('Номер скопирован'); }}
                    style={{ background: ACCENT + '18', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: ACCENT, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Копировать
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '1rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#92400e' }}>
                Контакт исполнителя загружается…
              </div>
            )}

            {/* Steps */}
            <div style={{ marginBottom: '1.5rem' }}>
              {[
                'Скопируйте номер телефона выше',
                'Откройте приложение своего банка',
                'Выберите «Перевод по СБП» и введите номер',
                'Переведите сумму и вернитесь сюда',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: ACCENT, color: 'white', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>{i + 1}</div>
                  <span style={{ fontSize: '0.82rem', color: '#374151' }}>{step}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSbpModal(null)}
              style={{
                display: 'block', width: '100%', padding: '0.875rem',
                background: ACCENT, color: 'white', border: 'none',
                borderRadius: '0.875rem', fontSize: '0.9375rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                marginBottom: '0.625rem',
              }}
            >
              ✅ Понятно — жду подтверждения исполнителя
            </button>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
              Заказ завершится автоматически после того, как исполнитель подтвердит получение оплаты
            </div>
          </div>
        </div>
      )}

      {showOnboarding && (
        <OnboardingSlider
          role="customer"
          isDark={isDark}
          onFinish={() => {
            localStorage.setItem('trashgo_onboarded', '1');
            setShowOnboarding(false);
          }}
        />
      )}
    </div>
  );
}
