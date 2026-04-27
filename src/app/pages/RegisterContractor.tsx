import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, MapPin } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/auth.store';
import { useRoleStore } from '../../stores/role.store';
import { useTheme } from '../context/ThemeContext';

const DISTRICTS = ['Вахитовский', 'Приволжский', 'Советский', 'Ново-Савиновский', 'Московский', 'Авиастроительный', 'Кировский'];
const TRANSPORT = [
  { key: 'foot', emoji: '🚶', label: 'Пешком' },
  { key: 'car',  emoji: '🚗', label: 'Машина' },
  { key: 'truck',emoji: '🚚', label: 'Газель' },
];

export default function RegisterContractor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const accent = useRoleStore((s) => s.accentColor);
  const phone = location.state?.phone || '';
  const verifiedCode = location.state?.verifiedCode || '';
  const setAuth = useAuthStore((s) => s.setAuth);
  const [formData, setFormData] = useState({ name: '', district: 'Вахитовский', transport: 'foot' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    label:   isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    input:   isDark ? '#1f2937' : '#ffffff',
    pillBg:  isDark ? '#1f2937' : '#f3f4f6',
  };

  const inputStyle = (filled = false): React.CSSProperties => ({
    display: 'block', width: '100%', height: '3rem',
    padding: '0 1rem', borderRadius: '0.875rem',
    border: `2px solid ${filled ? accent : c.border}`,
    fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
    background: c.input, color: c.text, boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const refCode = sessionStorage.getItem('pendingRefCode') ?? undefined;
      const res = await authApi.register({ phone, code: verifiedCode, name: formData.name, role: 'contractor', district: formData.district, refCode });
      if (refCode) sessionStorage.removeItem('pendingRefCode');
      setAuth(res.user, res.token, res.refreshToken);
      navigate('/contractor');
    } catch (err: any) {
      setError(err?.message || 'Ошибка регистрации. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: c.muted, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '2.5rem', fontFamily: 'inherit' }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Назад
        </button>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: c.text, marginBottom: '0.375rem' }}>
          Заполните профиль
        </h1>
        <p style={{ fontSize: '0.9rem', color: c.muted, marginBottom: '2rem' }}>
          Эти данные помогут найти заказы рядом с вами
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: c.label, marginBottom: '0.375rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Как к вам обращаться
              </label>
              <input
                placeholder="Дмитрий"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle(!!formData.name)}
                required
              />
            </div>

            {/* District */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: c.label, marginBottom: '0.375rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Район работы
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.1rem', height: '1.1rem', color: c.muted, pointerEvents: 'none' }} />
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  style={{ ...inputStyle(true), paddingLeft: '2.5rem', appearance: 'none', cursor: 'pointer' }}
                >
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Transport */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: c.label, marginBottom: '0.75rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Транспорт
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {TRANSPORT.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, transport: t.key })}
                    style={{
                      flex: 1, padding: '0.875rem 0.5rem',
                      borderRadius: '0.875rem',
                      border: `2px solid ${formData.transport === t.key ? accent : c.border}`,
                      background: formData.transport === t.key ? `${accent}12` : c.surface,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'border-color 0.2s ease, background 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t.emoji}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: c.text }}>{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '0.875rem 1rem', borderRadius: '0.875rem', background: `${accent}12`, border: `1px solid ${accent}30` }}>
              <p style={{ fontSize: '0.85rem', color: c.text, margin: 0 }}>
                💡 Исполнители с транспортом берут крупногабаритные заказы по более высокой цене
              </p>
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'block', width: '100%', height: '3.25rem',
                borderRadius: '0.875rem', background: accent,
                color: 'white', fontSize: '1rem', fontWeight: 700,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'opacity 0.2s ease', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Регистрируем...' : 'Начать зарабатывать →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
