import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/auth.store';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

const DISTRICTS = [
  'Авиастроительный', 'Вахитовский', 'Кировский', 'Московский',
  'Ново-Савиновский', 'Приволжский', 'Советский',
];

export default function RegisterVk() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const phone = location.state?.phone as string ?? '';
  const vkName = location.state?.name as string ?? '';
  const tempToken = location.state?.tempToken as string ?? '';
  const refCode = sessionStorage.getItem('pendingRefCode') ?? undefined;

  const setAuth = useAuthStore((s) => s.setAuth);

  const [role, setRole] = useState<'customer' | 'contractor' | ''>('');
  const [name, setName] = useState(vkName);
  const [district, setDistrict] = useState('');
  const [transportMode, setTransportMode] = useState('');
  const [inn, setInn] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Регистрация через VK — TrashGo';
    return () => { document.title = 'TrashGo — Вывоз мусора в Казани'; };
  }, []);

  if (!tempToken || !phone) {
    navigate('/login', { replace: true });
    return null;
  }

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const surface = isDark ? '#1e293b' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const text = isDark ? '#f1f5f9' : '#0f172a';
  const muted = isDark ? 'rgba(255,255,255,0.45)' : '#64748b';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';

  const customerAccent = '#22c55e';
  const contractorAccent = '#3b82f6';
  const accent = role === 'contractor' ? contractorAccent : customerAccent;

  const canSubmit = role && name.trim() && district;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const res = await authApi.registerVkid({
        tempToken,
        name: name.trim(),
        role: role as 'customer' | 'contractor',
        district,
        ...(transportMode ? { transportMode } : {}),
        ...(inn ? { inn } : {}),
        ...(refCode ? { refCode } : {}),
      });
      if (refCode) sessionStorage.removeItem('pendingRefCode');
      setAuth(res.user, res.token, res.refreshToken);
      toast.success('Добро пожаловать в TrashGo!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <img src="/icon-192.png" alt="TrashGo" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: text }}>TrashGo</div>
              <div style={{ fontSize: '0.8rem', color: muted }}>Вывоз мусора, Казань</div>
            </div>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: text, margin: 0 }}>Завершите регистрацию</h1>
          <p style={{ color: muted, fontSize: '0.875rem', margin: '0.5rem 0 0' }}>
            Номер подтверждён через VK ID
          </p>
        </div>

        {/* VK verified badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1.25rem',
          background: isDark ? 'rgba(39,135,245,0.12)' : '#eff6ff',
          border: `1.5px solid ${isDark ? 'rgba(39,135,245,0.3)' : '#bfdbfe'}`,
          borderRadius: 14, marginBottom: '1.5rem',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #2787F5, #5BABFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: '1.25rem' }}>✓</span>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: text }}>VK ID подтверждён</div>
            <div style={{ fontSize: '0.78rem', color: muted }}>{phone}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Role selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Я хочу</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { val: 'customer' as const, icon: '📦', label: 'Заказывать вывоз мусора', accent: customerAccent },
                { val: 'contractor' as const, icon: '🚛', label: 'Вывозить мусор и зарабатывать', accent: contractorAccent },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setRole(opt.val)}
                  style={{
                    padding: '1rem 0.75rem', borderRadius: 14, cursor: 'pointer',
                    border: `2px solid ${role === opt.val ? opt.accent : border}`,
                    background: role === opt.val ? `${opt.accent}12` : surface,
                    textAlign: 'left', fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{opt.icon}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: role === opt.val ? opt.accent : text, lineHeight: 1.3 }}>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Ваше имя *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Как вас зовут?"
              required
              style={{
                display: 'block', width: '100%', height: '3rem', padding: '0 1rem',
                borderRadius: 12, border: `2px solid ${name.trim() && role ? accent : border}`,
                fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
                background: inputBg, color: text, boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* District */}
          <div style={{ marginBottom: role === 'contractor' ? '1rem' : '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Район *
            </label>
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              required
              style={{
                display: 'block', width: '100%', height: '3rem', padding: '0 1rem',
                borderRadius: 12, border: `2px solid ${district && role ? accent : border}`,
                fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
                background: inputBg, color: district ? text : muted, boxSizing: 'border-box',
                transition: 'border-color 0.2s', cursor: 'pointer', appearance: 'none',
              }}
            >
              <option value="">Выберите район</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Contractor extras */}
          {role === 'contractor' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Транспорт
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { val: 'pedestrian', icon: '🚶', label: 'Пешком' },
                    { val: 'scooter',    icon: '🛴', label: 'Самокат' },
                    { val: 'bicycle',    icon: '🚲', label: 'Велосипед' },
                    { val: 'e-bicycle',  icon: '⚡🚲', label: 'Электровело' },
                    { val: 'moto',       icon: '🏍️', label: 'Мото' },
                    { val: 'car',        icon: '🚗', label: 'Авто' },
                  ].map(t => (
                    <button key={t.val} type="button" onClick={() => setTransportMode(t.val)}
                      style={{
                        padding: '0.625rem 0.5rem', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${transportMode === t.val ? contractorAccent : border}`,
                        background: transportMode === t.val ? `${contractorAccent}12` : surface,
                        fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600,
                        color: transportMode === t.val ? contractorAccent : muted,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '1.25rem', marginBottom: 2 }}>{t.icon}</div>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  ИНН самозанятого <span style={{ color: muted, fontWeight: 400, fontSize: '0.75rem', textTransform: 'none', letterSpacing: 0 }}>(необязательно)</span>
                </label>
                <input
                  type="text"
                  value={inn}
                  onChange={e => setInn(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="000000000000"
                  inputMode="numeric"
                  style={{
                    display: 'block', width: '100%', height: '3rem', padding: '0 1rem',
                    borderRadius: 12, border: `2px solid ${border}`,
                    fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
                    background: inputBg, color: text, boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            style={{
              width: '100%', height: '3.25rem', borderRadius: 14,
              background: canSubmit ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : (isDark ? '#374151' : '#e5e7eb'),
              color: canSubmit ? 'white' : muted,
              border: 'none', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', letterSpacing: '-0.01em',
              boxShadow: canSubmit ? `0 4px 20px ${accent}40` : 'none',
            }}
          >
            {loading ? 'Создаём аккаунт...' : 'Начать пользоваться TrashGo'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: muted, marginTop: '1.25rem' }}>
          Нажимая кнопку, вы принимаете{' '}
          <a href="/privacy" style={{ color: muted, textDecoration: 'underline' }}>политику конфиденциальности</a>
        </p>
      </div>
    </div>
  );
}
