import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuthStore } from '../../stores/auth.store';
import { Home, MapPin, Map as MapIcon, User, Star, Briefcase, TrendingUp, Package, Clock, CheckCircle, Search, Plus, MessageCircle, Phone, Bell, CreditCard, UserPlus, HelpCircle, Edit, LogOut, Wallet, ArrowRightLeft, Moon, Sun, ChevronRight, Calendar, Menu, X, Trophy, Copy } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LevelSystem, getRankLabel, type LevelData } from '../components/LevelSystem';
import { AchievementsPanel, type Achievement } from '../components/AchievementsPanel';
import { toast } from 'sonner';
import { getDayLabel } from '../lib/utils';
import { ordersApi } from '../../api/orders';
import { authApi } from '../../api/auth';
import { achievementsApi, type AchievementItem } from '../../api/achievements';
import type { Order, ChatMessage } from '../../types/order';
import { MapView } from '../components/MapView';
import { HowItWorksModal } from '../components/HowItWorksModal';
import { RatingModal } from '../components/RatingModal';
import { OrderTimeline } from '../components/OrderTimeline';
import { OnboardingSlider } from '../components/OnboardingSlider';
import { NotificationBell } from '../components/NotificationBell';
import { useNotificationsStore } from '../../stores/notifications.store';
import { uploadPhotoWithFallback } from '../../api/upload';
import { FrozenBanner } from '../components/FrozenBanner';
import { TelegramReminder } from '../components/TelegramReminder';
import { isNative } from '../../lib/platform';
import { pickPhotosNative } from '../../hooks/useNativeCamera';
import { API_BASE_URL } from '../../api/client';
import { useNativeBackClose } from '../../hooks/useNativeBackClose';
import { OrdersMapAll } from '../components/OrdersMapAll';

const ACCENT = '#2196F3';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TRANSPORT_RADIUS_KM: Record<string, number> = {
  pedestrian: 2, scooter: 2, bicycle: 3,
  'e-bicycle': 4, moto: 8, car: 15,
};

export default function ContractorDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { addNotification } = useNotificationsStore();
  const VALID_TABS = ['active', 'home', 'find', 'map', 'history', 'profile'] as const;
  type TabType = typeof VALID_TABS[number];
  const activeTab: TabType = (VALID_TABS.includes(searchParams.get('tab') as TabType) ? searchParams.get('tab') : 'active') as TabType;
  const setActiveTab = (tab: TabType) => setSearchParams({ tab });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myJobs, setMyJobs] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [completionPhotos, setCompletionPhotos] = useState<Record<string, File[]>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [chatJobId, setChatJobId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [jobContacts, setJobContacts] = useState<Record<string, { phone: string; name: string }>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const scrollChatToBottom = () => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; };
  const [hiddenOrderIds, setHiddenOrderIds] = useState<Set<string>>(new Set());
  const [showMap, setShowMap] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Persistent filters — survive page close / week-long absence
  const _lsFilters = (() => { try { return JSON.parse(localStorage.getItem('cdb_find_filters') ?? 'null') ?? {}; } catch { return {}; } })();
  const [filterDateFrom, setFilterDateFrom] = useState<string>(_lsFilters.dateFrom ?? '');
  const [filterDateTo, setFilterDateTo] = useState<string>(_lsFilters.dateTo ?? '');
  const [filterTimeFrom, setFilterTimeFrom] = useState<string>(_lsFilters.timeFrom ?? '');
  const [filterTimeTo, setFilterTimeTo] = useState<string>(_lsFilters.timeTo ?? '');
  const [filterDistrict, setFilterDistrict] = useState<string>(_lsFilters.district ?? '');
  const [filterDistanceKm, setFilterDistanceKm] = useState<number>(_lsFilters.distanceKm ?? 50);
  const [sortOrders, setSortOrders] = useState<'newest' | 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'distance_asc'>(_lsFilters.sort ?? 'newest');
  const [contractorGps, setContractorGps] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [orderCoords, setOrderCoords] = useState<Map<string, { lat: number; lon: number } | null>>(new Map());
  const availableOrdersRef = useRef<Order[]>([]);
  const [historyDetailOrder, setHistoryDetailOrder] = useState<Order | null>(null);
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false);
  const [paymentDisputedIds, setPaymentDisputedIds] = useState<Set<string>>(new Set());
  const [blockedCustomerIds, setBlockedCustomerIds] = useState<Set<string>>(new Set());
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  const [tgBotUsername, setTgBotUsername] = useState<string | null>(null);
  const [ratingOrder, setRatingOrder] = useState<{ id: string; customerName: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('trashgo_onboarded'));
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [editInfoForm, setEditInfoForm] = useState({ transportMode: 'car' });
  const [editInfoSaving, setEditInfoSaving] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState<string | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: '', district: '', inn: '', email: '', sbpBank: '' });
  const CONTRACTOR_DISTRICTS = ['Вахитовский', 'Приволжский', 'Советский', 'Ново-Савиновский', 'Московский', 'Авиастроительный', 'Кировский'];
  const [editProfileSaving, setEditProfileSaving] = useState(false);
  const [emailChangeStep, setEmailChangeStep] = useState<'idle' | 'verify'>('idle');
  const [emailChangeCode, setEmailChangeCode] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [myJobsLoading, setMyJobsLoading] = useState(false);
  const [apiAchievements, setApiAchievements] = useState<AchievementItem[]>([]);
  const [contractorStats, setContractorStats] = useState<{ weeklyEarnings: number; monthlyEarnings: number; totalEarnings: number; completedOrders: number; avgRating: number | null; ratingCount: number } | null>(null);

  const refreshAchievements = () => {
    achievementsApi.getMy().then((list) => {
      setApiAchievements(list);
    }).catch(() => {});
  };

  useEffect(() => {
    authApi.getStats().then(setContractorStats).catch(() => {});
  }, []);

  const prevJobStatusesRef = useRef<Record<string, string>>({});
  const prevXpRef = useRef<number | null>(null);
  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeTab !== 'find' && activeTab !== 'map') return;
    const load = (initial: boolean) => {
      if (initial) setOrdersLoading(true);
      ordersApi.available().then((res: any) => {
        const orders: Order[] = res?.data ?? [];
        setAvailableOrders(orders.filter(o => o.customerId !== user?.id));
        if (initial) setOrdersError(false);
      }).catch(() => { if (initial) setOrdersError(true); }).finally(() => { if (initial) setOrdersLoading(false); });
    };
    load(true);
    const interval = setInterval(() => load(false), 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'active' && activeTab !== 'home' && activeTab !== 'history' && activeTab !== 'profile') return;
    setMyJobsLoading(true);
    const load = () => {
      ordersApi.myJobs().then((res: any) => {
        const jobs: Order[] = res?.data ?? [];
        // Detect status transitions
        jobs.forEach(job => {
          const prev = prevJobStatusesRef.current[job.id];
          if (prev === 'pending_confirmation' && job.status === 'pending_payment') {
            toast.info('💳 Заказчик подтвердил работу', {
              description: `Ожидайте перевод ${job.price}₽ по СБП — затем нажмите «Деньги получены»`,
              duration: 8000,
            });
            addNotification({ type: 'order_status', title: 'Работа подтверждена!', message: `Ожидайте оплату ${job.price}₽ по СБП: ${job.address}`, orderId: job.id });
          }
          if (prev === 'pending_payment' && job.status === 'completed') {
            toast.success('✅ Заказ завершён', {
              description: `Заказ по адресу ${job.address} завершён`,
              duration: 6000,
            });
            addNotification({ type: 'order_status', title: 'Заказ завершён!', message: `Заказ выполнен: ${job.address}`, orderId: job.id });
            if (!job.ratingByContractor) {
              ordersApi.getById(job.id).then((res: any) => {
                const d = res?.data ?? res;
                setRatingOrder({ id: job.id, customerName: d?.customerName || 'Заказчик' });
              }).catch(() => {
                setRatingOrder({ id: job.id, customerName: 'Заказчик' });
              });
            }
          }
        });
        prevJobStatusesRef.current = Object.fromEntries(jobs.map(j => [j.id, j.status]));
        setMyJobs(jobs);
      }).catch(() => {}).finally(() => setMyJobsLoading(false));
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cdb_find_filters', JSON.stringify({
        dateFrom: filterDateFrom, dateTo: filterDateTo,
        timeFrom: filterTimeFrom, timeTo: filterTimeTo,
        district: filterDistrict, distanceKm: filterDistanceKm,
        sort: sortOrders,
      }));
    } catch {}
  }, [filterDateFrom, filterDateTo, filterTimeFrom, filterTimeTo, filterDistrict, filterDistanceKm, sortOrders]);

  // Load server achievements + bot info on mount; refresh on achievement_unlocked SSE event
  useEffect(() => {
    achievementsApi.getMy().then(setApiAchievements).catch(() => {});
    authApi.botInfo().then((d) => setTgBotUsername(d.username ?? null)).catch(() => {});
    const onUnlock = () => achievementsApi.getMy().then(setApiAchievements).catch(() => {});
    window.addEventListener('sse:achievement_unlocked', onUnlock);
    return () => window.removeEventListener('sse:achievement_unlocked', onUnlock);
  }, []);

  // Refresh user data (XP, level, balance) and detect changes (item 11)
  const { updateUser } = useAuthStore();
  useEffect(() => {
    const poll = () => authApi.me().then((u) => {
      updateUser(u);
      if (prevXpRef.current !== null && u.xp > prevXpRef.current) {
        const gained = u.xp - prevXpRef.current;
        toast.success(`+${gained} XP`, { description: 'Опыт начислен!', duration: 3000 });
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

  // Poll chat messages while a chat is open + SSE push for instant updates
  const prevChatCountsRef = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!chatJobId) return;
    const fetchMessages = () => ordersApi.getMessages(chatJobId).then((res: any) => {
      const msgs = res?.data ?? [];
      setChatMessages(msgs);
      prevChatCountsRef.current[chatJobId] = msgs.length;
      setTimeout(scrollChatToBottom, 50);
    }).catch(() => {});
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);

    // SSE push: refresh instantly when a new message arrives for this order
    const sseHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.orderId === chatJobId) fetchMessages();
    };
    window.addEventListener('sse:chat', sseHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sse:chat', sseHandler);
    };
  }, [chatJobId]);

  // Detect new chat messages on active jobs when chat is closed
  useEffect(() => {
    const activeJobs = myJobs.filter(j => j.status === 'accepted' || j.status === 'in_progress' || j.status === 'pending_confirmation');
    if (!activeJobs.length || chatJobId) return;
    const poll = () => {
      activeJobs.forEach(job => {
        ordersApi.getMessages(job.id).then((res: any) => {
          const msgs: any[] = res?.data ?? [];
          const prev = prevChatCountsRef.current[job.id] ?? msgs.length;
          if (msgs.length > prev) {
            const last = msgs[msgs.length - 1];
            addNotification({ type: 'chat', title: 'Новое сообщение', message: last?.text ? `${last.senderName}: ${last.text}` : 'Новое сообщение в чате', orderId: job.id });
          }
          prevChatCountsRef.current[job.id] = msgs.length;
        }).catch(() => {});
      });
    };
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [myJobs, chatJobId]);

  // Auto-acquire GPS when contractor opens Find tab
  useEffect(() => {
    if (activeTab !== 'find' || contractorGps || gpsLoading) return;
    setGpsLoading(true);
    navigator.geolocation?.getCurrentPosition(
      pos => { setContractorGps({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setGpsLoading(false); },
      () => setGpsLoading(false),
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [activeTab]);

  // Keep a ref so the geocoding effect can read current orders without restarting on every poll
  availableOrdersRef.current = availableOrders;

  // Geocode order addresses for distance calculation (throttled to 1 req/s)
  // Runs once per tab visit; checks ref for newly added orders on each iteration
  useEffect(() => {
    if (activeTab !== 'find' && activeTab !== 'map') return;
    const geocodedIds = new Set<string>();
    let cancelled = false;
    let running = false;

    const runGeocoding = async () => {
      if (running || cancelled) return;
      running = true;
      const toGeocode = availableOrdersRef.current.filter(o => !geocodedIds.has(o.id));
      for (const order of toGeocode) {
        if (cancelled) break;
        geocodedIds.add(order.id);
        try {
          const q = /казань|kazan/i.test(order.address) ? order.address : `${order.address}, Казань, Россия`;
          const res = await fetch(`${API_BASE_URL}/geocode?q=${encodeURIComponent(q)}`);
          const data = await res.json();
          if (!cancelled) setOrderCoords(prev => {
            const next = new Map(prev);
            next.set(order.id, data[0] ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null);
            return next;
          });
        } catch {
          if (!cancelled) setOrderCoords(prev => { const next = new Map(prev); next.set(order.id, null); return next; });
        }
        await new Promise(r => setTimeout(r, 1100));
      }
      running = false;
    };

    runGeocoding();
    // Re-check for new orders every 12s (slightly after the 10s poll interval)
    const interval = setInterval(runGeocoding, 12000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [activeTab]);

  // Android back button: last-declared = highest priority (stack top = closes first)
  useNativeBackClose(showHowItWorks, () => setShowHowItWorks(false));
  useNativeBackClose(!!ratingOrder, () => setRatingOrder(null));
  useNativeBackClose(editInfoOpen, () => setEditInfoOpen(false));
  useNativeBackClose(editProfileOpen, () => setEditProfileOpen(false));
  useNativeBackClose(mobileMenuOpen, () => setMobileMenuOpen(false));
  useNativeBackClose(showFilters, () => setShowFilters(false));
  useNativeBackClose(!!selectedOrder, () => setSelectedOrder(null));
  useNativeBackClose(!!historyDetailOrder, () => setHistoryDetailOrder(null));
  useNativeBackClose(!!showPhotoSheet, () => setShowPhotoSheet(null));
  useNativeBackClose(!!lightboxUrl, () => setLightboxUrl(null)); // innermost — closes first

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

  // XP level thresholds (min total XP to reach each level)
  const XP_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5800, 8000];
  const currentXp = user?.xp ?? 0;
  const currentLevel = user?.level ?? 1;
  const nextLevelXp = XP_THRESHOLDS[Math.min(currentLevel, XP_THRESHOLDS.length - 1)] || 1000;

  // Earnings: filter completed jobs by date using updatedAt
  const completedJobs = myJobs.filter(j => j.status === 'completed');
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const earningsDay = completedJobs.filter(j => new Date((j as any).updatedAt ?? j.createdAt) >= todayStart).reduce((s, j) => s + j.price, 0);
  const earningsWeek = completedJobs.filter(j => new Date((j as any).updatedAt ?? j.createdAt) >= weekStart).reduce((s, j) => s + j.price, 0);
  const earningsMonth = completedJobs.filter(j => new Date((j as any).updatedAt ?? j.createdAt) >= monthStart).reduce((s, j) => s + j.price, 0);
  const earningsTotal = completedJobs.reduce((s, j) => s + j.price, 0);

  const completedJobsCount = completedJobs.length;

  // Local-only achievements not tracked in DB (balance/level-based)
  const localOnlyAchievements: Achievement[] = [
    { id: 'earner_1k',  icon: '💰', title: 'Первый заработок', description: 'Заработайте 1000₽ за всё время',  unlocked: (user?.balance ?? 0) >= 1000,  reward: '—' },
    { id: 'earner_10k', icon: '💵', title: 'Десятка тысяч',   description: 'Заработайте 10 000₽ за всё время', unlocked: (user?.balance ?? 0) >= 10000, progress: Math.min(user?.balance ?? 0, 10000), maxProgress: 10000, reward: '—' },
    { id: 'level_3',    icon: '🌱', title: 'Уровень 3',        description: 'Достигните 3-го уровня',           unlocked: currentLevel >= 3,             reward: '—' },
    { id: 'level_5',    icon: '🌿', title: 'Уровень 5',        description: 'Достигните 5-го уровня',           unlocked: currentLevel >= 5,             progress: currentLevel, maxProgress: 5,  reward: '+100 XP' },
    { id: 'level_10',   icon: '🌳', title: 'Уровень 10',       description: 'Достигните 10-го уровня',          unlocked: currentLevel >= 10,            progress: currentLevel, maxProgress: 10, reward: '—' },
  ];
  const achievements: Achievement[] = [
    ...apiAchievements.map(a => ({ ...a, reward: `+${a.xp} XP` })),
    ...localOnlyAchievements,
  ];

  const levelData: LevelData = {
    level: currentLevel,
    xp: currentXp,
    nextLevelXp,
    title: 'Исполнитель TrashGo',
    rank: getRankLabel(currentLevel),
    achievements: apiAchievements.filter(a => a.unlocked).length,
    totalOrders: completedJobsCount,
  };

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
              <div className="text-xs" style={{ color: c.muted }}>Исполнитель</div>
            </div>
          </button>
          <div className="pr-3">
            <NotificationBell accentColor={ACCENT} />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'active' as const, icon: CheckCircle, label: 'Активные заказы' },
            { id: 'home' as const, icon: Home, label: 'Главная' },
            { id: 'find' as const, icon: Search, label: 'Найти заказ' },
            { id: 'map' as const, icon: MapIcon, label: 'Карта заказов' },
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
      <header className="lg:hidden sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}`, paddingTop: 'env(safe-area-inset-top)' }}>
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
            <div className="flex items-center gap-1">
              <NotificationBell accentColor={ACCENT} />
              <div className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                Исполнитель
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="lg:hidden fixed top-0 left-0 h-full z-[70] flex flex-col"
            style={{ width: '85vw', maxWidth: '320px', background: c.surface, borderRight: `2px solid ${ACCENT}`, paddingTop: 'env(safe-area-inset-top)' }}
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
              {[
                { id: 'active' as const, icon: CheckCircle, label: 'Активные заказы' },
                { id: 'home' as const, icon: Home, label: 'Главная' },
                { id: 'find' as const, icon: Search, label: 'Найти заказ' },
                { id: 'map' as const, icon: MapIcon, label: 'Карта заказов' },
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

          {/* FROZEN BANNER */}
          {user?.frozen && <FrozenBanner reason={user.freezeReason ?? null} isDark={isDark} />}

          {/* ACTIVE TAB */}
          {activeTab === 'active' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <LevelSystem data={levelData} variant="contractor" compact={true} />

              {/* Active jobs */}
              {(() => {
                const activeJobs = myJobs.filter(j => j.status === 'accepted' || j.status === 'in_progress' || j.status === 'pending_confirmation' || j.status === 'pending_payment');
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
                          const statusLabel = job.status === 'accepted' ? 'Принят' : job.status === 'in_progress' ? 'В работе' : job.status === 'pending_payment' ? 'Ожидание оплаты' : 'Ждёт подтверждения';
                          const statusColor = job.status === 'accepted' ? ACCENT : job.status === 'in_progress' ? '#FBBF24' : job.status === 'pending_payment' ? '#22c55e' : '#F97316';
                          return (
                            <div key={job.id} style={{ ...card, padding: '0.875rem' }}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    {job.asap ? (
                                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ACCENT }}>⚡ Как можно скорее</span>
                                    ) : (
                                      <>
                                        <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.muted }} />
                                        <span className="text-sm font-semibold" style={{ color: c.text }}>{timeStr}</span>
                                        <span className="text-xs" style={{ color: c.muted }}>{dateStr}</span>
                                      </>
                                    )}
                                    <span className="px-1.5 py-0.5 text-xs font-medium rounded whitespace-nowrap" style={{ background: `${statusColor}20`, color: statusColor }}>{statusLabel}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.muted }} />
                                    <span className="text-sm font-medium truncate" style={{ color: c.text }}>{job.address}</span>
                                  </div>
                                  <a
                                    href={`https://yandex.ru/maps/43/kazan/?mode=routes&rtext=~${encodeURIComponent(job.address + ', Казань')}&rtt=auto`}
                                    target="_blank" rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', background: '#FC3F1D', color: 'white', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', marginBottom: '0.375rem' }}
                                  >🗺️ Открыть в Яндекс Картах</a>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(job.address + ', Казань').catch(() => {}); toast.success('Адрес скопирован', { description: 'Вставьте в Яндекс Карты или навигатор', duration: 2500 }); }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: `1px solid ${c.border}`, background: c.subtle, color: ACCENT, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%', marginBottom: '0.375rem' }}
                                  ><Copy className="w-3.5 h-3.5" /> Скопировать адрес</button>
                                  {job.description && (
                                    <div className="text-xs" style={{ color: c.muted }}>{job.description}</div>
                                  )}
                                </div>
                                <div className="text-right ml-3">
                                  <div className="text-xl font-bold" style={{ color: ACCENT }}>{job.price}₽</div>
                                  <div className="text-xs" style={{ color: c.muted }}>{job.volume} мешк.{(job as any).wasteType === 'construction' ? ' · 🧱' : (job as any).wasteType === 'bulky' ? ' · 🛋️' : ''}</div>
                                </div>
                              </div>
                              {/* Customer profile card — shown when job is accepted */}
                              {job.status === 'accepted' && job.customerName && (
                                <div style={{ background: c.subtle, borderRadius: '0.625rem', padding: '0.5rem 0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${ACCENT}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>👤</div>
                                  <div className="flex-1 min-w-0">
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: c.text }}>{job.customerName}</div>
                                    <div style={{ fontSize: '0.7rem', color: c.muted, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      {job.customerAvgRating != null ? (
                                        <span>⭐ {job.customerAvgRating.toFixed(1)} ({job.customerRatingCount} отз.)</span>
                                      ) : <span>Нет оценок</span>}
                                      {(job.customerCompletedOrders ?? 0) > 0 && (
                                        <span>· {job.customerCompletedOrders} заказов</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="flex gap-2 flex-col">
                                {job.status === 'accepted' && (
                                  <button
                                    className="w-full text-xs font-semibold h-9 rounded-lg"
                                    disabled={startingId === job.id}
                                    style={{ background: ACCENT, color: 'white', border: 'none', cursor: startingId === job.id ? 'not-allowed' : 'pointer', opacity: startingId === job.id ? 0.6 : 1, fontFamily: 'inherit' }}
                                    onClick={async () => {
                                      setStartingId(job.id);
                                      try {
                                        await ordersApi.updateStatus(job.id, 'in_progress');
                                        setMyJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'in_progress' as const } : j));
                                        toast.success('Отмечено: мусор получен, идёте к баку');
                                      } catch (e: any) { toast.error(e?.message || 'Ошибка'); }
                                      finally { setStartingId(null); }
                                    }}
                                  >
                                    {startingId === job.id ? 'Отмечаем...' : '✅ Получено — иду к баку'}
                                  </button>
                                )}
                                {job.status === 'accepted' && (
                                  <button
                                    className="w-full text-xs font-semibold h-9 rounded-lg"
                                    style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit' }}
                                    onClick={async () => {
                                      if (!confirm('Отказаться от заказа? Это повлияет на ваш рейтинг.')) return;
                                      try {
                                        await ordersApi.updateStatus(job.id, 'cancelled');
                                        setMyJobs(prev => prev.filter(j => j.id !== job.id));
                                        toast.info('Вы отказались от заказа');
                                      } catch (e: any) { toast.error(e?.message || 'Ошибка'); }
                                    }}
                                  >
                                    ✖ Отказаться от заказа
                                  </button>
                                )}
                                {job.status === 'in_progress' && (
                                  <div className="space-y-2">
                                    <div className="text-xs font-medium" style={{ color: c.muted }}>Сфотографируйте мусор у бака:</div>
                                    {isNative() ? (
                                      <button
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', border: `1.5px solid #2196F3`, borderRadius: '0.625rem', cursor: 'pointer', background: '#2196F310', width: '100%', fontFamily: 'inherit' }}
                                        onClick={() => setShowPhotoSheet(job.id)}
                                      >
                                        <span style={{ fontSize: '1.1rem' }}>📷</span>
                                        <span className="text-xs font-medium" style={{ color: (completionPhotos[job.id]?.length ?? 0) > 0 ? c.textSub : '#2196F3' }}>
                                          {(completionPhotos[job.id]?.length ?? 0) > 0
                                            ? `${completionPhotos[job.id].length} фото выбрано`
                                            : 'Добавить фото (до 3)'}
                                        </span>
                                      </button>
                                    ) : (
                                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', border: `1.5px solid #2196F3`, borderRadius: '0.625rem', cursor: 'pointer', background: '#2196F310' }}>
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
                                        <span className="text-xs font-medium" style={{ color: (completionPhotos[job.id]?.length ?? 0) > 0 ? c.textSub : '#2196F3' }}>
                                          {(completionPhotos[job.id]?.length ?? 0) > 0
                                            ? `${completionPhotos[job.id].length} фото выбрано`
                                            : 'Добавить фото (до 3)'}
                                        </span>
                                      </label>
                                    )}
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
                                          const urls = await Promise.all(photos.map(f => uploadPhotoWithFallback(f, 'completions')));
                                          await ordersApi.completeOrder(job.id, urls);
                                          setMyJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'pending_confirmation' as const } : j));
                                          setCompletionPhotos(prev => { const n = { ...prev }; delete n[job.id]; return n; });
                                          toast.success('Выполнение отправлено!', { description: 'Ждите подтверждения от заказчика', duration: 3000 });
                                          setTimeout(refreshAchievements, 1000);
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
                                {job.status === 'pending_payment' && (
                                  <div className="space-y-2">
                                    <div className="w-full rounded-lg px-3 py-2 text-xs" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
                                      💳 Заказчик подтвердил работу — ожидайте перевод <strong>{job.price}₽</strong> по СБП
                                    </div>
                                    <button
                                      className="w-full text-xs font-semibold h-9 rounded-lg"
                                      disabled={confirmingPaymentId === job.id}
                                      style={{ background: '#22c55e', color: 'white', border: 'none', cursor: confirmingPaymentId === job.id ? 'not-allowed' : 'pointer', opacity: confirmingPaymentId === job.id ? 0.6 : 1, fontFamily: 'inherit' }}
                                      onClick={async () => {
                                        setConfirmingPaymentId(job.id);
                                        try {
                                          await ordersApi.confirmPayment(job.id);
                                          setMyJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed' as const } : j));
                                          toast.success('✅ Оплата подтверждена!', { description: `+${job.price}₽ начислено на баланс`, duration: 5000 });
                                          setTimeout(refreshAchievements, 1000);
                                        } catch (e: any) { toast.error(e?.message || 'Ошибка'); }
                                        finally { setConfirmingPaymentId(null); }
                                      }}
                                    >
                                      {confirmingPaymentId === job.id ? 'Подтверждаем...' : '💰 Деньги получены'}
                                    </button>
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
                                    <div ref={chatScrollRef} style={{ height: '200px', overflowY: 'auto', padding: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: c.subtle }}>
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
                                              setTimeout(scrollChatToBottom, 50);
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
                                            setTimeout(scrollChatToBottom, 50);
                                          } catch { setChatInput(text); } finally { setChatSending(false); }
                                        }}
                                        style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: chatInput.trim() ? ACCENT : c.border, color: 'white', border: 'none', cursor: chatInput.trim() ? 'pointer' : 'default', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
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
                <div className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: `${ACCENT}18`, color: ACCENT }}>Исполнитель</div>
              </div>
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
                return myJobsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ ...card, padding: '1rem' }}>
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 rounded-lg w-2/3" style={{ background: c.border }} />
                          <div className="h-3 rounded-lg w-1/2" style={{ background: c.border }} />
                          <div className="h-3 rounded-lg w-1/4" style={{ background: c.border }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : allDone.length === 0 ? (
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
                        <div key={job.id} style={{ ...card, padding: '0.875rem', cursor: 'pointer' }}
                          onClick={async () => {
                            setHistoryDetailLoading(true);
                            setHistoryDetailOrder(job);
                            try {
                              const res = await ordersApi.getById(job.id) as any;
                              const detail = res?.data ?? res;
                              if (detail?.id) setHistoryDetailOrder(detail);
                            } catch {}
                            setHistoryDetailLoading(false);
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {isDone
                                  ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#4CAF50' }} />
                                  : <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0 }}>✕</span>
                                }
                                <span className="text-sm font-medium truncate" style={{ color: c.text }}>{job.address}</span>
                              </div>
                              <div className="text-xs" style={{ color: c.muted }}>
                                {job.asap ? '⚡ ASAP' : `${dateStr} · ${timeStr}`} · {job.volume} мешк.{(job as any).wasteType === 'construction' ? ' · 🧱 Строит.' : (job as any).wasteType === 'bulky' ? ' · 🛋️ Крупногаб.' : ''}
                              </div>
                              {(job as any).customerName && (
                                <div className="text-xs mt-0.5" style={{ color: c.muted }}>👤 {(job as any).customerName}</div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="text-base font-bold" style={{ color: isDone ? '#4CAF50' : '#9ca3af' }}>
                                {isDone ? `+${job.price}₽` : 'Отменён'}
                              </div>
                              <ChevronRight className="w-4 h-4" style={{ color: c.muted }} />
                            </div>
                          </div>
                          {isDone && !(job as any).ratingByContractor && (
                            <button
                              className="w-full mt-2 h-8 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                              style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`, color: ACCENT, cursor: 'pointer', fontFamily: 'inherit' }}
                              onClick={(e) => { e.stopPropagation(); setRatingOrder({ id: job.id, customerName: 'Заказчик' }); }}
                            >
                              ⭐ Оценить заказчика
                            </button>
                          )}
                          {isDone && (job as any).ratingByContractor && (
                            <div className="mt-2 text-xs text-center" style={{ color: c.muted }}>
                              {'★'.repeat((job as any).ratingByContractor)}{'☆'.repeat(5 - (job as any).ratingByContractor)} Вы оценили
                            </div>
                          )}
                          {isDone && !paymentDisputedIds.has(job.id) && (
                            <button
                              className="w-full mt-1.5 h-8 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                              style={{ background: '#ef444412', border: '1px solid #ef444430', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit' }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm('Вы уверены, что не получили оплату? Аккаунт заказчика будет заморожен до выяснения.')) return;
                                try {
                                  await ordersApi.paymentDispute(job.id);
                                  setPaymentDisputedIds(prev => new Set([...prev, job.id]));
                                  toast.success('Спор зарегистрирован. Аккаунт заказчика заморожен.');
                                } catch (err: any) {
                                  toast.error(err?.message || 'Не удалось зарегистрировать спор');
                                }
                              }}
                            >
                              ⚠️ Оплату не получил
                            </button>
                          )}
                          {isDone && paymentDisputedIds.has(job.id) && (
                            <div className="mt-1.5 text-xs text-center py-1.5 rounded-lg" style={{ background: '#ef444412', color: '#ef4444' }}>
                              Спор зарегистрирован — ожидайте решения
                            </div>
                          )}
                          {isDone && paymentDisputedIds.has(job.id) && !blockedCustomerIds.has(job.id) && (
                            <button
                              className="w-full mt-1.5 h-8 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                              style={{ background: '#7f1d1d20', border: '1px solid #7f1d1d50', color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit' }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm('Заблокировать этого заказчика и его адрес? Он не сможет создавать заказы с этого адреса.')) return;
                                try {
                                  await ordersApi.blockCustomer(job.id);
                                  setBlockedCustomerIds(prev => new Set([...prev, job.id]));
                                  toast.success('Адрес и аккаунт заказчика заблокированы.');
                                } catch (err: any) {
                                  toast.error(err?.message ?? 'Ошибка блокировки');
                                }
                              }}
                            >
                              ⛔ Заблокировать адрес за неоплату
                            </button>
                          )}
                          {isDone && blockedCustomerIds.has(job.id) && (
                            <div className="mt-1.5 text-xs text-center py-1.5 rounded-lg" style={{ background: '#7f1d1d20', color: '#dc2626' }}>
                              Адрес заблокирован
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

          {/* History detail modal */}
          {historyDetailOrder && (
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setHistoryDetailOrder(null)}>
              <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 space-y-4" style={{ background: c.surface, maxHeight: '90vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold" style={{ color: c.text }}>Детали заказа</h2>
                  <button onClick={() => setHistoryDetailOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {historyDetailLoading && <div className="text-sm text-center py-4" style={{ color: c.muted }}>Загружаем...</div>}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {historyDetailOrder.status === 'completed'
                      ? <CheckCircle className="w-5 h-5" style={{ color: '#4CAF50' }} />
                      : <span style={{ color: '#9ca3af' }}>✕</span>}
                    <span className="font-medium" style={{ color: c.text }}>
                      {historyDetailOrder.status === 'completed' ? 'Выполнен' : 'Отменён'}
                    </span>
                  </div>
                  <div className="rounded-xl p-3 space-y-2" style={{ background: c.subtle }}>
                    <div className="flex gap-2 text-sm"><span style={{ color: c.muted }}>Адрес:</span><span style={{ color: c.text }}>{historyDetailOrder.address}</span></div>
                    <div className="flex gap-2 text-sm"><span style={{ color: c.muted }}>Район:</span><span style={{ color: c.text }}>{historyDetailOrder.district}</span></div>
                    <div className="flex gap-2 text-sm"><span style={{ color: c.muted }}>Объём:</span><span style={{ color: c.text }}>{historyDetailOrder.volume} мешков</span></div>
                    <div className="flex gap-2 text-sm"><span style={{ color: c.muted }}>Цена:</span><span className="font-semibold" style={{ color: '#4CAF50' }}>{historyDetailOrder.price}₽</span></div>
                    {historyDetailOrder.scheduledAt && (
                      <div className="flex gap-2 text-sm"><span style={{ color: c.muted }}>Время:</span><span style={{ color: c.text }}>
                        {new Date(historyDetailOrder.scheduledAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span></div>
                    )}
                    {historyDetailOrder.asap && <div className="text-sm font-medium" style={{ color: ACCENT }}>⚡ ASAP заказ</div>}
                    {(historyDetailOrder as any).customerName && (
                      <div className="flex gap-2 text-sm"><span style={{ color: c.muted }}>Заказчик:</span><span style={{ color: c.text }}>{(historyDetailOrder as any).customerName}</span></div>
                    )}
                    {historyDetailOrder.description && (
                      <div className="flex gap-2 text-sm"><span style={{ color: c.muted }}>Описание:</span><span style={{ color: c.text }}>{historyDetailOrder.description}</span></div>
                    )}
                  </div>
                  <OrderTimeline history={(historyDetailOrder as any).history} isDark={isDark} />

                  {historyDetailOrder.status === 'completed' && !(historyDetailOrder as any).ratingByContractor && (
                    <button
                      className="w-full h-10 rounded-xl text-sm font-medium"
                      style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, color: ACCENT, cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => { setHistoryDetailOrder(null); setRatingOrder({ id: historyDetailOrder.id, customerName: (historyDetailOrder as any).customerName || 'Заказчик' }); }}
                    >⭐ Оценить заказчика</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (() => {
            const statusLabel = getRankLabel(currentLevel);
            const balance = user?.balance ?? 0;
            return (
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Profile Header + Level — merged */}
              {(() => {
                const prevLevelXp = XP_THRESHOLDS[Math.max(0, currentLevel - 1)] ?? 0;
                const levelRange = nextLevelXp - prevLevelXp;
                const xpProgress = levelRange > 0 ? Math.min(100, ((currentXp - prevLevelXp) / levelRange) * 100) : 100;
                return (
                  <div style={card}>
                    {/* Top row: avatar + info + edit */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl" style={{ background: `${ACCENT}20`, color: ACCENT }}>
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border-2" style={{ background: ACCENT, color: '#fff', borderColor: c.surface }}>
                            {currentLevel}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h1 className="text-lg font-semibold truncate" style={{ color: c.text }}>{user?.name || '—'}</h1>
                          <div className="text-xs font-medium" style={{ color: ACCENT }}>{statusLabel}</div>
                          <div className="text-sm mt-0.5" style={{ color: c.muted }}>{user?.phone || '—'}</div>
                        </div>
                      </div>
                      <button
                        className="h-8 px-3 rounded-lg text-xs flex-shrink-0"
                        style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={() => { setEditProfileForm({ name: user?.name || '', district: user?.district || '', inn: user?.inn || '', email: user?.email || '', sbpBank: (user as any)?.sbpBank || '' }); setEditProfileOpen(true); }}
                      >
                        <Edit className="w-3.5 h-3.5 inline mr-1" />Изменить
                      </button>
                    </div>

                    {/* XP bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5" style={{ color: c.muted }}>
                        <span>Опыт</span>
                        <span>{currentXp} / {nextLevelXp} XP</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 9999, overflow: 'hidden', background: isDark ? '#374151' : '#e5e7eb' }}>
                        <div style={{ height: '100%', width: `${xpProgress}%`, borderRadius: 9999, background: ACCENT, transition: 'width 0.6s ease' }} />
                      </div>
                      <div className="text-xs mt-1 text-right" style={{ color: c.muted }}>{Math.max(0, nextLevelXp - currentXp)} XP до следующего уровня</div>
                    </div>

                    {/* Stats — single row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { v: <><Star className="w-3.5 h-3.5 inline mb-0.5" style={{ color: '#FBBF24', fill: '#FBBF24' }} /> {user?.avgRating != null ? user.avgRating.toFixed(1) : '—'}</>, l: user?.ratingCount ? `${user.ratingCount} оценок` : 'рейтинг' },
                        { v: completedJobsCount, l: 'заказов' },
                        { v: achievements.filter(a => a.unlocked).length, l: 'достижений' },
                        { v: Math.floor(currentLevel / 10), l: 'наград' },
                      ].map((s, i) => (
                        <div key={i} className="rounded-xl p-2.5 text-center" style={{ background: c.subtle }}>
                          <div className="text-lg font-semibold truncate" style={{ color: c.text }}>{s.v}</div>
                          <div className="text-xs truncate" style={{ color: c.muted }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Contact info */}
              <div style={card}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: c.text }}>Контактные данные</h2>
                <div className="space-y-2">
                  {user?.email && (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: c.subtle }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>📧</span>
                        <div className="min-w-0">
                          <div className="text-xs mb-0.5" style={{ color: c.muted }}>Email</div>
                          <div className="text-sm font-medium truncate" style={{ color: c.text }}>{user.email}</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#22c55e18', color: '#16a34a' }}>✓ Подтверждено</span>
                    </div>
                  )}
                  {user?.phone && (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: c.subtle }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>📱</span>
                        <div className="min-w-0">
                          <div className="text-xs mb-0.5" style={{ color: c.muted }}>Телефон</div>
                          <div className="text-sm font-medium truncate" style={{ color: c.text }}>{user.phone}</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#22c55e18', color: '#16a34a' }}>✓ Подтверждено</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: c.subtle }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>🏦</span>
                      <div className="min-w-0">
                        <div className="text-xs mb-0.5" style={{ color: c.muted }}>Банк СБП для оплаты</div>
                        <div className="text-sm font-medium truncate" style={{ color: (user as any)?.sbpBank ? c.text : c.muted }}>
                          {(user as any)?.sbpBank || 'Не указан — укажите в редактировании'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div style={card}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" style={{ color: c.muted }} />
                    <h2 className="text-sm font-semibold" style={{ color: c.text }}>Заработок за всё время</h2>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl p-3" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <div className="text-xs mb-1" style={{ color: c.muted }}>За день</div>
                    <div className="text-xl font-bold" style={{ color: '#4CAF50' }}>{earningsDay.toLocaleString('ru-RU')}₽</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <div className="text-xs mb-1" style={{ color: c.muted }}>За неделю</div>
                    <div className="text-xl font-bold" style={{ color: '#4CAF50' }}>{(contractorStats?.weeklyEarnings ?? earningsWeek).toLocaleString('ru-RU')}₽</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <div className="text-xs mb-1" style={{ color: c.muted }}>За месяц</div>
                    <div className="text-xl font-bold" style={{ color: '#4CAF50' }}>{(contractorStats?.monthlyEarnings ?? earningsMonth).toLocaleString('ru-RU')}₽</div>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-xl flex items-center justify-between" style={{ background: '#4CAF5012', border: '1px solid #4CAF5020' }}>
                  <div className="text-sm" style={{ color: c.text }}>Заработок за все время</div>
                  <div className="text-xl font-bold" style={{ color: '#4CAF50' }}>{(contractorStats?.totalEarnings ?? earningsTotal).toLocaleString('ru-RU')}₽</div>
                </div>
              </div>

              <AchievementsPanel achievements={achievements} variant="contractor" />

              {/* Work Info */}
              {(() => {
                const transportLabel: Record<string, string> = {
                  pedestrian: '🚶 Пеший', scooter: '🛴 Самокат', bicycle: '🚲 Велосипед',
                  'e-bicycle': '⚡🚲 Электровелосипед', moto: '🏍️ Мото', car: '🚗 Автомобиль',
                };
                const radiusMap = TRANSPORT_RADIUS_KM;
                const tMode = user?.transportMode || 'car';
                return (
                  <div style={card}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-semibold" style={{ color: c.text }}>Дополнительная информация</h2>
                      <button
                        onClick={() => { setEditInfoForm({ transportMode: tMode }); setEditInfoOpen(true); }}
                        style={{ background: c.subtle, border: `1px solid ${c.border}`, color: c.textSub, borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        <Edit className="w-3 h-3 inline mr-1" />Изменить
                      </button>
                    </div>
                    <div className="rounded-lg p-3 mb-2" style={{ background: c.subtle }}>
                      <div className="text-xs mb-1" style={{ color: c.muted }}>Способ передвижения</div>
                      <div className="text-sm font-medium" style={{ color: c.text }}>{transportLabel[tMode] || '🚗 Автомобиль'}</div>
                      <div style={{ fontSize: '0.72rem', color: c.muted, marginTop: '0.25rem' }}>Радиус видимости заказов: {radiusMap[tMode] ?? 15} км</div>
                    </div>
                    {/* Availability toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: (user?.isAvailable ?? true) ? '#d1fae520' : `${c.subtle}`, border: `1px solid ${(user?.isAvailable ?? true) ? '#6ee7b7' : c.border}` }}>
                      <div>
                        <div className="text-sm font-medium" style={{ color: c.text }}>
                          {(user?.isAvailable ?? true) ? '🟢 Принимаю заказы' : '🔴 Недоступен'}
                        </div>
                        <div className="text-xs" style={{ color: c.muted }}>
                          {(user?.isAvailable ?? true) ? 'Получаю уведомления о новых заказах' : 'Уведомления о новых заказах отключены'}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const newVal = !(user?.isAvailable ?? true);
                          updateUser({ isAvailable: newVal });
                          try {
                            const updated = await authApi.updateProfile({ isAvailable: newVal });
                            updateUser({ isAvailable: (updated as any).isAvailable ?? newVal });
                          } catch {
                            updateUser({ isAvailable: !newVal });
                            toast.error('Не удалось сохранить');
                          }
                        }}
                        style={{ width: '2.75rem', height: '1.5rem', borderRadius: '9999px', border: 'none', background: (user?.isAvailable ?? true) ? '#4CAF50' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}
                      >
                        <span style={{ position: 'absolute', top: '0.125rem', left: (user?.isAvailable ?? true) ? 'calc(100% - 1.375rem)' : '0.125rem', width: '1.25rem', height: '1.25rem', borderRadius: '9999px', background: 'white', transition: 'left 0.2s ease', display: 'block' }} />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Menu items */}
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {[
                  { icon: Bell, label: 'Уведомления', sub: 'Настройка push и email', action: () => navigate('/notifications') },
                  { icon: CreditCard, label: 'Выплаты', sub: 'Баланс и вывод средств', action: () => navigate('/payment') },
                  { icon: Trophy, label: 'Рейтинг исполнителей', sub: 'Топ по заказам и оценкам', action: () => navigate('/leaderboard') },
                  { icon: UserPlus, label: 'Реферальная программа', sub: 'Приглашайте напарников — получайте бонусы', action: () => navigate('/contractor-referral') },
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
                          {user?.telegramLinked ? '✅ Подключён — уведомления в боте' : 'Новые заказы прямо в Telegram'}
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

          {/* MAP TAB */}
          {activeTab === 'map' && (
            <div className="max-w-4xl mx-auto" style={{ height: 'calc(100vh - 10rem)' }}>
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold" style={{ color: c.text }}>Карта заказов</h1>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                  Казань
                </span>
              </div>
              <div style={{ height: 'calc(100% - 2.5rem)' }}>
                <OrdersMapAll
                  orders={availableOrders.filter(o => o.customerId !== user?.id)}
                  orderCoords={orderCoords}
                  isDark={isDark}
                  accentColor={ACCENT}
                  onOrderClick={(orderId) => {
                    const order = availableOrders.find(o => o.id === orderId);
                    if (order) setSelectedOrder(order);
                  }}
                />
              </div>
            </div>
          )}

          {/* FIND ORDERS TAB */}
          {activeTab === 'find' && (() => {
            const hasActiveFilters = !!(filterDateFrom || filterDateTo || filterTimeFrom || filterTimeTo || filterDistrict || (contractorGps && filterDistanceKm < 50));
            const visibleOrders = availableOrders.filter(o => {
              if (hiddenOrderIds.has(o.id)) return false;
              if (filterDistrict && !o.district.toLowerCase().includes(filterDistrict.toLowerCase())) return false;
              if (contractorGps && filterDistanceKm < 50) {
                const coords = orderCoords.get(o.id);
                // undefined = not yet geocoded → keep (loading); null = geocoding failed → keep; object → apply distance filter
                if (coords !== undefined && coords !== null && haversineKm(contractorGps.lat, contractorGps.lon, coords.lat, coords.lon) > filterDistanceKm) return false;
              }
              if (o.asap) return true;
              const dt = o.scheduledAt ? new Date(o.scheduledAt) : null;
              if (dt) {
                const dateStr = dt.toISOString().slice(0, 10);
                if (filterDateFrom && dateStr < filterDateFrom) return false;
                if (filterDateTo && dateStr > filterDateTo) return false;
                const timeStr = dt.toTimeString().slice(0, 5);
                if (filterTimeFrom && timeStr < filterTimeFrom) return false;
                if (filterTimeTo && timeStr > filterTimeTo) return false;
              }
              return true;
            }).sort((a, b) => {
              if (sortOrders === 'distance_asc' && contractorGps) {
                const ca = orderCoords.get(a.id);
                const cb = orderCoords.get(b.id);
                const da = (ca && ca.lat != null) ? haversineKm(contractorGps.lat, contractorGps.lon, ca.lat, ca.lon) : Infinity;
                const db2 = (cb && cb.lat != null) ? haversineKm(contractorGps.lat, contractorGps.lon, cb.lat, cb.lon) : Infinity;
                if (!isFinite(da) && !isFinite(db2)) return 0;
                if (!isFinite(da)) return 1;
                if (!isFinite(db2)) return -1;
                return da - db2;
              }
              if (sortOrders === 'price_asc') return a.price - b.price;
              if (sortOrders === 'price_desc') return b.price - a.price;
              if (sortOrders === 'date_asc') {
                const da = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
                const db2 = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
                return da - db2;
              }
              if (sortOrders === 'date_desc') {
                const da = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
                const db2 = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
                return db2 - da;
              }
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            return (
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold" style={{ color: c.text }}>Заказы рядом</h1>
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ background: hasActiveFilters ? `${ACCENT}18` : c.subtle, color: hasActiveFilters ? ACCENT : c.textSub, border: `1px solid ${hasActiveFilters ? ACCENT + '40' : c.border}`, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <span>⚙</span> Фильтры{hasActiveFilters ? ' ●' : ''}
                </button>
              </div>

              {showFilters && (
                <div style={{ ...card, padding: '1rem' }} className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: c.text }}>Фильтры поиска</span>
                    {hasActiveFilters && (
                      <button
                        onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); setFilterTimeFrom(''); setFilterTimeTo(''); setFilterDistrict(''); setFilterDistanceKm(50); setSortOrders('newest'); try { localStorage.removeItem('cdb_find_filters'); } catch {} }}
                        className="text-xs"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontFamily: 'inherit' }}
                      >Сбросить</button>
                    )}
                  </div>
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: c.muted }}>Дата</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs mb-1" style={{ color: c.muted }}>От</div>
                        <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg text-sm"
                          style={{ border: `1px solid ${c.border}`, background: c.subtle, color: c.text, fontFamily: 'inherit', outline: 'none' }} />
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: c.muted }}>До</div>
                        <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg text-sm"
                          style={{ border: `1px solid ${c.border}`, background: c.subtle, color: c.text, fontFamily: 'inherit', outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: c.muted }}>Время</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs mb-1" style={{ color: c.muted }}>От</div>
                        <input type="time" value={filterTimeFrom} onChange={e => setFilterTimeFrom(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg text-sm"
                          style={{ border: `1px solid ${c.border}`, background: c.subtle, color: c.text, fontFamily: 'inherit', outline: 'none' }} />
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: c.muted }}>До</div>
                        <input type="time" value={filterTimeTo} onChange={e => setFilterTimeTo(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg text-sm"
                          style={{ border: `1px solid ${c.border}`, background: c.subtle, color: c.text, fontFamily: 'inherit', outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: c.muted }}>Район</div>
                    <input type="text" placeholder="Введите район..." value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-sm"
                      style={{ border: `1px solid ${c.border}`, background: c.subtle, color: c.text, fontFamily: 'inherit', outline: 'none' }} />
                  </div>
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: c.muted }}>Моё местоположение</div>
                    <button
                      type="button"
                      onClick={() => {
                        setGpsLoading(true);
                        navigator.geolocation?.getCurrentPosition(
                          pos => { setContractorGps({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setGpsLoading(false); },
                          () => setGpsLoading(false),
                          { timeout: 8000, enableHighAccuracy: false }
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-sm font-medium"
                      style={{ border: `1px solid ${contractorGps ? ACCENT + '60' : c.border}`, background: contractorGps ? `${ACCENT}12` : c.subtle, color: contractorGps ? ACCENT : c.muted, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                    >
                      {gpsLoading ? '⏳ Определяем...' : contractorGps ? '✅ Местоположение определено' : '📍 Определить моё местоположение'}
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: c.muted }}>
                      <span>Дальность от меня</span>
                      <span className="font-medium" style={{ color: contractorGps ? c.text : c.muted }}>{filterDistanceKm < 50 ? `${filterDistanceKm} км` : 'Любая'}</span>
                    </div>
                    <input type="range" min={1} max={50} value={filterDistanceKm} onChange={e => setFilterDistanceKm(Number(e.target.value))}
                      className="w-full" style={{ accentColor: ACCENT, opacity: contractorGps ? 1 : 0.5 }} disabled={!contractorGps} />
                    <div className="flex justify-between text-xs mt-0.5" style={{ color: c.muted }}>
                      <span>1 км</span><span>50 км (без ограничений)</span>
                    </div>
                    {!contractorGps && (
                      <div className="text-xs mt-1" style={{ color: c.muted }}>Определите местоположение для фильтрации по расстоянию</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: c.muted }}>Сортировка</div>
                    <select value={sortOrders} onChange={e => setSortOrders(e.target.value as typeof sortOrders)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-sm"
                      style={{ border: `1px solid ${c.border}`, background: c.subtle, color: c.text, fontFamily: 'inherit', outline: 'none' }}>
                      <option value="newest">Сначала новые</option>
                      <option value="price_asc">Цена: по возрастанию</option>
                      <option value="price_desc">Цена: по убыванию</option>
                      <option value="date_asc">Дата: сначала ближние</option>
                      <option value="date_desc">Дата: сначала дальние</option>
                      <option value="distance_asc" disabled={!contractorGps}>Ближе всего (по GPS)</option>
                    </select>
                  </div>
                </div>
              )}

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
              ) : ordersError ? (
                <div style={{ ...card, textAlign: 'center', padding: '2.5rem 1.25rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
                  <div className="font-semibold mb-1" style={{ color: c.text }}>Не удалось загрузить заказы</div>
                  <div className="text-sm mb-4" style={{ color: c.muted }}>Проверьте соединение и попробуйте снова</div>
                  <button
                    style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0.5rem 1.25rem', borderRadius: '0.75rem', fontWeight: 500 }}
                    onClick={() => { setOrdersError(false); setOrdersLoading(true); ordersApi.available().then((res: any) => { setAvailableOrders((res?.data ?? []).filter((o: any) => o.customerId !== user?.id)); }).catch(() => setOrdersError(true)).finally(() => setOrdersLoading(false)); }}
                  >Повторить</button>
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
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {isAsap ? (
                                  <>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: ACCENT }}>⚡ Как можно скорее</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-4 h-4 flex-shrink-0" style={{ color: c.muted }} />
                                    <span className="text-base font-semibold" style={{ color: c.text }}>{timeStr}</span>
                                    <span className="text-xs" style={{ color: c.muted }}>{dateStr}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-start gap-1.5 mb-1">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.muted, marginTop: '0.15rem' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span className="text-sm font-medium" style={{ color: c.text, wordBreak: 'break-word' }}>{order.address}</span>
                                  {' '}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(order.address + ', Казань').catch(() => {}); toast.success('Адрес скопирован', { duration: 1500 }); }}
                                    title="Скопировать адрес"
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.35rem', background: c.subtle, border: `1px solid ${c.border}`, cursor: 'pointer', color: ACCENT, verticalAlign: 'middle', flexShrink: 0 }}
                                  ><Copy className="w-3 h-3" /></button>
                                </div>
                              </div>
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
                <div className="flex items-start gap-3 mb-2">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold" style={{ color: c.text }}>{selectedOrder.address}</div>
                    <div className="text-sm mt-0.5" style={{ color: c.muted }}>{selectedOrder.district}</div>
                  </div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(selectedOrder.address + ', Казань').catch(() => {}); toast.success('Адрес скопирован', { description: 'Вставьте в навигатор', duration: 2000 }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: `1px solid ${c.border}`, background: c.subtle, color: ACCENT, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '0.75rem' }}
                >
                  <Copy className="w-3.5 h-3.5" /> Скопировать адрес
                </button>
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

      {/* Photo source bottom sheet */}
      {showPhotoSheet && (
        <>
          <div
            className="fixed inset-0 z-[85]"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowPhotoSheet(null)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[86] rounded-t-2xl"
            style={{ background: c.surface, paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: c.border, margin: '12px auto 16px' }} />
            <div className="px-4 pb-2">
              <div className="text-sm font-semibold mb-4 text-center" style={{ color: c.text }}>Добавить фото</div>
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-3 text-sm font-medium"
                style={{ background: `${ACCENT}15`, color: ACCENT, border: `1.5px solid ${ACCENT}40`, cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={async () => {
                  const jobId = showPhotoSheet;
                  setShowPhotoSheet(null);
                  const files = await pickPhotosNative(3, 'gallery');
                  if (files) setCompletionPhotos(prev => ({ ...prev, [jobId]: [...(prev[jobId] || []), ...files].slice(0, 3) }));
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>🖼️</span>
                Из галереи
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-3 text-sm font-medium"
                style={{ background: `${ACCENT}15`, color: ACCENT, border: `1.5px solid ${ACCENT}40`, cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={async () => {
                  const jobId = showPhotoSheet;
                  setShowPhotoSheet(null);
                  const files = await pickPhotosNative(3, 'camera');
                  if (files) setCompletionPhotos(prev => ({ ...prev, [jobId]: [...(prev[jobId] || []), ...files].slice(0, 3) }));
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>📷</span>
                Сделать фото
              </button>
              <button
                className="w-full py-3 rounded-xl text-sm font-medium"
                style={{ background: c.subtle, color: c.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => setShowPhotoSheet(null)}
              >
                Отмена
              </button>
            </div>
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="" style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '0.5rem' }} />
        </div>
      )}

      {/* Bottom nav - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40" style={{ background: c.surface, borderTop: `1px solid ${c.border}`, paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
            <button onClick={() => setActiveTab('map')} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === 'map' ? ACCENT : c.muted }}>
              <MapIcon className="w-6 h-6" />
              <span className="text-xs">Карта</span>
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
              setMyJobs(prev => prev.map(j => j.id === ratingOrder.id ? { ...j, ratingByContractor: rating } as any : j));
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

      {/* Edit work info modal */}
      {editInfoOpen && (
        <div className="fixed inset-0 z-[90] flex items-end lg:items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setEditInfoOpen(false)}>
          <div
            className="w-full lg:max-w-sm rounded-t-2xl lg:rounded-2xl"
            style={{ background: c.surface }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-base font-bold" style={{ color: c.text }}>Дополнительная информация</div>
                <button onClick={() => setEditInfoOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontSize: '1.1rem' }}>✕</button>
              </div>

              {/* Transport mode */}
              <div className="mb-5">
                <div className="text-xs font-medium mb-2" style={{ color: c.muted }}>Способ передвижения</div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'pedestrian', label: 'Пеший', icon: '🚶' },
                    { value: 'scooter', label: 'Самокат', icon: '🛴' },
                    { value: 'bicycle', label: 'Велосипед', icon: '🚲' },
                    { value: 'e-bicycle', label: 'Электро­вело', icon: '⚡🚲' },
                    { value: 'moto', label: 'Мото', icon: '🏍️' },
                    { value: 'car', label: 'Авто', icon: '🚗' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setEditInfoForm(f => ({ ...f, transportMode: opt.value })); setFilterDistanceKm(TRANSPORT_RADIUS_KM[opt.value] ?? 15); }}
                      style={{
                        padding: '0.625rem 0.25rem', borderRadius: '0.75rem', textAlign: 'center',
                        border: `1.5px solid ${editInfoForm.transportMode === opt.value ? ACCENT : c.border}`,
                        background: editInfoForm.transportMode === opt.value ? `${ACCENT}15` : c.subtle,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{opt.icon}</div>
                      <div style={{ fontSize: '0.7rem', color: editInfoForm.transportMode === opt.value ? ACCENT : c.textSub, fontWeight: editInfoForm.transportMode === opt.value ? 600 : 400 }}>{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={editInfoSaving}
                onClick={async () => {
                  setEditInfoSaving(true);
                  try {
                    const updated = await authApi.updateProfile({ transportMode: editInfoForm.transportMode });
                    updateUser(updated);
                    setEditInfoOpen(false);
                    toast.success('Данные обновлены');
                  } catch {
                    toast.error('Не удалось сохранить');
                  } finally {
                    setEditInfoSaving(false);
                  }
                }}
                className="w-full h-11 rounded-xl text-sm font-semibold"
                style={{ background: ACCENT, color: 'white', border: 'none', cursor: editInfoSaving ? 'not-allowed' : 'pointer', opacity: editInfoSaving ? 0.6 : 1, fontFamily: 'inherit' }}
              >
                {editInfoSaving ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editProfileOpen && (
        <div className="fixed inset-0 z-[90] flex items-end lg:items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => { setEditProfileOpen(false); setEmailChangeStep('idle'); setEmailChangeCode(''); setEmailChangeError(''); }}>
          <div className="w-full lg:max-w-sm rounded-t-2xl lg:rounded-2xl" style={{ background: c.surface }} onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-base font-bold" style={{ color: c.text }}>Редактирование профиля</div>
                <button onClick={() => { setEditProfileOpen(false); setEmailChangeStep('idle'); setEmailChangeCode(''); setEmailChangeError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontSize: '1.1rem' }}>✕</button>
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
                <div className="text-xs font-medium mb-1.5" style={{ color: c.muted }}>Банк СБП для оплаты</div>
                <select
                  value={editProfileForm.sbpBank}
                  onChange={e => setEditProfileForm(f => ({ ...f, sbpBank: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: `1px solid ${c.border}`, borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', background: c.input, color: c.text, boxSizing: 'border-box' as const, fontFamily: 'inherit', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">Выберите банк...</option>
                  {['Сбербанк','Т-Банк (Тинькофф)','ВТБ','Альфа-Банк','Газпромбанк','Открытие','Совкомбанк','Росбанк','МТС Банк','Почта Банк','Райффайзен','ПСБ'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <div className="text-xs font-medium mb-1.5" style={{ color: c.muted }}>Район работы</div>
                <select
                  value={editProfileForm.district}
                  onChange={e => setEditProfileForm(f => ({ ...f, district: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: `1px solid ${c.border}`, borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', background: c.input, color: c.text, boxSizing: 'border-box' as const, fontFamily: 'inherit', appearance: 'none', cursor: 'pointer' }}
                >
                  {CONTRACTOR_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <div className="text-xs font-medium mb-1.5" style={{ color: c.muted }}>ИНН самозанятого <span style={{ fontWeight: 400, color: c.muted }}>(необязательно)</span></div>
                <input
                  value={editProfileForm.inn}
                  onChange={e => setEditProfileForm(f => ({ ...f, inn: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                  placeholder="12 цифр"
                  maxLength={12}
                  inputMode="numeric"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: `1px solid ${editProfileForm.inn.length > 0 && editProfileForm.inn.length < 12 ? '#f59e0b' : editProfileForm.inn.length === 12 ? '#22c55e' : c.border}`, borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', background: c.input, color: c.text, boxSizing: 'border-box' as const, fontFamily: 'inherit' }}
                />
                {editProfileForm.inn.length > 0 && editProfileForm.inn.length < 12 && (
                  <div className="text-xs mt-1" style={{ color: '#f59e0b' }}>Введите все 12 цифр</div>
                )}
                {editProfileForm.inn.length === 12 && (
                  <div className="text-xs mt-1" style={{ color: '#22c55e' }}>✓ ИНН принят</div>
                )}
              </div>
              {emailChangeStep === 'verify' ? (
                <>
                  <div className="mb-2 text-sm" style={{ color: c.text }}>
                    Код подтверждения отправлен на <strong>{editProfileForm.email}</strong>
                  </div>
                  <div className="mb-5">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      value={emailChangeCode}
                      onChange={e => { setEmailChangeCode(e.target.value.replace(/\D/g, '')); setEmailChangeError(''); }}
                      placeholder="Код из письма"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', border: `1px solid ${emailChangeError ? '#ef4444' : c.border}`, borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', background: c.input, color: c.text, boxSizing: 'border-box' as const, fontFamily: 'inherit', letterSpacing: '0.15em' }}
                    />
                    {emailChangeError && <div className="text-xs mt-1" style={{ color: '#ef4444' }}>{emailChangeError}</div>}
                  </div>
                  <button
                    disabled={editProfileSaving || emailChangeCode.length < 4}
                    onClick={async () => {
                      setEditProfileSaving(true);
                      try {
                        await authApi.confirmEmailChange(editProfileForm.email.trim(), emailChangeCode);
                        const updated = await authApi.me();
                        updateUser(updated);
                        setEmailChangeStep('idle');
                        setEmailChangeCode('');
                        setEditProfileOpen(false);
                        toast.success('Email обновлён');
                      } catch (err: any) {
                        setEmailChangeError(err?.message || 'Неверный или истёкший код');
                      } finally {
                        setEditProfileSaving(false);
                      }
                    }}
                    className="w-full h-11 rounded-xl text-sm font-semibold mb-2"
                    style={{ background: ACCENT, color: 'white', border: 'none', cursor: (editProfileSaving || emailChangeCode.length < 4) ? 'not-allowed' : 'pointer', opacity: (editProfileSaving || emailChangeCode.length < 4) ? 0.6 : 1, fontFamily: 'inherit' }}
                  >
                    {editProfileSaving ? 'Проверяем...' : 'Подтвердить'}
                  </button>
                  <button
                    onClick={() => { setEmailChangeStep('idle'); setEmailChangeCode(''); setEmailChangeError(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontSize: '0.8rem', width: '100%', textAlign: 'center', fontFamily: 'inherit', padding: '0.25rem' }}
                  >
                    Назад
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-5">
                    <div className="text-xs font-medium mb-1.5" style={{ color: c.muted }}>Email</div>
                    <input
                      type="email"
                      value={editProfileForm.email}
                      onChange={e => setEditProfileForm(f => ({ ...f, email: e.target.value }))}
                      onBlur={e => { if (!e.target.value.trim() && user?.email) setEditProfileForm(f => ({ ...f, email: user!.email! })); }}
                      placeholder="your@email.com"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', border: `1px solid ${!editProfileForm.email.trim() && user?.email ? '#ef4444' : c.border}`, borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', background: c.input, color: c.text, boxSizing: 'border-box' as const, fontFamily: 'inherit' }}
                    />
                    {!editProfileForm.email.trim() && user?.email
                      ? <div className="text-xs mt-1" style={{ color: '#ef4444' }}>Email обязателен — используется для входа</div>
                      : <div className="text-xs mt-1" style={{ color: c.muted }}>Используется для входа в аккаунт</div>
                    }
                  </div>
                  <button
                    disabled={editProfileSaving || !editProfileForm.name.trim() || (editProfileForm.inn.length > 0 && editProfileForm.inn.length < 12) || (!editProfileForm.email.trim() && !!user?.email)}
                    onClick={async () => {
                      setEditProfileSaving(true);
                      try {
                        const newEmail = editProfileForm.email.trim();
                        const emailChanged = newEmail && newEmail !== (user?.email ?? '');
                        if (emailChanged) {
                          await authApi.requestEmailChange(newEmail);
                          setEditProfileSaving(false);
                          setEmailChangeStep('verify');
                          return;
                        }
                        if (editProfileForm.inn.length === 12 && editProfileForm.inn !== user?.inn) {
                          try {
                            const { selfEmployed } = await authApi.verifyInn(editProfileForm.inn);
                            updateUser({ inn: editProfileForm.inn, innVerified: selfEmployed });
                            if (selfEmployed) toast.success('ИНН подтверждён — статус самозанятого ✓');
                            else toast.info('ИНН сохранён — в реестре ФНС не найден');
                          } catch {
                            await authApi.updateProfile({ inn: editProfileForm.inn });
                          }
                        }
                        const patch: Record<string, any> = { name: editProfileForm.name.trim(), district: editProfileForm.district, ...(editProfileForm.sbpBank ? { sbpBank: editProfileForm.sbpBank } : {}) };
                        const updated = await authApi.updateProfile(patch);
                        updateUser(updated);
                        setEditProfileOpen(false);
                        toast.success('Профиль обновлён');
                      } catch (err: any) {
                        toast.error(err?.message || 'Не удалось сохранить');
                      } finally {
                        setEditProfileSaving(false);
                      }
                    }}
                    className="w-full h-11 rounded-xl text-sm font-semibold"
                    style={{ background: ACCENT, color: 'white', border: 'none', cursor: (editProfileSaving || !editProfileForm.name.trim()) ? 'not-allowed' : 'pointer', opacity: (editProfileSaving || !editProfileForm.name.trim()) ? 0.6 : 1, fontFamily: 'inherit' }}
                  >
                    {editProfileSaving ? 'Сохраняем...' : 'Сохранить'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showOnboarding && (
        <OnboardingSlider
          role="contractor"
          isDark={isDark}
          onFinish={() => {
            localStorage.setItem('trashgo_onboarded', '1');
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Telegram reminder */}
      {!user?.telegramLinked && <TelegramReminder />}
    </div>
  );
}
