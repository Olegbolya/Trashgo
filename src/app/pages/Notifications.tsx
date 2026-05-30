import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, CheckCheck, Trash2, MessageCircle, Package, Zap, CheckCircle, Settings, Mail, Smartphone, Send, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotificationsStore, type AppNotification } from '../../stores/notifications.store';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api/auth';
import { toast } from 'sonner';
import PrivacyFooter from '../components/PrivacyFooter';

const ACCENT = '#2196F3';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{ width: '2.75rem', height: '1.5rem', borderRadius: '9999px', border: 'none', background: value ? ACCENT : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', top: '0.125rem', left: value ? 'calc(100% - 1.375rem)' : '0.125rem', width: '1.25rem', height: '1.25rem', borderRadius: '9999px', background: 'white', transition: 'left 0.2s ease', display: 'block' }} />
    </button>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

function typeLabel(type: AppNotification['type']): string {
  if (type === 'chat') return 'Сообщение';
  if (type === 'xp') return 'Опыт';
  return 'Заказ';
}

function typeColor(type: AppNotification['type']): string {
  if (type === 'chat') return '#4CAF50';
  if (type === 'xp') return '#FF9800';
  return ACCENT;
}

function typeIcon(type: AppNotification['type']) {
  if (type === 'chat') return MessageCircle;
  if (type === 'xp') return Zap;
  return Package;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { notifications, markRead, markAllRead, clearAll, settings, updateSettings } = useNotificationsStore();
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState<'list' | 'settings'>('list');
  const [emailInput, setEmailInput] = useState(user?.notifEmailAddress ?? user?.email ?? settings?.emailAddress ?? '');
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingEmailToggle, setSavingEmailToggle] = useState(false);
  const [savingPushToggle, setSavingPushToggle] = useState(false);
  const [savingTgToggle, setSavingTgToggle] = useState(false);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [tgLoading, setTgLoading] = useState(false);
  const [tgLinkLoading, setTgLinkLoading] = useState(false);
  const emailEnabled = user?.notifEmail ?? settings?.emailEnabled ?? false;
  const tgNotifEnabled = user?.notifTelegram ?? true;

  useEffect(() => {
    if (tab === 'settings' && !user?.telegramLinked) {
      setTgLoading(true);
      authApi.botInfo().then(({ username }) => setBotUsername(username)).catch(() => {}).finally(() => setTgLoading(false));
    }
  }, [tab, user?.telegramLinked]);

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  const unread = notifications.filter((n) => !n.read).length;

  const byDate = notifications.reduce<Record<string, AppNotification[]>>((acc, n) => {
    const d = new Date(n.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    let key: string;
    if (d.toDateString() === today.toDateString()) key = 'Сегодня';
    else if (d.toDateString() === yesterday.toDateString()) key = 'Вчера';
    else key = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-14" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}`, paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container mx-auto px-3">
          <div className="relative flex items-center h-12">
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit', padding: '4px' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto' }}>
                <div className="text-sm font-semibold" style={{ color: c.text }}>Уведомления</div>
                {unread > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#ef4444' }}>{unread}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1" style={{ marginLeft: 'auto' }}>
              {tab === 'list' && notifications.length > 0 && (
                <>
                  <button onClick={markAllRead} title="Прочитать все" style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, padding: '4px', borderRadius: '8px' }}>
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button onClick={clearAll} title="Очистить всё" style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, padding: '4px', borderRadius: '8px' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab switcher */}
      <div style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-3">
          <div className="flex gap-1 py-2">
            {(['list', 'settings'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? `${ACCENT}18` : 'transparent', color: tab === t ? ACCENT : c.muted, border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: tab === t ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {t === 'list' ? <><Bell className="w-3.5 h-3.5" />Лента</> : <><Settings className="w-3.5 h-3.5" />Настройки</>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 py-3 max-w-2xl">
        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold" style={{ color: c.text }}>Push-уведомления</span>
                  {savingPushToggle && <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />}
                </div>
                <Toggle value={user?.notifPush ?? true} onChange={async (v) => {
                  updateUser({ notifPush: v });
                  setSavingPushToggle(true);
                  try {
                    const updated = await authApi.updateProfile({ notifPush: v });
                    updateUser({ notifPush: updated.notifPush });
                  } catch { toast.error('Не удалось сохранить настройку'); }
                  finally { setSavingPushToggle(false); }
                }} />
              </div>
              {([
                { key: 'pushOrderStatus' as const, label: 'Статус заказа', sub: 'Принят, в пути, выполнен' },
                { key: 'pushChat' as const, label: 'Сообщения', sub: 'Чат с исполнителем или заказчиком' },
                { key: 'pushXP' as const, label: 'Опыт и достижения', sub: 'Начисление XP и разблокировка' },
              ]).map((item, i, arr) => (
                <div key={item.key} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: c.text }}>{item.label}</div>
                    <div className="text-xs" style={{ color: c.muted }}>{item.sub}</div>
                  </div>
                  <Toggle value={settings?.[item.key] ?? true} onChange={(v) => updateSettings({ [item.key]: v })} />
                </div>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: emailEnabled ? `1px solid ${c.border}` : 'none' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: ACCENT }} />
                    <span className="text-sm font-semibold" style={{ color: c.text }}>Email-уведомления</span>
                    {savingEmailToggle && <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />}
                  </div>
                  <div className="text-xs mt-0.5 ml-6" style={{ color: c.muted }}>
                    {emailEnabled
                      ? `Дублируются на ${user?.notifEmailAddress || user?.email || 'почту'}`
                      : 'По умолчанию отключено'}
                  </div>
                </div>
                <Toggle value={emailEnabled} onChange={async (v) => {
                  if (v && !emailInput && user?.email) setEmailInput(user.email);
                  updateSettings({ emailEnabled: v });
                  setSavingEmailToggle(true);
                  try {
                    const patch: Record<string, any> = { notifEmail: v };
                    if (v && !user?.notifEmailAddress && user?.email) patch.notifEmailAddress = user.email;
                    const updated = await authApi.updateProfile(patch);
                    updateUser({ notifEmail: updated.notifEmail, notifEmailAddress: updated.notifEmailAddress });
                  } catch { toast.error('Не удалось сохранить настройку'); }
                  finally { setSavingEmailToggle(false); }
                }} />
              </div>
              {emailEnabled && (
                <div className="px-4 py-3">
                  <div className="text-xs mb-2" style={{ color: c.muted }}>Email для уведомлений (привязан к аккаунту)</div>
                  <div className="flex gap-2">
                    <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="your@email.com" style={{ flex: 1, height: '2.25rem', borderRadius: '0.5rem', border: `1px solid ${c.border}`, background: c.subtle, color: c.text, padding: '0 0.75rem', fontSize: '1rem', fontFamily: 'inherit', outline: 'none' }} />
                    <button
                      disabled={savingEmail}
                      onClick={async () => {
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
                          toast.error('Введите корректный email');
                          return;
                        }
                        setSavingEmail(true);
                        try {
                          const updated = await authApi.updateProfile({ notifEmailAddress: emailInput, email: emailInput });
                          updateUser({ notifEmailAddress: updated.notifEmailAddress, email: updated.email });
                          updateSettings({ emailAddress: emailInput });
                          toast.success('Email сохранён');
                        } catch { toast.error('Не удалось сохранить email'); }
                        finally { setSavingEmail(false); }
                      }}
                      style={{ height: '2.25rem', padding: '0 1rem', borderRadius: '0.5rem', background: ACCENT, color: 'white', border: 'none', cursor: savingEmail ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit', opacity: savingEmail ? 0.7 : 1 }}
                    >
                      {savingEmail ? '...' : 'Сохранить'}
                    </button>
                  </div>
                  <div className="text-xs mt-2" style={{ color: c.muted }}>Почта закреплена за аккаунтом — используется для входа и уведомлений</div>
                </div>
              )}
            </div>
            {/* Telegram */}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" style={{ color: '#2196F3' }} />
                  <span className="text-sm font-semibold" style={{ color: c.text }}>Telegram</span>
                </div>
                {user?.telegramLinked
                  ? <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: '#d1fae5', color: '#065f46' }}>✓ Привязан</span>
                  : tgLoading
                    ? <div className="w-4 h-4 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
                    : botUsername
                      ? <button
                          disabled={tgLinkLoading}
                          onClick={async () => {
                            if (!user?.phone) return;
                            setTgLinkLoading(true);
                            try {
                              const { telegramBotLink } = await authApi.requestTelegram(user.phone, true);
                              window.open(telegramBotLink, '_blank', 'noopener,noreferrer');
                            } catch {
                              toast.error('Не удалось получить ссылку для привязки');
                            } finally {
                              setTgLinkLoading(false);
                            }
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#2196F3', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, cursor: tgLinkLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: tgLinkLoading ? 0.7 : 1 }}>
                          {tgLinkLoading ? '...' : <>Привязать <ExternalLink className="w-3 h-3" /></>}
                        </button>
                      : <span className="text-xs" style={{ color: c.muted }}>Не привязан</span>}
              </div>
              {user?.telegramLinked && (
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: c.text }}>Уведомления о заказах</div>
                    <div className="text-xs" style={{ color: c.muted }}>Статусы, чат, новые заявки</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingTgToggle && <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />}
                    <Toggle value={tgNotifEnabled} onChange={async (v) => {
                      updateUser({ notifTelegram: v });
                      setSavingTgToggle(true);
                      try {
                        const updated = await authApi.updateProfile({ notifTelegram: v });
                        updateUser({ notifTelegram: (updated as any).notifTelegram });
                      } catch { toast.error('Не удалось сохранить настройку'); }
                      finally { setSavingTgToggle(false); }
                    }} />
                  </div>
                </div>
              )}
              <div className="px-4 py-3 text-xs" style={{ color: c.muted }}>
                {user?.telegramLinked
                  ? tgNotifEnabled
                    ? 'Уведомления о заказах и чатах приходят в Telegram. Коды входа — всегда.'
                    : 'В Telegram приходят только коды входа. Уведомления о заказах отключены.'
                  : 'Привяжите Telegram-бот, чтобы получать уведомления когда приложение закрыто.'}
              </div>
            </div>

            <div className="rounded-xl px-4 py-3 text-xs" style={{ background: `${ACCENT}10`, color: c.muted }}>
              Настройки сохраняются на сервере и применяются на всех устройствах
            </div>
          </div>
        )}
        {tab === 'list' && (notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}12` }}>
              <Bell className="w-10 h-10" style={{ color: ACCENT, opacity: 0.5 }} />
            </div>
            <div className="text-center">
              <div className="text-base font-semibold mb-1" style={{ color: c.text }}>Нет уведомлений</div>
              <div className="text-sm" style={{ color: c.muted }}>Здесь будут появляться обновления по заказам и сообщения</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byDate).map(([date, items]) => (
              <div key={date}>
                <div className="text-xs font-semibold uppercase mb-2 px-1" style={{ color: c.muted }}>{date}</div>
                <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                  {items.map((n, i) => {
                    const Icon = typeIcon(n.type);
                    const color = typeColor(n.type);
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markRead(n.id);
                          if (n.orderId) navigate(`/order/${n.orderId}`);
                        }}
                        className="flex items-start gap-3 px-4 py-3"
                        style={{
                          borderBottom: i < items.length - 1 ? `1px solid ${c.border}` : 'none',
                          background: n.read ? 'transparent' : `${ACCENT}08`,
                          cursor: n.orderId ? 'pointer' : 'default',
                        }}
                      >
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}18` }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{ background: `${color}15`, color }}>
                              {typeLabel(n.type)}
                            </span>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#ef4444' }} />}
                          </div>
                          <div className="text-sm font-medium" style={{ color: c.text }}>{n.title}</div>
                          {n.message && <div className="text-xs mt-0.5" style={{ color: c.muted }}>{n.message}</div>}
                          <div className="text-[10px] mt-1" style={{ color: c.muted }}>{timeAgo(n.timestamp)}</div>
                        </div>

                        {/* Read icon */}
                        {n.read && (
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-1" style={{ color: c.border }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="text-center text-xs py-2" style={{ color: c.muted }}>
              Хранится последние 50 уведомлений
            </div>
          </div>
        ))}
      </div>
      <PrivacyFooter />
    </div>
  );
}
