import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, Moon, Sun, ChevronDown, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { useRoleStore, ROLE_COLORS } from '../../stores/role.store';
import { authApi } from '../../api/auth';
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

const FAQ_ITEMS = [
  {
    q: 'Как оставить заявку на вывоз мусора?',
    a: 'Выберите роль «Заказчик», войдите по номеру телефона и нажмите «Создать заявку». Укажите адрес, объём и удобное время — исполнители в вашем районе увидят заявку и откликнутся.',
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
    a: 'Все исполнители проходят верификацию по номеру телефона. Профиль каждого содержит рейтинг, отзывы и историю заказов — вы видите, кому открываете дверь.',
  },
  {
    q: 'Что делать, если исполнитель не приехал?',
    a: 'Напишите в поддержку через раздел «Помощь» в профиле. Мы оперативно разберём ситуацию и при необходимости найдём другого исполнителя или вернём средства.',
  },
  {
    q: 'Есть ли мобильное приложение?',
    a: 'TrashGo уже адаптирован для мобильных браузеров — добавьте сайт на главный экран телефона. Нативное приложение для iOS и Android сейчас в разработке.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { selectedRole, accentColor, setRole } = useRoleStore();

  const authSectionRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    pillBg:    isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
    divider:   isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9',
    headerBg:  isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
  };

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
    setPhoneError('');
    setTimeout(() => authSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    const digits = phone.replace(/\D/g, '').replace(/^7/, '').replace(/^8/, '');
    if (digits.length < 10) { setPhoneError('Введите полный номер телефона'); return; }
    if (!selectedRole) { setPhoneError('Сначала выберите роль выше'); return; }
    const formattedPhone = formatPhone(phone);
    setLoading(true);
    try {
      const res = await authApi.login(formattedPhone);
      if (res.devCode) toast.info(`Код для входа: ${res.devCode}`, { duration: 30000 });
      navigate('/verify', { state: { phone: formattedPhone, role: selectedRole, isNewUser: res.isNewUser } });
    } catch {
      setPhoneError('Ошибка отправки кода. Проверьте номер и попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const phoneDigits = phone.replace(/\D/g, '').replace(/^7/, '').replace(/^8/, '');
  const phoneReady = phoneDigits.length >= 10;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: c.bg, color: c.text, minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '3.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem', zIndex: 50,
        background: c.headerBg, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${c.border}`,
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
                    else { if (!selectedRole) setRole('customer'); authSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); }
                  }}
                />
                {isAuthenticated && (
                  <>
                    <div style={{ height: '1px', background: c.divider }} />
                    <DropItem
                      label="Выйти"
                      color="#ef4444"
                      hoverBg={isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2'}
                      onClick={() => { logout(); setDropdownOpen(false); }}
                    />
                  </>
                )}
              </div>
            )}
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
        {selectedRole ? (
          <div style={{ width: '100%', maxWidth: '380px' }}>
            <div style={{
              border: `1.5px solid ${c.border}`,
              borderRadius: '1rem', padding: '1.75rem',
              background: c.surface,
            }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.7rem', borderRadius: '0.375rem',
                  fontSize: '0.75rem', fontWeight: 600,
                  background: `${accent}18`, color: accent,
                  letterSpacing: '0.01em',
                }}>
                  {selectedRole === 'customer' ? 'Заказчик' : 'Исполнитель'}
                </span>
                <button
                  onClick={() => handleRoleSelect(selectedRole === 'customer' ? 'contractor' : 'customer')}
                  style={{ fontSize: '0.75rem', color: c.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginLeft: '0.75rem' }}
                >
                  Сменить
                </button>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem', color: c.text }}>
                Вход или регистрация
              </h2>
              <p style={{ fontSize: '0.82rem', color: c.textMuted, marginBottom: '1.375rem' }}>
                Введите номер телефона — пришлём код
              </p>

              <form onSubmit={handlePhoneSubmit}>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="+7 (___) ___-__-__"
                  value={phone ? formatPhone(phone) : ''}
                  onChange={(e) => { setPhoneError(''); setPhone(e.target.value.replace(/\D/g, '')); }}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  style={{
                    display: 'block', width: '100%', height: '2.875rem',
                    padding: '0 0.875rem', borderRadius: '0.625rem',
                    border: `1.5px solid ${phoneError ? '#ef4444' : inputFocused || phone.length > 0 ? accent : c.border}`,
                    fontSize: '1rem', outline: 'none',
                    transition: 'border-color 0.2s',
                    marginBottom: phoneError ? '0.375rem' : '0.75rem',
                    fontFamily: 'inherit',
                    background: c.inputBg,
                    color: c.text,
                    boxSizing: 'border-box',
                  }}
                />
                {phoneError && (
                  <p style={{ color: '#ef4444', fontSize: '0.76rem', marginBottom: '0.75rem' }}>{phoneError}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !phoneReady}
                  style={{
                    display: 'block', width: '100%', height: '2.875rem',
                    borderRadius: '0.625rem', background: accent,
                    color: '#ffffff', fontSize: '0.875rem', fontWeight: 600,
                    border: 'none',
                    cursor: loading || !phoneReady ? 'not-allowed' : 'pointer',
                    opacity: loading || !phoneReady ? 0.4 : 1,
                    transition: 'background 0.4s, opacity 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Отправляем...' : 'Получить код'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: c.textMuted, textAlign: 'center' }}>
            Выберите роль выше, чтобы продолжить
          </p>
        )}
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
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '1.25rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.78rem', color: c.textMuted, margin: 0 }}>
          © 2026 TrashGo · Казань
        </p>
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
