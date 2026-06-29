import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useRoleStore } from '../../stores/role.store';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import { startVkOAuth } from '../../lib/vkid';

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').replace(/^7/, '').replace(/^8/, '').slice(0, 10);
  let result = '+7';
  if (digits.length > 0) result += ' (' + digits.slice(0, 3);
  if (digits.length >= 4) result += ') ' + digits.slice(3, 6);
  if (digits.length >= 7) result += '-' + digits.slice(6, 8);
  if (digits.length >= 9) result += '-' + digits.slice(8, 10);
  return result;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const pendingRefRole = sessionStorage.getItem('pendingRefRole') as 'customer' | 'contractor' | null;
  const pendingRefCode = sessionStorage.getItem('pendingRefCode');
  const role = (location.state?.role || pendingRefRole || 'customer') as 'customer' | 'contractor';
  const { accentColor, setRole } = useRoleStore();
  const accent = accentColor;

  const bg      = isDark ? '#0f172a' : '#f8fafc';
  const surface = isDark ? '#1e293b' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const text    = isDark ? '#f1f5f9' : '#0f172a';
  const muted   = isDark ? 'rgba(255,255,255,0.45)' : '#64748b';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const subtle  = isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9';

  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailStep, setEmailStep] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [vkLoading, setVkLoading] = useState(false);

  useEffect(() => {
    if (role === 'contractor' || role === 'customer') setRole(role);
  }, [role, setRole]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneDigits = phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length >= 10;

  const handleVkLogin = async () => {
    setVkLoading(true);
    try {
      await startVkOAuth();
    } catch {
      toast.error('Не удалось запустить вход через VK. Попробуйте ещё раз.');
      setVkLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || loading) return;
    setLoading(true);
    try {
      const res = await authApi.login(email.trim());
      if (res.needsPhone) {
        setEmailStep('phone');
        return;
      }
      navigate('/verify', {
        state: {
          email: email.trim(),
          role,
          isNewUser: res.isNewUser,
          devCode: res.devCode,
          channel: res.channel,
          deliveryEmail: res.deliveryEmail || email.trim(),
          telegramBotLink: res.telegramBotLink,
        },
      });
    } catch {
      toast.error('Ошибка. Проверьте email и попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid || loading) return;
    setLoading(true);
    try {
      const fp = formatPhone(phone);
      const res = await authApi.login(email.trim(), fp);
      navigate('/verify', {
        state: {
          email: email.trim(),
          phone: fp,
          role,
          isNewUser: true,
          devCode: res.devCode,
          channel: res.channel,
          deliveryEmail: res.deliveryEmail || email.trim(),
        },
      });
    } catch {
      toast.error('Ошибка. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <button
          onClick={() => {
            if (emailStep === 'phone') { setEmailStep('email'); return; }
            if (showEmail) { setShowEmail(false); return; }
            navigate('/');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: muted, fontFamily: 'inherit', fontSize: '0.875rem', marginBottom: '2rem', padding: 0 }}
        >
          <ArrowLeft size={18} />
          Назад
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <img src="/icon-192.png" alt="TrashGo" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: text }}>TrashGo</div>
              <div style={{ fontSize: '0.8rem', color: muted }}>Вывоз мусора, Казань</div>
            </div>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: text, margin: 0 }}>Вход или регистрация</h1>
          <p style={{ color: muted, fontSize: '0.875rem', margin: '0.5rem 0 0' }}>
            Войдите, чтобы заказывать или вывозить мусор
          </p>
        </div>

        {pendingRefCode && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '0.875rem 1.25rem', background: `${accent}12`, border: `1.5px solid ${accent}40`, borderRadius: 14, marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🎁</span>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: accent }}>
                {pendingRefRole === 'contractor' ? 'Вас приглашают как исполнителя' : 'Вас пригласили в TrashGo'}
              </div>
              <div style={{ fontSize: '0.78rem', color: muted, marginTop: 2 }}>
                {pendingRefRole === 'contractor'
                  ? 'Зарегистрируйтесь — выполняйте заказы и зарабатывайте рядом с домом'
                  : 'Зарегистрируйтесь и воспользуйтесь реферальной скидкой'}
              </div>
            </div>
          </div>
        )}

        {!showEmail ? (
          /* ── Primary: VK ID ── */
          <div style={{ background: surface, borderRadius: 20, padding: '1.75rem', border: `1px solid ${border}`, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.06)' }}>

            {/* VK button */}
            <button
              onClick={handleVkLogin}
              disabled={vkLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                width: '100%', height: '3.25rem', borderRadius: 14,
                background: vkLoading ? (isDark ? '#1a3a6b' : '#4a9fd4') : 'linear-gradient(135deg, #2787F5, #5BABFF)',
                color: '#fff', border: 'none', fontFamily: 'inherit',
                fontSize: '1rem', fontWeight: 700, cursor: vkLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(39,135,245,0.4)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.6-.19 1.37 1.26 2.185 1.815.617.422 1.086.33 1.086.33l2.182-.03s1.14-.071.6-.968c-.044-.073-.314-.661-1.618-1.869-1.365-1.261-1.183-1.057.462-3.237.999-1.332 1.398-2.146 1.272-2.494-.12-.332-.855-.244-.855-.244l-2.454.015s-.182-.025-.317.055c-.133.079-.218.262-.218.262s-.387 1.03-.903 1.906c-1.088 1.848-1.523 1.947-1.7 1.832-.413-.267-.31-1.075-.31-1.648 0-1.793.272-2.54-.529-2.733-.266-.064-.461-.107-1.141-.114-.872-.009-1.609.003-2.027.207-.278.136-.492.439-.362.456.161.021.527.099.72.363.25.341.241 1.107.241 1.107s.144 2.11-.335 2.372c-.328.179-.778-.187-1.745-1.858-.496-.858-.87-1.807-.87-1.807s-.072-.176-.203-.271c-.158-.115-.378-.151-.378-.151l-2.33.015s-.35.01-.478.162C4.003 7.73 4.102 8.05 4.102 8.05s1.822 4.265 3.882 6.414c1.891 1.973 4.039 1.843 4.039 1.843l1.762-.016z" fill="white"/>
              </svg>
              {vkLoading ? 'Переходим в VK...' : 'Войти через VK ID'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.375rem 0' }}>
              <div style={{ flex: 1, height: 1, background: border }} />
              <span style={{ fontSize: '0.75rem', color: muted, fontWeight: 500 }}>или</span>
              <div style={{ flex: 1, height: 1, background: border }} />
            </div>

            {/* Email fallback */}
            <button
              onClick={() => setShowEmail(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', height: '3rem', borderRadius: 12,
                background: subtle, color: text, border: `1.5px solid ${border}`,
                fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>📧</span>
              Войти по email
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.74rem', color: muted, margin: '1.25rem 0 0' }}>
              Нажимая кнопку, вы принимаете{' '}
              <a href="/privacy" style={{ color: muted, textDecoration: 'underline' }}>политику конфиденциальности</a>
            </p>
          </div>
        ) : emailStep === 'email' ? (
          /* ── Email form ── */
          <div style={{ background: surface, borderRadius: 20, padding: '1.75rem', border: `1px solid ${border}`, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: text, marginBottom: '1.25rem' }}>Вход по email</div>
            <form onSubmit={handleEmailSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                  Email *
                </label>
                <input
                  type="email"
                  inputMode="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  required
                  style={{
                    display: 'block', width: '100%', height: '3rem', padding: '0 1rem',
                    borderRadius: 12, border: `2px solid ${email.trim() ? accent : border}`,
                    fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
                    background: inputBg, color: text, boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !emailValid}
                style={{
                  width: '100%', height: '3rem', borderRadius: 12,
                  background: emailValid ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : (isDark ? '#374151' : '#e5e7eb'),
                  color: emailValid ? '#fff' : muted,
                  border: 'none', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 700,
                  cursor: emailValid ? 'pointer' : 'not-allowed',
                  boxShadow: emailValid ? `0 4px 16px ${accent}40` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Проверяем...' : 'Продолжить →'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.375rem 0' }}>
              <div style={{ flex: 1, height: 1, background: border }} />
              <span style={{ fontSize: '0.75rem', color: muted, fontWeight: 500 }}>или</span>
              <div style={{ flex: 1, height: 1, background: border }} />
            </div>

            <button
              onClick={() => setShowEmail(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', height: '3rem', borderRadius: 12,
                background: 'linear-gradient(135deg, #2787F5, #5BABFF)',
                color: '#fff', border: 'none', fontFamily: 'inherit',
                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(39,135,245,0.3)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.6-.19 1.37 1.26 2.185 1.815.617.422 1.086.33 1.086.33l2.182-.03s1.14-.071.6-.968c-.044-.073-.314-.661-1.618-1.869-1.365-1.261-1.183-1.057.462-3.237.999-1.332 1.398-2.146 1.272-2.494-.12-.332-.855-.244-.855-.244l-2.454.015s-.182-.025-.317.055c-.133.079-.218.262-.218.262s-.387 1.03-.903 1.906c-1.088 1.848-1.523 1.947-1.7 1.832-.413-.267-.31-1.075-.31-1.648 0-1.793.272-2.54-.529-2.733-.266-.064-.461-.107-1.141-.114-.872-.009-1.609.003-2.027.207-.278.136-.492.439-.362.456.161.021.527.099.72.363.25.341.241 1.107.241 1.107s.144 2.11-.335 2.372c-.328.179-.778-.187-1.745-1.858-.496-.858-.87-1.807-.87-1.807s-.072-.176-.203-.271c-.158-.115-.378-.151-.378-.151l-2.33.015s-.35.01-.478.162C4.003 7.73 4.102 8.05 4.102 8.05s1.822 4.265 3.882 6.414c1.891 1.973 4.039 1.843 4.039 1.843l1.762-.016z" fill="white"/>
              </svg>
              Войти через VK ID
            </button>
          </div>
        ) : (
          /* ── Phone step (new user via email) ── */
          <div style={{ background: surface, borderRadius: 20, padding: '1.75rem', border: `1px solid ${border}`, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 0.875rem', borderRadius: 10, background: `${accent}12`, marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1rem' }}>📧</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: text }}>{email}</span>
              <button onClick={() => setEmailStep('email')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: muted, fontFamily: 'inherit' }}>Изменить</button>
            </div>
            <form onSubmit={handlePhoneSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                  Телефон *
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone ? formatPhone(phone) : ''}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                  style={{
                    display: 'block', width: '100%', height: '3rem', padding: '0 1rem',
                    borderRadius: 12, border: `2px solid ${phoneValid ? accent : border}`,
                    fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
                    background: inputBg, color: text, boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />
                <p style={{ fontSize: '0.74rem', color: muted, marginTop: 6 }}>Нужен заказчику / исполнителю для связи. Не передаётся третьим лицам.</p>
              </div>
              <button
                type="submit"
                disabled={loading || !phoneValid}
                style={{
                  width: '100%', height: '3rem', borderRadius: 12,
                  background: phoneValid ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : (isDark ? '#374151' : '#e5e7eb'),
                  color: phoneValid ? '#fff' : muted,
                  border: 'none', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 700,
                  cursor: phoneValid ? 'pointer' : 'not-allowed',
                  boxShadow: phoneValid ? `0 4px 16px ${accent}40` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Отправляем...' : 'Получить код на почту →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
