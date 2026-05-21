import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, MapPin } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/auth.store';
import { useRoleStore } from '../../stores/role.store';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const accent = useRoleStore((s) => s.accentColor);
  const email = location.state?.email as string | undefined;
  const phone = location.state?.phone || '';
  const verifiedCode = location.state?.verifiedCode || '';
  const setAuth = useAuthStore((s) => s.setAuth);
  const [formData, setFormData] = useState({ name: '', address: '', entrance: '', floor: '', apartment: '' });
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
    const district = [
      formData.address,
      formData.entrance ? `подъезд ${formData.entrance}` : '',
      formData.floor ? `этаж ${formData.floor}` : '',
      formData.apartment ? `кв. ${formData.apartment}` : '',
    ].filter(Boolean).join(', ');
    try {
      const refCode = sessionStorage.getItem('pendingRefCode') ?? undefined;
      const res = await authApi.register({ email, phone, code: verifiedCode, name: formData.name, role: 'customer', district, refCode });
      sessionStorage.removeItem('pendingRefCode');
      sessionStorage.removeItem('pendingRefRole');
      setAuth(res.user, res.token, res.refreshToken);
      navigate('/customer');
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
          Эти данные помогут исполнителям найти вас
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: c.label, marginBottom: '0.375rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Как к вам обращаться
              </label>
              <input
                placeholder="Александр"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle(!!formData.name)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: c.label, marginBottom: '0.375rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Адрес
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.1rem', height: '1.1rem', color: c.muted, pointerEvents: 'none' }} />
                <input
                  placeholder="ул. Баумана, 58"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ ...inputStyle(!!formData.address), paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: c.label, marginBottom: '0.375rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Подъезд</label>
                <input placeholder="1" value={formData.entrance} onChange={(e) => setFormData({ ...formData, entrance: e.target.value })} style={inputStyle(!!formData.entrance)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: c.label, marginBottom: '0.375rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Этаж</label>
                <input placeholder="5" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} style={inputStyle(!!formData.floor)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: c.label, marginBottom: '0.375rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Квартира</label>
                <input placeholder="42" value={formData.apartment} onChange={(e) => setFormData({ ...formData, apartment: e.target.value })} style={inputStyle(!!formData.apartment)} />
              </div>
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
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Регистрируем...' : 'Начать пользоваться →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
