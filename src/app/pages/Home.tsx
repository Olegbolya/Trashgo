import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Moon, Sun, ChevronDown, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { useRoleStore, ROLE_COLORS } from '../../stores/role.store';
import { authApi } from '../../api/auth';
import { startVkOAuth } from '../../lib/vkid';
import { toast } from 'sonner';

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').replace(/^7/, '').replace(/^8/, '').slice(0, 10);
  let result = '+7';
  if (digits.length > 0) result += ' (' + digits.slice(0, 3);
  if (digits.length >= 4) result += ') ' + digits.slice(3, 6);
  if (digits.length >= 7) result += '-' + digits.slice(6, 8);
  if (digits.length >= 9) result += '-' + digits.slice(8, 10);
  return result;
}

const FEATURES = [
  { icon: '🗺️', bg: '#dcfce7', name: 'Заявки на карте', desc: 'Исполнители видят все доступные заявки в своём районе на интерактивной карте — никакого посредника.' },
  { icon: '💸', bg: '#fed7aa', name: 'Вы ставите цену', desc: 'Укажите желаемую сумму сами при создании заявки. Оплата — напрямую через СБП, без комиссии платформы.' },
  { icon: '🛡️', bg: '#dbeafe', name: 'Проверенные исполнители', desc: 'Все исполнители проходят верификацию. Рейтинги и отзывы помогают сделать правильный выбор.' },
  { icon: '💬', bg: '#e9d5ff', name: 'Встроенный чат', desc: 'Общайтесь с исполнителем прямо в приложении — без посторонних мессенджеров и лишних контактов.' },
  { icon: '🔔', bg: '#fce7f3', name: 'Уведомления', desc: 'Мгновенные уведомления о заявках через Telegram-бот или в браузере — работает без установки приложения.' },
  { icon: '🎁', bg: '#ccfbf1', name: 'Реферальная программа', desc: 'Приглашайте исполнителей и платите меньше. 5 активных друзей — абонемент бесплатно навсегда.' },
];

const STEPS = [
  { n: '1', title: 'Создайте заявку', desc: 'Укажите адрес, опишите мусор, прикрепите фото и поставьте желаемую цену' },
  { n: '2', title: 'Исполнитель берёт заказ', desc: 'Он видит вашу заявку на карте в своём районе и сам принимает её' },
  { n: '3', title: 'Уточните детали в чате', desc: 'Договоритесь о времени и нюансах прямо в приложении' },
  { n: '4', title: 'Мусор вывезен!', desc: 'Исполнитель приезжает и делает работу, оплата через СБП' },
];

const TESTIMONIALS = [
  { avatar: 'АК', name: 'Анна Козлова', role: 'Заказчик, Ново-Савиновский р-н', text: '«Заказала вывоз строительного мусора после ремонта. Исполнитель приехал через 20 минут! Всё забрали, убрали. Очень довольна!»' },
  { avatar: 'ДМ', name: 'Дмитрий Морозов', role: 'Исполнитель, Казань', text: '«Работаю на TrashGo уже полгода. Зарабатываю около 40 000 ₽ в месяц. Удобное приложение, много заказов в моём районе.»' },
  { avatar: 'МК', name: 'Михаил Кузнецов', role: 'Заказчик, Советский р-н', text: '«Переезжали — накопилось много старой мебели и хлама. Нашёл исполнителя за 10 минут, всё вывезли за один приезд. Очень доволен!»' },
  { avatar: 'ЕС', name: 'Елена Смирнова', role: 'Заказчик, Приволжский р-н', text: '«Думала, что вывоз крупногабаритного хлама будет сложным. Оказалось — разместила заявку, через 15 минут откликнулся исполнитель. Оплатила через СБП, никаких наличных!»' },
];

const FAQ_ITEMS = [
  { q: 'В каких районах Казани работает TrashGo?', a: 'Сейчас TrashGo активно работает в 5 районах: Вахитовский, Советский, Ново-Савиновский, Приволжский и Московский. Кировский и Авиастроительный районы скоро откроются. Исполнители указывают рабочий район, и заявки показываются ближайшим.' },
  { q: 'Как оставить заявку на вывоз мусора?', a: 'Выберите роль «Заказчик», войдите через VK ID или email и нажмите «Создать заявку». Укажите адрес, объём и удобное время — исполнители в вашем районе увидят заявку и откликнутся.' },
  { q: 'Сколько стоит вывоз мусора?', a: 'Вы сами указываете желаемую цену при создании заявки. Исполнители могут принять её или предложить свою стоимость — вы выбираете лучшее предложение. Оплата напрямую через СБП без комиссии платформы.' },
  { q: 'Как быстро приедет исполнитель?', a: 'Многие заявки закрываются в течение 15–60 минут. При создании заявки вы выбираете удобный временной слот, исполнитель подтверждает время и приезжает точно в срок.' },
  { q: 'Как стать исполнителем и начать зарабатывать?', a: 'Выберите роль «Исполнитель», зарегистрируйтесь и укажите свой район. После этого вы сразу увидите доступные заявки рядом с вами и сможете их принимать. Первый месяц — бесплатно.' },
  { q: 'Что именно можно вывезти?', a: 'Бытовой мусор в пакетах, крупногабаритную мебель и технику, строительный мусор после ремонта, старую одежду и прочее. Уточните детали в описании заявки — исполнитель подтвердит, что сможет вывезти.' },
  { q: 'Безопасно ли пускать исполнителя домой?', a: 'Все исполнители проходят верификацию. Профиль каждого содержит рейтинг, отзывы и историю заказов — вы видите, кому открываете дверь.' },
  { q: 'Что делать, если исполнитель не приехал?', a: 'Напишите в поддержку через раздел «Помощь» в профиле. Мы оперативно разберём ситуацию и при необходимости найдём другого исполнителя или вернём средства.' },
  { q: 'Работает ли TrashGo на телефоне?', a: 'Да! Сайт полностью адаптирован для мобильных устройств. Добавьте trashgo.pro на главный экран телефона как PWA — работает как приложение, без установки из магазина.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const { selectedRole, accentColor, setRole } = useRoleStore();

  const formRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [accountFound, setAccountFound] = useState(false);
  const [verifyNavState, setVerifyNavState] = useState<Record<string, unknown> | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');
  const [modalEmail, setModalEmail] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalShowEmail, setModalShowEmail] = useState(false);
  const [vkLoading, setVkLoading] = useState(false);

  const accent = accentColor;
  const accentDark = selectedRole === 'contractor' ? '#1565c0' : '#43a047';
  const btnGrad = `linear-gradient(135deg, ${accent}, ${accentDark})`;
  const btnShadow = `0 4px 16px ${accent}44`;

  const bg = isDark ? '#000000' : '#ffffff';
  const bgAlt = isDark ? '#0d0d0d' : '#f9fafb';
  const surface = isDark ? '#111111' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.09)' : '#e5e7eb';
  const text = isDark ? '#f9fafb' : '#111827';
  const textSub = isDark ? 'rgba(255,255,255,0.65)' : '#4b5563';
  const textMuted = isDark ? 'rgba(255,255,255,0.38)' : '#9ca3af';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'customer' ? '/customer' : '/contractor', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => { if (!selectedRole) setRole('customer'); }, []);

  useEffect(() => {
    const h = () => setHeaderScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.tg-anim');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('tg-anim-in'), i * 80);
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const openModal = (mode: 'login' | 'register') => {
    setModalMode(mode);
    setModalEmail('');
    setModalError('');
    setModalShowEmail(false);
    setShowModal(true);
  };

  const handleVkLogin = async () => {
    setVkLoading(true);
    try {
      await startVkOAuth();
    } catch {
      toast.error('Не удалось запустить вход через VK. Попробуйте ещё раз.');
      setVkLoading(false);
    }
  };

  const modalEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modalEmail.trim());

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmailValid || modalLoading) return;
    setModalError('');
    setModalLoading(true);
    try {
      const role = selectedRole || 'customer';
      const res = await authApi.login(modalEmail.trim());
      const navState = { email: modalEmail.trim(), role, devCode: res.devCode, channel: res.channel, deliveryEmail: res.deliveryEmail || modalEmail.trim(), telegramBotLink: res.telegramBotLink };
      setShowModal(false);
      navigate('/verify', { state: navState });
    } catch {
      setModalError('Ошибка. Проверьте email и попробуйте снова.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRoleSelect = (role: 'customer' | 'contractor') => {
    setRole(role);
    setFormError('');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneValid = phone.replace(/\D/g, '').length >= 10;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || loading) return;
    setFormError('');
    setLoading(true);
    try {
      const role = selectedRole || 'customer';
      const res = await authApi.login(email.trim());
      if (res.needsPhone) { setStep('phone'); return; }
      const navState = { email: email.trim(), role, devCode: res.devCode, channel: res.channel, deliveryEmail: res.deliveryEmail || email.trim(), telegramBotLink: res.telegramBotLink };
      if (!res.isNewUser) { setVerifyNavState(navState); setAccountFound(true); return; }
      navigate('/verify', { state: navState });
    } catch {
      setFormError('Ошибка. Проверьте email и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid || loading) return;
    setFormError('');
    setLoading(true);
    try {
      const fp = formatPhone(phone);
      const res = await authApi.login(email.trim(), fp);
      navigate('/verify', { state: { email: email.trim(), phone: fp, role: selectedRole || 'customer', devCode: res.devCode, channel: res.channel, deliveryEmail: res.deliveryEmail || email.trim(), telegramBotLink: res.telegramBotLink } });
    } catch {
      setFormError('Ошибка. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const SectionLabel = ({ icon, txt }: { icon: string; txt: string }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: `${accent}18`, border: `1px solid ${accent}44`, borderRadius: 999, fontSize: 13, fontWeight: 600, color: accent, marginBottom: 14, transition: 'all 0.4s' }}>
      {icon} {txt}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: bg, color: text, minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: headerScrolled ? (isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)') : 'transparent',
        backdropFilter: headerScrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: headerScrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${headerScrolled ? border : 'transparent'}`,
        transition: 'background 0.3s, border-color 0.3s',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <div style={{ height: '3.5rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem' }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src="/logo.png" alt="TrashGo" style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0 }} />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: text, letterSpacing: '-0.02em' }}>Trash<span style={{ color: accent, transition: 'color 0.4s' }}>Go</span></span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
              {isDark ? <Sun size={14} color={textMuted} /> : <Moon size={14} color={textMuted} />}
            </button>
            {isAuthenticated ? (
              <button onClick={() => navigate(user?.role === 'contractor' ? '/contractor' : '/customer')} style={{ padding: '0.5rem 1rem', borderRadius: 8, background: btnGrad, color: '#fff', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Мой кабинет
              </button>
            ) : (
              <>
                <button onClick={() => openModal('login')} style={{ padding: '0.5rem 1rem', borderRadius: 8, background: 'none', color: text, fontSize: '0.82rem', fontWeight: 600, border: `1.5px solid ${border}`, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Войти
                </button>
                <button onClick={() => openModal('register')} style={{ padding: '0.5rem 1rem', borderRadius: 8, background: btnGrad, color: '#fff', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Регистрация
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '3.5rem' }}>
        <div className="tg-blob" style={{ position: 'absolute', top: '-8%', right: '-4%', width: 400, height: 400, borderRadius: '50%', background: `${accent}0d`, pointerEvents: 'none' }} />
        <div className="tg-blob" style={{ position: 'absolute', bottom: '-6%', left: '8%', width: 280, height: 280, borderRadius: '50%', background: `${accent}0a`, animationDelay: '3s', pointerEvents: 'none' }} />
        <div className="tg-blob" style={{ position: 'absolute', top: '35%', left: '48%', width: 180, height: 180, borderRadius: '50%', background: `${accent}08`, animationDelay: '6s', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: 'clamp(4rem,8vw,6rem) 1.5rem clamp(3rem,6vw,5rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px), 1fr))', gap: '3rem', alignItems: 'center' }}>
          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: `${accent}18`, border: `1px solid ${accent}44`, borderRadius: 999, fontSize: 13, fontWeight: 600, color: accent, marginBottom: '1.25rem', transition: 'all 0.4s' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, display: 'inline-block', transition: 'background 0.4s' }} />
              Уже 3,000+ пользователей
            </div>
            <h1 style={{ fontSize: 'clamp(2.4rem,5.5vw,3.75rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, color: text, margin: '0 0 1.1rem' }}>
              Вывоз мусора<br />
              <span style={{ color: accent, transition: 'color 0.4s' }}>быстро и удобно</span>
            </h1>
            <p style={{ fontSize: 'clamp(0.9rem,1.4vw,1.05rem)', color: textSub, lineHeight: 1.7, maxWidth: 480, margin: '0 0 2rem' }}>
              Закажите вывоз мусора в Казани за 15 минут — или станьте исполнителем и зарабатывайте в своём районе. Оплата напрямую через СБП, без комиссии.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.25rem' }}>
              {([['customer', '📦 Я заказчик'], ['contractor', '🚛 Я исполнитель']] as const).map(([role, label]) => (
                <button key={role} onClick={() => handleRoleSelect(role)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0.7rem 1.375rem', borderRadius: 12,
                  background: selectedRole === role ? ROLE_COLORS[role] : (isDark ? 'rgba(255,255,255,0.06)' : '#ffffff'),
                  color: selectedRole === role ? '#fff' : text,
                  border: `2px solid ${selectedRole === role ? ROLE_COLORS[role] : border}`,
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: selectedRole === role ? `0 4px 16px ${ROLE_COLORS[role]}44` : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.25s ease',
                }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[['6,000+', 'Выполнено заказов'], ['500+', 'Исполнителей'], ['4.9 ★', 'Средний рейтинг']].map(([val, label], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: text, letterSpacing: '-0.03em' }}>{val}</div>
                    <div style={{ fontSize: '0.72rem', color: textMuted }}>{label}</div>
                  </div>
                  {i < 2 && <div style={{ width: 1, height: 30, background: border }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Right — auth card */}
          <div ref={formRef}>
            <div style={{ background: surface, borderRadius: 24, padding: '1.75rem', border: `1px solid ${border}`, boxShadow: isDark ? '0 24px 64px rgba(0,0,0,0.55)' : '0 24px 64px rgba(0,0,0,0.08)', maxWidth: 420, marginLeft: 'auto' }}>
              <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: '1.375rem', gap: 4 }}>
                {(['customer', 'contractor'] as const).map(role => (
                  <button key={role} onClick={() => { setRole(role); setFormError(''); }} style={{
                    flex: 1, padding: '0.5rem', borderRadius: 9, fontSize: '0.85rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                    background: selectedRole === role ? surface : 'transparent',
                    color: selectedRole === role ? ROLE_COLORS[role] : textMuted,
                    boxShadow: selectedRole === role ? (isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.07)') : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    {role === 'customer' ? 'Заказчик' : 'Исполнитель'}
                  </button>
                ))}
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: text, marginBottom: 4 }}>
                {selectedRole === 'contractor' ? 'Стать исполнителем' : 'Создать аккаунт'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: textMuted, marginBottom: '1.25rem' }}>
                {selectedRole === 'contractor' ? 'Зарабатывайте на вывозе мусора' : 'Войдите через VK ID или email'}
              </p>

              {step === 'email' && !accountFound ? (
                <>
                  {/* VK primary */}
                  <button
                    onClick={handleVkLogin}
                    disabled={vkLoading}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '0.85rem', borderRadius: 12, background: 'linear-gradient(135deg, #2787F5, #5BABFF)', color: '#fff', fontSize: '0.9rem', fontWeight: 700, border: 'none', cursor: vkLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(39,135,245,0.4)', marginBottom: '0.875rem', transition: 'all 0.2s' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.6-.19 1.37 1.26 2.185 1.815.617.422 1.086.33 1.086.33l2.182-.03s1.14-.071.6-.968c-.044-.073-.314-.661-1.618-1.869-1.365-1.261-1.183-1.057.462-3.237.999-1.332 1.398-2.146 1.272-2.494-.12-.332-.855-.244-.855-.244l-2.454.015s-.182-.025-.317.055c-.133.079-.218.262-.218.262s-.387 1.03-.903 1.906c-1.088 1.848-1.523 1.947-1.7 1.832-.413-.267-.31-1.075-.31-1.648 0-1.793.272-2.54-.529-2.733-.266-.064-.461-.107-1.141-.114-.872-.009-1.609.003-2.027.207-.278.136-.492.439-.362.456.161.021.527.099.72.363.25.341.241 1.107.241 1.107s.144 2.11-.335 2.372c-.328.179-.778-.187-1.745-1.858-.496-.858-.87-1.807-.87-1.807s-.072-.176-.203-.271c-.158-.115-.378-.151-.378-.151l-2.33.015s-.35.01-.478.162C4.003 7.73 4.102 8.05 4.102 8.05s1.822 4.265 3.882 6.414c1.891 1.973 4.039 1.843 4.039 1.843l1.762-.016z" fill="white"/>
                    </svg>
                    {vkLoading ? 'Переходим...' : 'Войти через VK ID'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
                    <div style={{ flex: 1, height: 1, background: border }} />
                    <span style={{ fontSize: '0.72rem', color: textMuted, fontWeight: 500 }}>или по email</span>
                    <div style={{ flex: 1, height: 1, background: border }} />
                  </div>
                  <form onSubmit={handleEmailSubmit}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <input type="email" placeholder="your@email.com" value={email} onChange={e => { setFormError(''); setEmail(e.target.value); }} style={{ display: 'block', width: '100%', height: '2.75rem', padding: '0 0.875rem', borderRadius: 10, border: `1.5px solid ${formError ? '#ef4444' : email.length > 0 ? accent : border}`, fontSize: '0.95rem', outline: 'none', background: inputBg, color: text, fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
                      {formError && <p style={{ color: '#ef4444', fontSize: '0.74rem', marginTop: 4, marginBottom: 0 }}>{formError}</p>}
                    </div>
                    <button type="submit" disabled={loading || !emailValid} style={{ display: 'block', width: '100%', padding: '0.75rem', borderRadius: 10, background: emailValid ? btnGrad : (isDark ? '#374151' : '#e5e7eb'), color: emailValid ? '#fff' : textMuted, fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: loading || !emailValid ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: emailValid ? btnShadow : 'none', transition: 'all 0.2s' }}>
                      {loading ? 'Проверяем...' : (selectedRole === 'contractor' ? 'Начать зарабатывать →' : 'Продолжить →')}
                    </button>
                  </form>
                </>
              ) : accountFound && verifyNavState ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: text, marginBottom: 4 }}>Аккаунт найден</div>
                  <div style={{ fontSize: '0.78rem', color: textMuted, marginBottom: '1rem' }}>Код отправлен на <span style={{ color: text, fontWeight: 600 }}>{email}</span></div>
                  <button onClick={() => navigate('/verify', { state: verifyNavState })} style={{ display: 'block', width: '100%', padding: '0.75rem', borderRadius: 12, background: btnGrad, color: '#fff', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8, boxShadow: btnShadow }}>
                    Войти →
                  </button>
                  <button onClick={() => { setAccountFound(false); setVerifyNavState(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: textMuted, fontFamily: 'inherit' }}>
                    ← Изменить email
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePhoneSubmit}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.4rem 0.7rem', borderRadius: 8, background: `${accent}12`, marginBottom: '0.75rem', fontSize: '0.8rem', color: text }}>
                    <span>📧</span>
                    <span style={{ fontWeight: 600 }}>{email}</span>
                    <button type="button" onClick={() => setStep('email')} style={{ marginLeft: 'auto', color: textMuted, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.74rem', fontFamily: 'inherit' }}>Изменить</button>
                  </div>
                  <input type="tel" inputMode="numeric" placeholder="+7 (___) ___-__-__" value={phone ? formatPhone(phone) : ''} onChange={e => { setFormError(''); setPhone(e.target.value.replace(/\D/g, '')); }} autoFocus style={{ display: 'block', width: '100%', height: '2.75rem', padding: '0 0.875rem', borderRadius: 10, border: `1.5px solid ${formError ? '#ef4444' : phone.length > 0 ? accent : border}`, fontSize: '0.95rem', outline: 'none', background: inputBg, color: text, fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s', marginBottom: '0.75rem' }} />
                  {formError && <p style={{ color: '#ef4444', fontSize: '0.74rem', marginTop: -8, marginBottom: 8 }}>{formError}</p>}
                  <button type="submit" disabled={loading || !phoneValid} style={{ display: 'block', width: '100%', padding: '0.75rem', borderRadius: 10, background: phoneValid ? btnGrad : (isDark ? '#374151' : '#e5e7eb'), color: phoneValid ? '#fff' : textMuted, fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: loading || !phoneValid ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: phoneValid ? btnShadow : 'none', transition: 'all 0.2s' }}>
                    {loading ? 'Отправляем...' : 'Получить код →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="tg-features" style={{ padding: 'clamp(4rem,8vw,6rem) 1.5rem', background: bgAlt }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="tg-anim" style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <SectionLabel icon="✨" txt="Преимущества" />
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.4rem)', fontWeight: 800, color: text, letterSpacing: '-0.035em', margin: '0 0 10px' }}>Почему выбирают TrashGo</h2>
            <p style={{ fontSize: '0.975rem', color: textSub, maxWidth: 540, margin: '0 auto' }}>Мы создали платформу, которая делает вывоз мусора простым и удобным для всех</p>
          </div>
          <div className="tg-features">
            {FEATURES.map((f, i) => (
              <div key={i} className="tg-anim tg-card" style={{ background: surface, borderRadius: 20, padding: '1.625rem', border: `1px solid ${border}` }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, background: isDark ? 'rgba(255,255,255,0.07)' : f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: '0.975rem', fontWeight: 700, color: text, marginBottom: 7 }}>{f.name}</div>
                <div style={{ fontSize: '0.855rem', color: textSub, lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(4rem,8vw,6rem) 1.5rem', background: bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="tg-anim" style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <SectionLabel icon="📋" txt="Как это работает" />
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.4rem)', fontWeight: 800, color: text, letterSpacing: '-0.035em', margin: '0 0 10px' }}>Четыре простых шага</h2>
            <p style={{ fontSize: '0.975rem', color: textSub, maxWidth: 480, margin: '0 auto' }}>От заказа до вывоза — всё максимально просто и быстро</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
            {STEPS.map((s, i) => (
              <div key={i} className="tg-anim" style={{ textAlign: 'center' }}>
                <div className="tg-step" style={{ width: 72, height: 72, borderRadius: '50%', background: btnGrad, color: '#fff', fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.125rem', boxShadow: btnShadow, ['--step-accent' as string]: `${accent}55` }}>
                  {s.n}
                </div>
                <div style={{ fontSize: '0.975rem', fontWeight: 700, color: text, marginBottom: 7 }}>{s.title}</div>
                <div style={{ fontSize: '0.84rem', color: textMuted, lineHeight: 1.65, maxWidth: 190, margin: '0 auto' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tg-pricing" style={{ padding: 'clamp(4rem,8vw,6rem) 1.5rem', background: bgAlt }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="tg-anim" style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <SectionLabel icon="💎" txt="Тарифы" />
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.4rem)', fontWeight: 800, color: text, letterSpacing: '-0.035em', margin: '0 0 10px' }}>Простые и понятные цены</h2>
            <p style={{ fontSize: '0.975rem', color: textSub, maxWidth: 480, margin: '0 auto' }}>Никаких скрытых комиссий — оплата напрямую между заказчиком и исполнителем</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>

            <div className="tg-anim tg-card" onClick={() => handleRoleSelect('customer')} style={{ background: surface, borderRadius: 20, padding: '1.75rem', border: `2px solid ${border}`, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: text, marginBottom: 4 }}>Для заказчиков</div>
              <div style={{ fontSize: '0.82rem', color: textMuted, marginBottom: '1rem' }}>навсегда бесплатно</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: text, letterSpacing: '-0.04em', marginBottom: 2 }}>0 <span style={{ fontSize: '1rem', fontWeight: 500, color: textMuted }}>₽</span></div>
              <div style={{ fontSize: '0.8rem', color: textMuted, marginBottom: '1.375rem' }}>бесплатно</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.375rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Создание заявок на вывоз', 'Карта статуса заказа', 'Встроенный чат с исполнителем', 'Отзывы и рейтинги', 'Полностью бесплатно — навсегда'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem', color: textSub }}>
                    <span style={{ color: accent, fontWeight: 700, flexShrink: 0, transition: 'color 0.4s' }}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <button onClick={e => { e.stopPropagation(); handleRoleSelect('customer'); }} style={{ width: '100%', padding: '0.75rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', background: surface, color: text, border: `2px solid ${border}`, fontFamily: 'inherit' }}>
                Начать бесплатно
              </button>
            </div>

            <div className="tg-anim tg-card" onClick={() => handleRoleSelect('contractor')} style={{ background: surface, borderRadius: 20, padding: '1.75rem', border: `2px solid ${accent}`, textAlign: 'center', position: 'relative', boxShadow: `0 8px 32px ${accent}26`, cursor: 'pointer', transition: 'all 0.4s' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: btnGrad, color: '#fff', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', padding: '4px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                ДЛЯ ИСПОЛНИТЕЛЕЙ
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: text, marginBottom: 4 }}>Подписка</div>
              <div style={{ fontSize: '0.82rem', color: textMuted, marginBottom: '1rem' }}>Первый месяц бесплатно</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: text, letterSpacing: '-0.04em', marginBottom: 2 }}>50 <span style={{ fontSize: '1rem', fontWeight: 500, color: textMuted }}>₽</span></div>
              <div style={{ fontSize: '0.8rem', color: textMuted, marginBottom: '1.375rem' }}>в месяц</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.375rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Доступ ко всем заявкам в районе', '30 дней бесплатно при регистрации', 'Принимайте и выполняйте заказы', 'Уведомления в Telegram и браузере', 'Скидки за приглашённых друзей'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem', color: textSub }}>
                    <span style={{ color: accent, fontWeight: 700, flexShrink: 0, transition: 'color 0.4s' }}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <button onClick={e => { e.stopPropagation(); handleRoleSelect('contractor'); }} style={{ width: '100%', padding: '0.75rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', background: btnGrad, color: '#fff', border: 'none', fontFamily: 'inherit', boxShadow: btnShadow }}>
                Начать зарабатывать
              </button>
            </div>

            <div className="tg-anim tg-card" style={{ background: surface, borderRadius: 20, padding: '1.75rem', border: `2px solid ${border}`, textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: text, marginBottom: 4 }}>Реферальная</div>
              <div style={{ fontSize: '0.82rem', color: textMuted, marginBottom: '1rem' }}>Приглашайте друзей</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: accent, letterSpacing: '-0.04em', marginBottom: 2, transition: 'color 0.4s' }}>0 <span style={{ fontSize: '1rem', fontWeight: 500, color: textMuted }}>₽</span></div>
              <div style={{ fontSize: '0.8rem', color: textMuted, marginBottom: '1.375rem' }}>при 5+ активных друзьях</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.375rem' }}>
                {[['1 друг', '40₽/мес'], ['2 друга', '30₽/мес'], ['3 друга', '20₽/мес'], ['4 друга', '10₽/мес'], ['5 друзей', 'Бесплатно!']].map(([n, p]) => (
                  <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.65rem', borderRadius: 8, background: p === 'Бесплатно!' ? (isDark ? `${accent}1a` : `${accent}10`) : (isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb') }}>
                    <span style={{ fontSize: '0.82rem', color: textSub }}>{n}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: p === 'Бесплатно!' ? accent : text, transition: 'color 0.4s' }}>{p}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.74rem', color: textMuted, lineHeight: 1.5 }}>Скидка действует, пока приглашённый активно пользуется сервисом</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: 'clamp(4rem,8vw,6rem) 1.5rem', background: bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="tg-anim" style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <SectionLabel icon="💬" txt="Отзывы" />
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.4rem)', fontWeight: 800, color: text, letterSpacing: '-0.035em', margin: '0 0 10px' }}>Что говорят наши пользователи</h2>
            <p style={{ fontSize: '0.975rem', color: textSub, maxWidth: 480, margin: '0 auto' }}>Реальные отзывы людей, которые уже оценили TrashGo</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="tg-anim tg-card" style={{ background: bgAlt, borderRadius: 20, padding: '1.625rem', border: `1px solid ${border}` }}>
                <div style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '0.875rem', letterSpacing: 2 }}>★★★★★</div>
                <p style={{ fontSize: '0.875rem', color: textSub, lineHeight: 1.7, marginBottom: '1.125rem' }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: btnGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: text }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: textMuted }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(4rem,8vw,6rem) 1.5rem', background: btnGrad, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)' }} />
        <div className="tg-anim" style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.4rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.035em', margin: '0 0 14px' }}>Готовы начать?</h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: '0 0 2rem' }}>
            Присоединяйтесь к тысячам пользователей, которые уже сделали вывоз мусора простым и удобным
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => openModal('register')} style={{ padding: '0.8rem 1.75rem', borderRadius: 14, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', background: '#fff', color: accentDark, border: 'none', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              Зарегистрироваться бесплатно
            </button>
            <button onClick={() => document.getElementById('tg-faq')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '0.8rem 1.75rem', borderRadius: 14, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', fontFamily: 'inherit' }}>
              Узнать больше
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="tg-faq" style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(4rem,8vw,6rem) 1.5rem' }}>
        <div className="tg-anim">
          <SectionLabel icon="❓" txt="FAQ" />
          <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, letterSpacing: '-0.03em', color: text, margin: '0 0 6px' }}>Частые вопросы</h2>
          <p style={{ fontSize: '0.875rem', color: textMuted, margin: '0 0 1.75rem' }}>Если не нашли ответ — напишите нам в поддержку</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="tg-anim" style={{ borderRadius: '0.75rem', overflow: 'hidden', border: `1px solid ${openFaq === i ? accent : border}`, transition: 'border-color 0.2s', background: bgAlt }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.875rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: text, lineHeight: 1.4 }}>{item.q}</span>
                <ChevronDown size={14} color={textMuted} style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 1rem 0.875rem', fontSize: '0.845rem', color: textSub, lineHeight: 1.65, animation: 'tgFadeIn 0.15s ease' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: isDark ? '#030712' : '#111827', color: '#9ca3af', padding: '3rem 1.5rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem 3rem', marginBottom: '2.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <img src="/logo.png" alt="TrashGo" style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0 }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>TrashGo</span>
              </div>
              <p style={{ fontSize: '0.84rem', lineHeight: 1.7, maxWidth: 260, margin: 0 }}>Платформа для вывоза мусора. Соединяем заказчиков с исполнителями быстро и надёжно.</p>
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '0.875rem' }}>Продукт</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><button onClick={() => document.getElementById('tg-features')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.84rem', color: '#9ca3af', fontFamily: 'inherit', padding: 0 }}>Возможности</button></li>
                <li><button onClick={() => document.getElementById('tg-pricing')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.84rem', color: '#9ca3af', fontFamily: 'inherit', padding: 0 }}>Тарифы</button></li>
                <li><button onClick={() => navigate('/how-it-works')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.84rem', color: '#9ca3af', fontFamily: 'inherit', padding: 0 }}>Как это работает?</button></li>
                <li><button onClick={() => document.getElementById('tg-faq')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.84rem', color: '#9ca3af', fontFamily: 'inherit', padding: 0 }}>FAQ</button></li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '0.875rem' }}>Поддержка</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><button onClick={() => navigate('/help')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.84rem', color: '#9ca3af', fontFamily: 'inherit', padding: 0 }}>Помощь и поддержка</button></li>
                <li><button onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.84rem', color: '#9ca3af', fontFamily: 'inherit', padding: 0 }}>Конфиденциальность</button></li>
                <li><button onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.84rem', color: '#9ca3af', fontFamily: 'inherit', padding: 0 }}>Условия</button></li>
                <li><a href="mailto:support@trashgo.pro" style={{ fontSize: '0.84rem', color: '#9ca3af', textDecoration: 'none' }}>support@trashgo.pro</a></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1f2937', padding: '1.5rem 0 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4b5563', marginBottom: '0.875rem' }}>Политика конфиденциальности — основные положения</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
              {[
                ['1', 'Что собираем', 'Номер телефона, имя, район и адреса заказов. Платёжные данные не собираются.'],
                ['2', 'Как используем', 'Только для работы сервиса: авторизация, заказы, уведомления, рейтинг.'],
                ['3', 'Не передаём данные', 'Данные не продаются. Партнёры видят только необходимое для выполнения заказа.'],
                ['4', 'Защита данных', 'Серверы Timeweb (Россия), шифрование TLS 1.3, вход через VK ID или OTP — пароли не хранятся.'],
                ['5', 'Ваши права', 'Доступ, исправление и удаление данных по запросу (152-ФЗ).'],
                ['6', 'Контакты', 'support@trashgo.pro — ответим в течение 24 часов.'],
              ].map(([n, t, d]) => (
                <div key={n} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%', background: 'rgba(100,187,106,0.15)', color: '#66BB6A', fontSize: '0.62rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#d1d5db', marginBottom: 2 }}>{t}</div>
                    <div style={{ fontSize: '0.68rem', color: '#6b7280', lineHeight: 1.5 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1f2937', padding: '1.125rem 0 1.5rem' }}>
            <span style={{ fontSize: '0.78rem' }}>© 2026 TrashGo · Казань</span>
          </div>
        </div>
      </footer>

      {/* ── LOGIN MODAL ── */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        >
          <div className="tg-modal" style={{ background: surface, borderRadius: 28, padding: '3rem 2.75rem 2.5rem', width: '100%', maxWidth: 500, position: 'relative', boxShadow: isDark ? '0 40px 100px rgba(0,0,0,0.75)' : '0 40px 100px rgba(0,0,0,0.22)', border: `1px solid ${border}` }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 18, right: 18, width: 36, height: 36, borderRadius: 10, border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted }}>
              <X size={16} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem' }}>
              <img src="/logo.png" alt="TrashGo" style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 12, boxShadow: btnShadow }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: text, letterSpacing: '-0.02em' }}>Trash<span style={{ color: accent, transition: 'color 0.4s' }}>Go</span></div>
            </div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: text, textAlign: 'center', margin: '0 0 8px' }}>
              {modalMode === 'login' ? 'Вход в аккаунт' : 'Создать аккаунт'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: textMuted, textAlign: 'center', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
              Верификация телефона через VK ID
            </p>

            {/* VK primary */}
            <button
              onClick={handleVkLogin}
              disabled={vkLoading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', padding: '1rem', borderRadius: 14, background: 'linear-gradient(135deg, #2787F5, #5BABFF)', color: '#fff', fontSize: '1rem', fontWeight: 700, border: 'none', cursor: vkLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(39,135,245,0.4)', marginBottom: '1rem', transition: 'all 0.2s' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.6-.19 1.37 1.26 2.185 1.815.617.422 1.086.33 1.086.33l2.182-.03s1.14-.071.6-.968c-.044-.073-.314-.661-1.618-1.869-1.365-1.261-1.183-1.057.462-3.237.999-1.332 1.398-2.146 1.272-2.494-.12-.332-.855-.244-.855-.244l-2.454.015s-.182-.025-.317.055c-.133.079-.218.262-.218.262s-.387 1.03-.903 1.906c-1.088 1.848-1.523 1.947-1.7 1.832-.413-.267-.31-1.075-.31-1.648 0-1.793.272-2.54-.529-2.733-.266-.064-.461-.107-1.141-.114-.872-.009-1.609.003-2.027.207-.278.136-.492.439-.362.456.161.021.527.099.72.363.25.341.241 1.107.241 1.107s.144 2.11-.335 2.372c-.328.179-.778-.187-1.745-1.858-.496-.858-.87-1.807-.87-1.807s-.072-.176-.203-.271c-.158-.115-.378-.151-.378-.151l-2.33.015s-.35.01-.478.162C4.003 7.73 4.102 8.05 4.102 8.05s1.822 4.265 3.882 6.414c1.891 1.973 4.039 1.843 4.039 1.843l1.762-.016z" fill="white"/>
              </svg>
              {vkLoading ? 'Переходим в VK...' : 'Войти через VK ID'}
            </button>

            {!modalShowEmail ? (
              <button
                type="button"
                onClick={() => setModalShowEmail(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '0.75rem', borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', color: textMuted, fontSize: '0.875rem', fontWeight: 500, border: `1.5px solid ${border}`, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '1.25rem', transition: 'all 0.2s' }}
              >
                <span style={{ fontSize: '1rem' }}>📧</span>
                Войти по email
              </button>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.875rem' }}>
                  <div style={{ flex: 1, height: 1, background: border }} />
                  <span style={{ fontSize: '0.72rem', color: textMuted }}>или по email</span>
                  <div style={{ flex: 1, height: 1, background: border }} />
                </div>
                <form onSubmit={handleModalSubmit} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ marginBottom: '0.875rem' }}>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={modalEmail}
                      onChange={e => { setModalError(''); setModalEmail(e.target.value); }}
                      autoFocus
                      style={{ display: 'block', width: '100%', height: '3rem', padding: '0 1rem', borderRadius: 12, border: `1.5px solid ${modalError ? '#ef4444' : modalEmail.length > 0 ? accent : border}`, fontSize: '1rem', outline: 'none', background: inputBg, color: text, fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    />
                    {modalError && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 5, marginBottom: 0 }}>{modalError}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={modalLoading || !modalEmailValid}
                    style={{ display: 'block', width: '100%', padding: '0.875rem', borderRadius: 12, background: modalEmailValid ? btnGrad : (isDark ? '#374151' : '#e5e7eb'), color: modalEmailValid ? '#fff' : textMuted, fontSize: '0.95rem', fontWeight: 700, border: 'none', cursor: modalLoading || !modalEmailValid ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: modalEmailValid ? btnShadow : 'none', transition: 'all 0.2s' }}
                  >
                    {modalLoading ? 'Проверяем...' : 'Продолжить →'}
                  </button>
                </form>
              </>
            )}

            <p style={{ fontSize: '0.84rem', color: textMuted, textAlign: 'center', margin: 0 }}>
              {modalMode === 'login' ? (
                <>Нет аккаунта?{' '}<button type="button" onClick={() => setModalMode('register')} style={{ color: accent, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 600, padding: 0, transition: 'color 0.4s' }}>Зарегистрироваться</button></>
              ) : (
                <>Уже есть аккаунт?{' '}<button type="button" onClick={() => setModalMode('login')} style={{ color: accent, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 600, padding: 0, transition: 'color 0.4s' }}>Войти</button></>
              )}
            </p>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        input, button { -webkit-tap-highlight-color: transparent; }
        .tg-anim { opacity: 0; transform: translateY(18px); transition: opacity 0.55s ease, transform 0.55s ease; }
        .tg-anim-in { opacity: 1 !important; transform: translateY(0) !important; }
        .tg-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .tg-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.1); }
        .tg-blob { animation: tgFloat 9s ease-in-out infinite; }
        .tg-step { position: relative; }
        .tg-step::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 2px dashed var(--step-accent, rgba(100,187,106,0.35)); animation: tgSpin 20s linear infinite; }
        .tg-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        @media (max-width: 900px) { .tg-features { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 580px) { .tg-features { grid-template-columns: 1fr; } }
        @keyframes tgFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-18px) scale(1.04); } }
        @keyframes tgSpin { to { transform: rotate(360deg); } }
        @keyframes tgFadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tgModalIn { from { opacity: 0; transform: scale(0.93) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .tg-modal { animation: tgModalIn 0.2s ease; }
      `}</style>
    </div>
  );
}
