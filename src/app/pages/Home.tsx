import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { User, Moon, Sun, ChevronUp } from 'lucide-react';
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

export default function Home() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const { selectedRole, accentColor, setRole } = useRoleStore();

  const authSectionRef = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const accent = accentColor;
  const accentShadow = selectedRole ? `${ROLE_COLORS[selectedRole]}30` : 'transparent';

  const handleRoleSelect = (role: 'customer' | 'contractor') => {
    setRole(role);
    setTimeout(() => {
      authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || phone.replace(/\D/g, '').length < 10) return;
    const formattedPhone = formatPhone(phone);
    setLoading(true);
    try {
      const res = await authApi.login(formattedPhone);
      if (res.devCode) toast.info(`Код для входа: ${res.devCode}`, { duration: 30000 });
      navigate('/verify', { state: { phone: formattedPhone, role: selectedRole, isNewUser: res.isNewUser } });
    } catch {
      toast.error('Ошибка. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'contractor' ? '/contractor' : '/customer');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }} className="bg-white text-black">

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

        {/* Top-right controls */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          {!isAuthenticated && (
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
              title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            >
              {isDark
                ? <Sun className="w-5 h-5 text-gray-600" />
                : <Moon className="w-5 h-5 text-gray-600" />
              }
            </button>
          )}
          <button
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
            title={isAuthenticated ? 'Профиль' : 'Войти'}
          >
            <User className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Center content */}
        <div className="max-w-2xl w-full text-center">

          {/* Title */}
          <h1 className="mb-4 leading-none">
            <span
              style={{
                color: accent,
                transition: 'color 0.5s cubic-bezier(0.4,0,0.2,1)',
                fontSize: 'clamp(3rem, 10vw, 6rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                display: 'block',
              }}
            >
              TrashGo
            </span>
            <span
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
                fontWeight: 300,
                letterSpacing: '-0.01em',
                color: '#374151',
                display: 'block',
                marginTop: '0.75rem',
                lineHeight: 1.5,
              }}
            >
              — платформа для вывоза мусора с геймификацией
              <br className="hidden sm:block" /> и системой поиска подрядчиков
            </span>
          </h1>

          {/* Role cards */}
          <div className="grid sm:grid-cols-2 gap-4 mt-12">

            {/* Заказчик */}
            <button
              onClick={() => handleRoleSelect('customer')}
              style={{
                borderColor: selectedRole === 'customer' ? ROLE_COLORS.customer : '#e5e7eb',
                boxShadow: selectedRole === 'customer'
                  ? `0 0 0 4px ${ROLE_COLORS.customer}22, 0 4px 24px ${ROLE_COLORS.customer}18`
                  : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'border-color 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}
              className="border-2 rounded-2xl p-7 text-left bg-white hover:border-[#66BB6A] group"
            >
              <div
                style={{
                  background: selectedRole === 'customer' ? `${ROLE_COLORS.customer}15` : '#f9fafb',
                  transition: 'background 0.4s ease',
                }}
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl"
              >
                📦
              </div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  marginBottom: '0.375rem',
                }}
              >
                Стать заказчиком
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>
                Создавайте заказы и выбирайте исполнителей рядом с домом
              </p>
            </button>

            {/* Исполнитель */}
            <button
              onClick={() => handleRoleSelect('contractor')}
              style={{
                borderColor: selectedRole === 'contractor' ? ROLE_COLORS.contractor : '#e5e7eb',
                boxShadow: selectedRole === 'contractor'
                  ? `0 0 0 4px ${ROLE_COLORS.contractor}22, 0 4px 24px ${ROLE_COLORS.contractor}18`
                  : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'border-color 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}
              className="border-2 rounded-2xl p-7 text-left bg-white hover:border-[#2196F3] group"
            >
              <div
                style={{
                  background: selectedRole === 'contractor' ? `${ROLE_COLORS.contractor}15` : '#f9fafb',
                  transition: 'background 0.4s ease',
                }}
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl"
              >
                💼
              </div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  marginBottom: '0.375rem',
                }}
              >
                Стать исполнителем
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>
                Берите заказы рядом с домом и зарабатывайте по своему графику
              </p>
            </button>
          </div>

          {/* Scroll hint */}
          {selectedRole && (
            <p
              style={{
                marginTop: '2rem',
                fontSize: '0.8rem',
                color: '#9ca3af',
                animation: 'fadeIn 0.4s ease',
              }}
            >
              Прокрутите вниз ↓
            </p>
          )}
        </div>
      </section>

      {/* ── AUTH SECTION ── */}
      <section
        ref={authSectionRef}
        className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
      >
        {selectedRole ? (
          <div className="w-full max-w-md">

            {/* Role badge */}
            <div className="flex items-center gap-2 mb-8">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: `${accent}15`,
                  color: accent,
                  transition: 'background 0.5s ease, color 0.5s ease',
                }}
              >
                {selectedRole === 'customer' ? '📦 Заказчик' : '💼 Исполнитель'}
              </span>
              <button
                onClick={() => {
                  const other = selectedRole === 'customer' ? 'contractor' : 'customer';
                  handleRoleSelect(other);
                }}
                style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                }}
                className="hover:text-gray-600 transition-colors"
              >
                Сменить роль
              </button>
            </div>

            {/* Card */}
            <div
              style={{
                borderColor: accent,
                boxShadow: `0 0 0 1px ${accentShadow}, 0 8px 40px ${accentShadow}`,
                transition: 'border-color 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s cubic-bezier(0.4,0,0.2,1)',
              }}
              className="border-2 rounded-3xl p-8 bg-white"
            >
              <h2
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  marginBottom: '0.5rem',
                }}
              >
                Вход или регистрация
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.75rem' }}>
                Введите номер телефона — отправим код подтверждения
              </p>

              <form onSubmit={handlePhoneSubmit}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  Номер телефона
                </label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone ? formatPhone(phone) : ''}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '3.25rem',
                    padding: '0 1rem',
                    borderRadius: '0.875rem',
                    border: `2px solid ${inputFocused || phone.length > 0 ? accent : '#e5e7eb'}`,
                    fontSize: '1.125rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    marginBottom: '1rem',
                    fontFamily: 'inherit',
                    background: 'white',
                    color: '#111827',
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, '').length < 10}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '3.25rem',
                    borderRadius: '0.875rem',
                    background: accent,
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    border: 'none',
                    cursor: loading || phone.replace(/\D/g, '').length < 10 ? 'not-allowed' : 'pointer',
                    opacity: loading || phone.replace(/\D/g, '').length < 10 ? 0.6 : 1,
                    transition: 'background 0.5s ease, opacity 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Отправляем...' : 'Получить код →'}
                </button>
              </form>
            </div>

            {/* Back to top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-6 w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
              Вернуться к выбору роли
            </button>
          </div>
        ) : (
          /* If no role selected yet — prompt to scroll up */
          <div className="text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex flex-col items-center gap-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronUp className="w-6 h-6" />
              <span style={{ fontSize: '0.9rem' }}>Выберите роль выше</span>
            </button>
          </div>
        )}
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
