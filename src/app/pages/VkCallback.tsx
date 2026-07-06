import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/auth.store';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

export default function VkCallback() {
  const navigate = useNavigate();
  const processing = useRef(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { isDark } = useTheme();

  useEffect(() => {
    if (processing.current) return;
    processing.current = true;

    // Implicit flow: access_token is in the URL hash fragment (#access_token=...&user_id=...&state=...)
    // Errors from VK come as query params (?error=...)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(window.location.search);

    const access_token = hashParams.get('access_token');
    const user_id = hashParams.get('user_id');
    const state = hashParams.get('state') ?? queryParams.get('state');
    const savedState = localStorage.getItem('vkid_state');
    localStorage.removeItem('vkid_state');

    const vkError = queryParams.get('error');
    if (vkError) {
      const desc = queryParams.get('error_description') ?? vkError;
      toast.error(`Вход через VK отменён: ${desc}`);
      navigate('/login', { replace: true });
      return;
    }

    if (!access_token) {
      toast.error('Не удалось войти через VK. Попробуйте снова.');
      navigate('/login', { replace: true });
      return;
    }

    if (state && savedState && state !== savedState) {
      toast.error('Ошибка безопасности, попробуйте снова');
      navigate('/login', { replace: true });
      return;
    }

    authApi.vkidExchange({ access_token, user_id: user_id ?? undefined })
      .then((res) => {
        if (res.isNewUser) {
          navigate('/register-vk', {
            replace: true,
            state: { phone: res.phone, name: res.name, tempToken: res.tempToken },
          });
        } else if (res.user && res.token && res.refreshToken) {
          setAuth(res.user, res.token, res.refreshToken);
          navigate('/dashboard', { replace: true });
        } else {
          toast.error('Ошибка входа');
          navigate('/login', { replace: true });
        }
      })
      .catch((err) => {
        toast.error(err?.message || 'Ошибка входа через VK');
        navigate('/login', { replace: true });
      });
  }, []);

  const bg   = isDark ? '#0f172a' : '#f9fafb';
  const text  = isDark ? '#f1f5f9' : '#111827';
  const muted = isDark ? '#94a3b8' : '#6b7280';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2787F5, #5BABFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem', fontSize: '1.5rem',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14.5 4.5C9 4.5 4.5 9 4.5 14.5S9 24.5 14.5 24.5 24.5 20 24.5 14.5 20 4.5 14.5 4.5zm6.3 10.2c-.3.4-.9 1-1.7 1.7l-.2.2c-.5.5-.8.9-.8 1.3 0 .2.1.5.4.8l.1.1c.6.5 1.1 1.1 1.4 1.7.1.2.2.4.2.6 0 .4-.2.8-.6.8h-2.1c-.3 0-.6-.1-.9-.3-.3-.2-.5-.5-.5-.8 0-.2.1-.4.2-.6.1-.2.3-.4.5-.6.2-.2.3-.4.3-.6 0-.2-.1-.4-.3-.6-.5-.5-1-.9-1.4-1.1-.2-.1-.4-.2-.6-.2-.3 0-.5.1-.8.3-.3.2-.4.5-.4.8v2.7c0 .3-.1.5-.3.7-.2.2-.5.3-.7.3h-1.6c-.4 0-.8-.1-1.2-.4-.4-.3-.8-.7-1-1.2-.2-.4-.3-.8-.3-1.2 0-.7.2-1.4.7-2 .5-.6 1.2-1 2-1.2.2 0 .3-.1.5-.1.4 0 .6.2.6.5 0 .2-.1.4-.3.5-.5.3-.9.7-1.1 1.2-.2.5-.2.9 0 1.3.1.2.2.3.4.3.1 0 .2 0 .3-.1V14c0-.5.2-.9.5-1.2.3-.3.7-.5 1.2-.5h.5c.4 0 .8.1 1.1.3.3.2.5.5.5.8 0 .2-.1.4-.2.6l-.3.6c-.1.2-.2.4-.2.6 0 .3.1.5.3.7.5.5 1 .8 1.5 1 .2.1.4.1.6.1.3 0 .6-.1.8-.3.2-.2.3-.5.3-.8v-1.5c0-.4.1-.8.4-1.1.3-.3.6-.5 1-.5.3 0 .5.1.7.2.2.1.3.3.3.5 0 .1 0 .2-.1.3z" fill="white"/>
          </svg>
        </div>
        <div style={{ color: text, fontWeight: 600, marginBottom: '0.5rem' }}>Входим через VK</div>
        <div style={{ color: muted, fontSize: '0.875rem' }}>Пожалуйста, подождите...</div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#2787F5',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
      </div>
    </div>
  );
}
