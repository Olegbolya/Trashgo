import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api/auth';
import { toast } from 'sonner';

const REMINDER_KEY = 'tg_reminder_dismissed_at';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function TelegramReminder() {
  const { user } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Don't show if Telegram already linked
    if ((user as any).telegramLinked) return;
    const dismissed = localStorage.getItem(REMINDER_KEY);
    if (dismissed && Date.now() - Number(dismissed) < WEEK_MS) return;
    // Show after 3 seconds
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(REMINDER_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleLink = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const phone = (user as any).phone || '';
      const res = await authApi.requestTelegram(phone, true);
      if (res.telegramBotLink) {
        setBotUsername(res.telegramBotLink);
        window.open(res.telegramBotLink, '_blank');
        dismiss();
      }
    } catch {
      toast.error('Не удалось получить ссылку на бот');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '5rem', left: '1rem', right: '1rem', zIndex: 800,
      maxWidth: '420px', margin: '0 auto',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #229ED9 100%)',
        borderRadius: '1.25rem',
        padding: '1.25rem',
        boxShadow: '0 8px 32px rgba(34,158,217,0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '100px', height: '100px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', left: '30%',
          width: '80px', height: '80px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
        }} />

        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer',
            width: '1.75rem', height: '1.75rem', borderRadius: '50%',
            color: 'white', fontSize: '0.85rem', display: 'flex',
            alignItems: 'center', justifyContent: 'center', lineHeight: 1,
          }}
        >✕</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', flexShrink: 0,
          }}>✈️</div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
              Привяжите Telegram
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginTop: '0.125rem' }}>
              Получите больше от TrashGo
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { icon: '⚡', text: 'Мгновенные уведомления о новых заказах' },
            { icon: '🔐', text: 'Вход через Telegram — без SMS и почты' },
            { icon: '📬', text: 'Статус заказа прямо в мессенджере' },
          ].map(b => (
            <div key={b.icon} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{b.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleLink}
            disabled={loading}
            style={{
              flex: 1, padding: '0.625rem 1rem',
              background: 'white', color: '#1565c0',
              border: 'none', borderRadius: '0.75rem',
              fontWeight: 700, fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '...' : '✈️ Привязать Telegram'}
          </button>
          <button
            onClick={dismiss}
            style={{
              padding: '0.625rem 1rem',
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.8)',
              border: 'none', borderRadius: '0.75rem',
              fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            Не сейчас
          </button>
        </div>
      </div>
    </div>
  );
}
