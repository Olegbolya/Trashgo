import { useState } from 'react';
import { authApi } from '../../api/auth';
import { toast } from 'sonner';

interface Props {
  reason: string | null;
  isDark: boolean;
}

export function FrozenBanner({ reason, isDark }: Props) {
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleAppeal = async () => {
    if (!appealText.trim() || sending) return;
    setSending(true);
    try {
      await authApi.appealFreeze(appealText.trim());
      setSent(true);
      setAppealOpen(false);
      toast.success('Апелляция отправлена', { description: 'Администратор рассмотрит вашу жалобу' });
    } catch {
      toast.error('Ошибка отправки апелляции');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginBottom: '1rem', borderRadius: '0.875rem', padding: '1rem', background: '#431407', border: '1px solid #9a3412' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🔒</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#fef2f2', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
            Аккаунт заморожен
          </div>
          {reason && !reason.startsWith('[Оспорено]') && (
            <div style={{ fontSize: '0.8125rem', color: '#fca5a5', marginBottom: '0.5rem' }}>
              Причина: {reason}
            </div>
          )}
          <div style={{ fontSize: '0.8125rem', color: '#fca5a5', marginBottom: '0.75rem' }}>
            Вы не можете создавать новые заказы. Если считаете это ошибкой — отправьте апелляцию.
          </div>
          {sent ? (
            <div style={{ fontSize: '0.8125rem', color: '#4ade80' }}>✅ Апелляция отправлена — ожидайте ответа администратора</div>
          ) : (
            <button
              onClick={() => setAppealOpen(v => !v)}
              style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', background: '#9a3412', border: '1px solid #c2410c', color: '#fef2f2', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {appealOpen ? 'Отмена' : '📝 Оспорить блокировку'}
            </button>
          )}
          {appealOpen && (
            <div style={{ marginTop: '0.75rem' }}>
              <textarea
                value={appealText}
                onChange={e => setAppealText(e.target.value)}
                placeholder="Опишите ситуацию и причину снятия блокировки..."
                rows={3}
                style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid #9a3412', background: '#1c0a05', color: '#fef2f2', padding: '0.5rem', fontSize: '0.8125rem', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                disabled={!appealText.trim() || sending}
                onClick={handleAppeal}
                style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: appealText.trim() ? '#c2410c' : '#9a3412', color: 'white', border: 'none', cursor: appealText.trim() ? 'pointer' : 'not-allowed', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit' }}
              >
                {sending ? 'Отправляем...' : 'Отправить апелляцию'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
