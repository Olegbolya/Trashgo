import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/auth.store';
import { useRoleStore } from '../../stores/role.store';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const phone = location.state?.phone || '';
  const role = location.state?.role || 'customer';
  const devCode = location.state?.devCode as string | undefined;
  const telegramBotLink = location.state?.telegramBotLink as string | undefined;
  const channel = location.state?.channel as string | undefined;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const accent = useRoleStore((s) => s.accentColor);

  const c = {
    bg:      isDark ? '#0f172a' : '#f9fafb',
    surface: isDark ? '#1e293b' : '#ffffff',
    border:  isDark ? 'rgba(255,255,255,0.09)' : '#e5e7eb',
    text:    isDark ? '#ffffff' : '#111827',
    muted:   isDark ? 'rgba(255,255,255,0.4)' : '#6b7280',
    hint:    isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
    input:   isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verify(phone, code, role);
      if (res.isNewUser) {
        const target = role === 'contractor' ? '/register-contractor' : '/register-customer';
        navigate(target, { state: { phone, verifiedCode: code, role } });
        return;
      }
      setAuth(res.user, res.token, res.refreshToken);
      navigate(res.user.role === 'contractor' ? '/contractor' : '/customer', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Неверный или истёкший код');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.login(phone);
      toast.success('Код отправлен повторно');
    } catch {
      toast.error('Ошибка. Попробуйте позже.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: c.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: c.muted, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '0.875rem', marginBottom: '2.5rem',
            fontFamily: 'inherit',
          }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Назад
        </button>

        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', color: c.text, marginBottom: '0.375rem' }}>
          Введите код
        </h1>
        <p style={{ fontSize: '0.875rem', color: c.muted, marginBottom: '1.75rem' }}>
          {channel === 'telegram'
            ? telegramBotLink
              ? <>Откройте бота TrashGo в Telegram и он пришлёт код для <span style={{ color: c.text, fontWeight: 600 }}>{phone}</span></>
              : <>Код отправлен в ваш <span style={{ color: c.text, fontWeight: 600 }}>Telegram</span></>
            : <>Отправили SMS на <span style={{ color: c.text, fontWeight: 600 }}>{phone}</span></>
          }
        </p>

        {/* Telegram link — shown when user hasn't linked Telegram yet */}
        {telegramBotLink && (
          <a
            href={telegramBotLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: '#229ED9' + '18', border: `1px solid ${'#229ED9' + '40'}`,
              borderRadius: '0.75rem', padding: '0.875rem 1rem',
              marginBottom: '1.25rem', textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>✈️</span>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#229ED9' }}>Открыть бот TrashGo в Telegram</div>
              <div style={{ fontSize: '0.72rem', color: c.muted, marginTop: '0.125rem' }}>Бот пришлёт вам код автоматически</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#229ED9' }}>→</span>
          </a>
        )}

        {/* Dev hint — only shown when server returns devCode (dev mode) */}
        {devCode && (
          <div style={{
            background: c.hint,
            border: `1px solid ${c.border}`,
            borderRadius: '0.625rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.625rem',
          }}>
            <span style={{ fontSize: '1rem' }}>🔑</span>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: c.muted, marginBottom: '0.125rem' }}>
                Тестовый режим
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: accent, letterSpacing: '0.15em' }}>
                {devCode}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="• • • •"
            maxLength={4}
            value={code}
            onChange={(e) => { setError(''); setCode(e.target.value.replace(/\D/g, '')); }}
            style={{
              display: 'block', width: '100%', height: '3.75rem',
              padding: '0 1.25rem',
              borderRadius: '0.875rem',
              border: `2px solid ${error ? '#ef4444' : code.length > 0 ? accent : c.border}`,
              fontSize: '2rem', fontWeight: 700,
              textAlign: 'center', letterSpacing: '0.5rem',
              outline: 'none', fontFamily: 'inherit',
              background: c.input, color: c.text,
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              marginBottom: error ? '0.5rem' : '1rem',
            }}
            required
            autoFocus
          />

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 4}
            style={{
              display: 'block', width: '100%', height: '3rem',
              borderRadius: '0.875rem', background: accent,
              color: 'white', fontSize: '0.95rem', fontWeight: 700,
              border: 'none',
              cursor: loading || code.length < 4 ? 'not-allowed' : 'pointer',
              opacity: loading || code.length < 4 ? 0.45 : 1,
              transition: 'opacity 0.2s', fontFamily: 'inherit',
              marginBottom: '0.875rem',
            }}
          >
            {loading ? 'Проверяем...' : 'Подтвердить'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            style={{
              display: 'block', width: '100%', padding: '0.5rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', color: c.muted, fontFamily: 'inherit',
            }}
          >
            Отправить повторно
          </button>
        </form>
      </div>
    </div>
  );
}
