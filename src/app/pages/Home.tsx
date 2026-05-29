import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, Moon, Sun, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { useRoleStore, ROLE_COLORS } from '../../stores/role.store';
import { authApi } from '../../api/auth';
import { toast } from 'sonner';
import { isNative } from '../../lib/platform';

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').replace(/^7/, '').replace(/^8/, '').slice(0, 10);
  let result = '+7';
  if (digits.length > 0) result += ' (' + digits.slice(0, 3);
  if (digits.length >= 4) result += ') ' + digits.slice(3, 6);
  if (digits.length >= 7) result += '-' + digits.slice(6, 8);
  if (digits.length >= 9) result += '-' + digits.slice(8, 10);
  return result;
}

const FAQ_ITEMS = [
  {
    q: 'Как оставить заявку на вывоз мусора?',
    a: 'Выберите роль «Заказчик», войдите по email и нажмите «Создать заявку». Укажите адрес, объём и удобное время — исполнители в вашем районе увидят заявку и откликнутся.',
  },
  {
    q: 'Сколько стоит вывоз?',
    a: 'Вы сами указываете желаемую цену при создании заявки. Исполнители могут принять её или предложить свою стоимость — вы выбираете лучшее предложение.',
  },
  {
    q: 'Как быстро приедет исполнитель?',
    a: 'Обычно в тот же или следующий день. При создании заявки вы выбираете удобный временной слот, исполнитель подтверждает время и приезжает точно в срок.',
  },
  {
    q: 'Как стать исполнителем и начать зарабатывать?',
    a: 'Выберите роль «Исполнитель», зарегистрируйтесь и укажите свой район. После этого вы сразу увидите доступные заявки рядом с вами и сможете их принимать.',
  },
  {
    q: 'Что именно можно вывезти?',
    a: 'Бытовой мусор в пакетах, крупногабаритную мебель и технику, строительный мусор после ремонта, старую одежду и прочее. Уточните детали в описании заявки.',
  },
  {
    q: 'Безопасно ли пускать исполнителя домой?',
    a: 'Все исполнители проходят верификацию. Профиль каждого содержит рейтинг, отзывы и историю заказов — вы видите, кому открываете дверь.',
  },
  {
    q: 'Что делать, если исполнитель не приехал?',
    a: 'Напишите в поддержку через раздел «Помощь» в профиле. Мы оперативно разберём ситуацию и при необходимости найдём другого исполнителя или вернём средства.',
  },
  {
    q: 'Есть ли мобильное приложение?',
    a: 'Да! TrashGo доступен как Android-приложение — скачайте APK с нашего сайта. Также вы можете добавить сайт на главный экран телефона как PWA — работает без установки.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const { selectedRole, accentColor, setRole } = useRoleStore();

  const authSectionRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [accountFound, setAccountFound] = useState(false);
  const [verifyNavState, setVerifyNavState] = useState<Record<string, unknown> | null>(null);

  const accent = accentColor;

  const c = {
    bg:        isDark ? '#0f172a' : '#ffffff',
    surface:   isDark ? '#1e293b' : '#f8fafc',
    border:    isDark ? 'rgba(255,255,255,0.09)' : '#e5e7eb',
    text:      isDark ? '#ffffff' : '#111827',
    textSub:   isDark ? 'rgba(255,255,255,0.65)' : '#4b5563',
    textMuted: isDark ? 'rgba(255,255,255,0.38)' : '#9ca3af',
    inputBg:   isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    hoverBg:   isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
    divider:   isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9',
    headerBg:  isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'customer' ? '/customer' : '/contractor', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Default role to customer
  useEffect(() => {
    if (!selectedRole) setRole('customer');
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRoleSelect = (role: 'customer' | 'contractor') => {
    setRole(role);
    setFormError('');
    setTimeout(() => authSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneDigits = phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length >= 10;
  const formattedPhone = phone ? formatPhone(phone) : '';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || loading) return;
    setFormError('');
    setLoading(true);
    try {
      const role = selectedRole || 'customer';
      const res = await authApi.login(email.trim());
      if (res.needsPhone) {
        setStep('phone');
        return;
      }
      const navState = {
        email: email.trim(),
        role,
        devCode: res.devCode,
        channel: res.channel,
        deliveryEmail: res.deliveryEmail || email.trim(),
        telegramBotLink: res.telegramBotLink,
      };
      if (!res.isNewUser) {
        setVerifyNavState(navState);
        setAccountFound(true);
        return;
      }
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
      const role = selectedRole || 'customer';
      const res = await authApi.login(email.trim(), formattedPhone);
      navigate('/verify', {
        state: {
          email: email.trim(),
          phone: formattedPhone,
          role,
          devCode: res.devCode,
          channel: res.channel,
          deliveryEmail: res.deliveryEmail || email.trim(),
          telegramBotLink: res.telegramBotLink,
        },
      });
    } catch {
      setFormError('Ошибка. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: c.bg, color: c.text, minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: c.headerBg, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${c.border}`,
        paddingTop: 'env(safe-area-inset-top)',
      }}>
      <div style={{
        height: '3.25rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 1.25rem',
      }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', color: accent, transition: 'color 0.4s' }}>
          TrashGo
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {isAuthenticated && (
            <button
              onClick={() => navigate(user?.role === 'contractor' ? '/contractor' : '/customer')}
              style={{ fontSize: '0.8rem', color: c.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0.4rem 0.625rem', borderRadius: '0.375rem' }}
            >
              Войти в кабинет
            </button>
          )}

          <button
            onClick={toggleTheme}
            style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isDark
              ? <Sun style={{ width: '0.875rem', height: '0.875rem', color: c.textMuted }} />
              : <Moon style={{ width: '0.875rem', height: '0.875rem', color: c.textMuted }} />
            }
          </button>

          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <User style={{ width: '0.875rem', height: '0.875rem', color: c.textMuted }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '2.25rem', right: 0,
                background: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${c.border}`,
                borderRadius: '0.75rem',
                boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.08)',
                minWidth: '150px', zIndex: 100, overflow: 'hidden',
              }}>
                <DropItem
                  label={isAuthenticated ? 'Мой профиль' : 'Войти'}
                  color={c.text}
                  hoverBg={c.hoverBg}
                  onClick={() => {
                    setDropdownOpen(false);
                    if (isAuthenticated) navigate(user?.role === 'contractor' ? '/contractor' : '/customer');
                    else navigate('/login');
                  }}
                />
                {isAuthenticated && (
                  <>
                    <div style={{ height: '1px', background: c.divider }} />
                    <DropItem
                      label="Выйти"
                      color="#ef4444"
                      hoverBg={isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2'}
                      onClick={() => { useAuthStore.getState().logout(); setDropdownOpen(false); }}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        paddingTop: '8rem', paddingBottom: '4rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '8rem 1.5rem 4rem',
      }}>
        <h1 style={{ margin: 0 }}>
          <span style={{
            display: 'block',
            fontSize: 'clamp(3rem, 11vw, 6.5rem)',
            fontWeight: 900, letterSpacing: '-0.04em',
            color: accent,
            transition: 'color 0.5s cubic-bezier(0.4,0,0.2,1)',
            lineHeight: 1,
          }}>
            TrashGo
          </span>
          <span style={{
            display: 'block',
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            fontWeight: 400,
            color: c.textSub,
            marginTop: '1rem',
            lineHeight: 1.65,
            transition: 'color 0.3s',
          }}>
            Платформа для вывоза мусора.
            <br />Найдите исполнителя рядом — или начните зарабатывать сами.
          </span>
        </h1>

        {/* Role buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2.5rem' }}>
          {(['customer', 'contractor'] as const).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              style={{
                padding: '0.6rem 1.375rem',
                borderRadius: '0.5rem',
                border: `1.5px solid ${selectedRole === role ? ROLE_COLORS[role] : c.border}`,
                background: selectedRole === role ? ROLE_COLORS[role] : 'transparent',
                color: selectedRole === role ? '#ffffff' : c.text,
                fontSize: '0.875rem', fontWeight: 500,
                fontFamily: 'inherit', cursor: 'pointer',
                transition: 'border-color 0.25s, background 0.25s, color 0.25s',
              }}
            >
              {role === 'customer' ? 'Я заказчик' : 'Я исполнитель'}
            </button>
          ))}
        </div>
      </section>

      {/* ── AUTH ── */}
      <section
        ref={authSectionRef}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1.5rem 5rem' }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{
            border: `1.5px solid ${c.border}`,
            borderRadius: '1rem', padding: '1.75rem',
            background: c.surface,
          }}>
            {/* Role badge */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.2rem 0.7rem', borderRadius: '0.375rem',
                fontSize: '0.75rem', fontWeight: 600,
                background: `${accent}18`, color: accent,
                letterSpacing: '0.01em',
              }}>
                {selectedRole === 'contractor' ? 'Исполнитель' : 'Заказчик'}
              </span>
              <button
                onClick={() => handleRoleSelect(selectedRole === 'customer' ? 'contractor' : 'customer')}
                style={{ fontSize: '0.75rem', color: c.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginLeft: '0.75rem' }}
              >
                Сменить
              </button>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem', color: c.text }}>
              {accountFound ? 'Вход' : 'Регистрация'}
            </h2>
            {!accountFound && (
              <p style={{ fontSize: '0.82rem', color: c.textMuted, marginBottom: '1.375rem' }}>
                {step === 'email'
                  ? 'Введите email — пришлём код подтверждения'
                  : 'Укажите номер телефона для связи'
                }
              </p>
            )}

            {accountFound && verifyNavState ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: c.text, marginBottom: '0.375rem' }}>
                  Аккаунт уже существует
                </div>
                <div style={{ fontSize: '0.82rem', color: c.textMuted, marginBottom: '1.5rem' }}>
                  Код входа отправлен на <span style={{ color: c.text, fontWeight: 600 }}>{email}</span>
                </div>
                <button
                  onClick={() => navigate('/verify', { state: verifyNavState })}
                  style={{
                    display: 'block', width: '100%', height: '2.875rem',
                    borderRadius: '0.625rem', background: accent,
                    color: '#ffffff', fontSize: '0.875rem', fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', marginBottom: '0.75rem',
                  }}
                >
                  Войти →
                </button>
                <button
                  type="button"
                  onClick={() => { setAccountFound(false); setVerifyNavState(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: c.textMuted, fontFamily: 'inherit' }}
                >
                  ← Изменить email
                </button>
              </div>
            ) : step === 'email' ? (
              <form onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setFormError(''); setEmail(e.target.value); }}
                  autoFocus
                  style={{
                    display: 'block', width: '100%', height: '2.875rem',
                    padding: '0 0.875rem', borderRadius: '0.625rem',
                    border: `1.5px solid ${formError ? '#ef4444' : email.length > 0 ? accent : c.border}`,
                    fontSize: '1rem', outline: 'none',
                    transition: 'border-color 0.2s',
                    marginBottom: formError ? '0.375rem' : '0.75rem',
                    fontFamily: 'inherit',
                    background: c.inputBg,
                    color: c.text,
                    boxSizing: 'border-box',
                  }}
                />
                {formError && (
                  <p style={{ color: '#ef4444', fontSize: '0.76rem', marginBottom: '0.75rem' }}>{formError}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !emailValid}
                  style={{
                    display: 'block', width: '100%', height: '2.875rem',
                    borderRadius: '0.625rem', background: accent,
                    color: '#ffffff', fontSize: '0.875rem', fontWeight: 600,
                    border: 'none',
                    cursor: loading || !emailValid ? 'not-allowed' : 'pointer',
                    opacity: loading || !emailValid ? 0.4 : 1,
                    transition: 'background 0.4s, opacity 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Проверяем...' : 'Продолжить →'}
                </button>

                <p style={{ fontSize: '0.78rem', color: c.textMuted, textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
                  Уже есть аккаунт?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    style={{ color: accent, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 600, padding: 0 }}
                  >
                    Войти
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handlePhoneSubmit}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  background: `${accent}10`, marginBottom: '0.875rem',
                  fontSize: '0.82rem', color: c.text,
                }}>
                  <span>📧</span>
                  <span style={{ fontWeight: 600 }}>{email}</span>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    style={{ marginLeft: 'auto', color: c.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}
                  >
                    Изменить
                  </button>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="+7 (___) ___-__-__"
                  value={phone ? formatPhone(phone) : ''}
                  onChange={(e) => { setFormError(''); setPhone(e.target.value.replace(/\D/g, '')); }}
                  autoFocus
                  style={{
                    display: 'block', width: '100%', height: '2.875rem',
                    padding: '0 0.875rem', borderRadius: '0.625rem',
                    border: `1.5px solid ${formError ? '#ef4444' : phone.length > 0 ? accent : c.border}`,
                    fontSize: '1rem', outline: 'none',
                    transition: 'border-color 0.2s',
                    marginBottom: formError ? '0.375rem' : '0.75rem',
                    fontFamily: 'inherit',
                    background: c.inputBg,
                    color: c.text,
                    boxSizing: 'border-box',
                  }}
                />
                {formError && (
                  <p style={{ color: '#ef4444', fontSize: '0.76rem', marginBottom: '0.75rem' }}>{formError}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !phoneValid}
                  style={{
                    display: 'block', width: '100%', height: '2.875rem',
                    borderRadius: '0.625rem', background: accent,
                    color: '#ffffff', fontSize: '0.875rem', fontWeight: 600,
                    border: 'none',
                    cursor: loading || !phoneValid ? 'not-allowed' : 'pointer',
                    opacity: loading || !phoneValid ? 0.4 : 1,
                    transition: 'background 0.4s, opacity 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Отправляем...' : 'Получить код →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <h2 style={{
          fontSize: 'clamp(1.375rem, 3.5vw, 1.75rem)',
          fontWeight: 700, letterSpacing: '-0.025em',
          marginBottom: '0.375rem', color: c.text, textAlign: 'center',
        }}>
          Прозрачные условия
        </h2>
        <p style={{ fontSize: '0.9rem', color: c.textMuted, marginBottom: '2rem', textAlign: 'center' }}>
          Никаких скрытых комиссий — только фиксированный абонемент
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* Plan card */}
          <div style={{
            background: c.surface, border: `2px solid ${accent}`,
            borderRadius: '1.25rem', padding: '1.75rem', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '-0.75rem', left: '1.5rem',
              background: accent, color: '#fff',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em',
              padding: '0.2rem 0.75rem', borderRadius: '999px',
            }}>
              ПЕРВЫЙ МЕСЯЦ БЕСПЛАТНО
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: c.text, marginBottom: '0.25rem' }}>
              50₽
            </div>
            <div style={{ fontSize: '0.9rem', color: c.textMuted, marginBottom: '1.25rem' }}>/месяц</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                'Доступ для заказчиков и исполнителей',
                'Оплата за заказы — P2P через СБП, без комиссии',
                '30 дней бесплатно с момента регистрации',
                'Скидка за приглашённых друзей',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: c.textSub }}>
                  <span style={{ color: accent, fontWeight: 700, flexShrink: 0, marginTop: '0.05rem' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Referral card */}
          <div style={{
            background: c.surface, border: `1px solid ${c.border}`,
            borderRadius: '1.25rem', padding: '1.75rem',
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: c.text, marginBottom: '0.5rem' }}>
              Реферальная программа
            </div>
            <div style={{ fontSize: '0.875rem', color: c.textMuted, lineHeight: 1.7, marginBottom: '1rem' }}>
              Приглашайте друзей и снижайте стоимость своего абонемента:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { n: '1 друг', p: '40₽/мес' },
                { n: '2 друга', p: '30₽/мес' },
                { n: '3 друга', p: '20₽/мес' },
                { n: '4 друга', p: '10₽/мес' },
                { n: '5 друзей', p: 'Бесплатно!' },
              ].map(({ n, p }) => (
                <div key={n} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0.75rem', borderRadius: '0.625rem',
                  background: p === 'Бесплатно!' ? (isDark ? 'rgba(34,168,73,0.15)' : '#F0FDF4') : (isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb'),
                }}>
                  <span style={{ fontSize: '0.85rem', color: c.textSub }}>{n}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: p === 'Бесплатно!' ? '#22a849' : c.text }}>{p}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.75rem', color: c.textMuted, marginTop: '0.75rem', lineHeight: 1.5 }}>
              Скидка действует, пока приглашённый друг активно пользуется сервисом
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <h2 style={{
          fontSize: 'clamp(1.375rem, 3.5vw, 1.75rem)',
          fontWeight: 700, letterSpacing: '-0.025em',
          marginBottom: '0.375rem', color: c.text,
        }}>
          Частые вопросы
        </h2>
        <p style={{ fontSize: '0.85rem', color: c.textMuted, marginBottom: '1.75rem' }}>
          Если не нашли ответ — напишите нам в поддержку
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                borderRadius: '0.75rem', overflow: 'hidden',
                border: `1px solid ${openFaq === i ? accent : c.border}`,
                transition: 'border-color 0.2s',
                background: c.surface,
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  width: '100%', padding: '0.875rem 1rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left', gap: '1rem',
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: c.text, lineHeight: 1.4 }}>
                  {item.q}
                </span>
                <ChevronDown style={{
                  flexShrink: 0, width: '0.9rem', height: '0.9rem', color: c.textMuted,
                  transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }} />
              </button>
              {openFaq === i && (
                <div style={{
                  padding: '0 1rem 0.875rem',
                  fontSize: '0.845rem', color: c.textSub,
                  lineHeight: 1.65, animation: 'fadeIn 0.15s ease',
                }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '2.5rem 1.5rem 2rem', background: c.surface }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Privacy policy summary */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.textMuted, marginBottom: '1rem' }}>
              Политика конфиденциальности — основные положения
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.625rem' }}>
              {[
                { n: '1', t: 'Что собираем', d: 'Номер телефона, имя, район и адреса заказов. Платёжные данные и геолокация не собираются.' },
                { n: '2', t: 'Как используем', d: 'Только для работы сервиса: авторизация, создание заказов, уведомления, рейтинг.' },
                { n: '3', t: 'Не передаём данные', d: 'Данные не продаются. Партнёры видят только то, что нужно для выполнения заказа.' },
                { n: '4', t: 'Защита данных', d: 'Серверы Railway, шифрование TLS 1.3, вход через OTP — пароли не хранятся.' },
                { n: '5', t: 'Ваши права', d: 'Доступ, исправление и удаление данных по запросу в любой момент (152-ФЗ).' },
                { n: '6', t: 'Контакты', d: 'Вопросы по данным: info@vynosmusora.ru или @trashgo_support в Telegram.' },
              ].map(({ n, t, d }) => (
                <div key={n} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: '#22a84918', color: '#22a849', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: c.text, marginBottom: '0.2rem' }}>{t}</div>
                    <div style={{ fontSize: '0.72rem', color: c.textMuted, lineHeight: 1.5 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: c.textMuted }}>© 2026 TrashGo · Казань</span>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <button onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: c.textMuted, fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>Политика конфиденциальности</button>
              <button onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: c.textMuted, fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>Пользовательское соглашение</button>
            </div>
          </div>

        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

function DropItem({ label, color, hoverBg, onClick }: {
  label: string; color: string; hoverBg: string; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        width: '100%', padding: '0.6rem 0.875rem',
        fontSize: '0.82rem', fontWeight: 500, color,
        background: hovered ? hoverBg : 'none',
        border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left',
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  );
}
