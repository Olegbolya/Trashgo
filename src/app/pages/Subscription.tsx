import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { accessPlansApi, type AccessPlanStatus, type AccessPlanRecord } from '../../api/access-plans';
import { referralsApi, type ReferralInfo } from '../../api/referrals';
import { toast } from 'sonner';
import { Shield, Clock, CheckCircle, AlertCircle, Users, Copy, ChevronLeft, CreditCard, RefreshCw } from 'lucide-react';

const SBP_PHONE = '+7 (999) 999-99-99'; // замените на реальный номер администратора
const PLAN_PRICE = 50;

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [status, setStatus] = useState<AccessPlanStatus | null>(null);
  const [history, setHistory] = useState<AccessPlanRecord[]>([]);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  const card: React.CSSProperties = {
    background: c.surface, border: `1px solid ${c.border}`,
    borderRadius: '1rem', padding: '1.25rem',
  };

  useEffect(() => {
    Promise.all([
      accessPlansApi.getStatus(),
      accessPlansApi.getHistory(),
      referralsApi.getMyReferral().catch(() => null),
    ]).then(([s, h, ref]) => {
      setStatus(s);
      setHistory(h);
      if (ref) setReferralInfo(ref);
    }).catch(() => {
      toast.error('Не удалось загрузить данные абонемента');
    }).finally(() => setLoading(false));
  }, []);

  const handleRequestPlan = async () => {
    setSubmitting(true);
    try {
      await accessPlansApi.requestPlan(paymentRef.trim() || undefined);
      toast.success('Запрос отправлен — администратор активирует абонемент в течение 24 часов');
      setPaymentModalOpen(false);
      setPaymentRef('');
      // Refresh status
      const s = await accessPlansApi.getStatus();
      setStatus(s);
      const h = await accessPlansApi.getHistory();
      setHistory(h);
    } catch (e: any) {
      if (e?.code === 'ALREADY_PENDING') {
        toast.error('У вас уже есть ожидающий запрос');
      } else {
        toast.error(e?.message || 'Ошибка при отправке запроса');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyReferralLink = () => {
    const link = referralInfo?.link;
    if (!link) { toast.error('Реферальная ссылка недоступна'); return; }
    navigator.clipboard.writeText(link).then(() => {
      toast.success('Ссылка скопирована');
    });
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const daysLeft = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const statusInfo = status ? (() => {
    if (status.status === 'trial') {
      const days = daysLeft(status.trialEndsAt);
      return {
        icon: <Clock className="w-5 h-5" />,
        label: 'Пробный период',
        description: `Осталось ${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} (до ${formatDate(status.trialEndsAt)})`,
        color: '#F59E0B',
        bg: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7',
      };
    }
    if (status.status === 'active') {
      const days = daysLeft(status.expiresAt!);
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        label: 'Абонемент активен',
        description: `Действует до ${formatDate(status.expiresAt!)} (ещё ${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'})`,
        color: '#22C55E',
        bg: isDark ? 'rgba(34,197,94,0.15)' : '#DCFCE7',
      };
    }
    return {
      icon: <AlertCircle className="w-5 h-5" />,
      label: 'Абонемент истёк',
      description: 'Оплатите абонемент, чтобы продолжить пользоваться сервисом',
      color: '#EF4444',
      bg: isDark ? 'rgba(239,68,68,0.15)' : '#FEE2E2',
    };
  })() : null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: c.muted }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '1rem 1rem 5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, padding: '0.25rem', display: 'flex' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: c.text }}>Мой абонемент</h1>
        </div>

        {/* Status card */}
        {statusInfo && (
          <div style={{ ...card, borderColor: statusInfo.color + '40', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
              <div style={{
                flexShrink: 0, width: 40, height: 40, borderRadius: '0.75rem',
                background: statusInfo.bg, color: statusInfo.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {statusInfo.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: c.text, marginBottom: '0.25rem' }}>
                  {statusInfo.label}
                </div>
                <div style={{ fontSize: '0.875rem', color: c.muted, lineHeight: 1.5 }}>
                  {statusInfo.description}
                </div>
              </div>
            </div>

            {status && status.status !== 'active' && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${c.border}` }}>
                {status.hasPendingRequest ? (
                  <div style={{
                    padding: '0.75rem', borderRadius: '0.75rem',
                    background: isDark ? 'rgba(59,130,246,0.15)' : '#EFF6FF',
                    fontSize: '0.875rem', color: '#3B82F6',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    Запрос на активацию отправлен — ожидайте подтверждения администратора (до 24 ч)
                  </div>
                ) : (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    style={{
                      width: '100%', height: '2.75rem', borderRadius: '0.75rem',
                      background: '#22a849', color: '#fff',
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.9rem', fontWeight: 600,
                    }}
                  >
                    Оплатить абонемент — {status.nextPrice}₽/мес
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pricing info */}
        <div style={{ ...card, marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <Shield className="w-4 h-4" style={{ color: '#22a849' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: c.text }}>Стоимость доступа</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {status && status.discountAmount > 0 ? (
              <>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#22a849' }}>{status.nextPrice}₽</span>
                <span style={{ fontSize: '1rem', color: c.muted, textDecoration: 'line-through' }}>{PLAN_PRICE}₽</span>
                <span style={{ fontSize: '0.85rem', color: c.muted }}>/месяц</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: c.text }}>{PLAN_PRICE}₽</span>
                <span style={{ fontSize: '0.85rem', color: c.muted }}>/месяц</span>
              </>
            )}
          </div>
          <div style={{ fontSize: '0.82rem', color: c.muted, lineHeight: 1.6 }}>
            Первый месяц бесплатно с момента регистрации. После — {PLAN_PRICE}₽/месяц.
            Оплата P2P за заказы — без изменений, напрямую через СБП.
          </div>
        </div>

        {/* Referral program */}
        <div style={{ ...card, marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users className="w-4 h-4" style={{ color: '#8B5CF6' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: c.text }}>Реферальная программа</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#22a849', fontWeight: 600 }}>
              −{status?.discountAmount ?? 0}₽/мес скидка
            </div>
          </div>

          {/* Per-referral list */}
          {referralInfo && referralInfo.referrals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.875rem' }}>
              {referralInfo.referrals.slice(0, 5).map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0.75rem', borderRadius: '0.75rem', background: c.subtle,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: r.isActive ? 'rgba(34,197,94,0.15)' : (isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700,
                      color: r.isActive ? '#22C55E' : c.muted,
                    }}>
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: c.textSub }}>{r.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: r.isActive ? '#22C55E' : c.muted }}>
                      {r.isActive ? '● Активен' : '○ Неактивен'}
                    </span>
                    {r.isActive && i < 5 && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#22a849' }}>−10₽</span>
                    )}
                  </div>
                </div>
              ))}
              {referralInfo.referrals.length > 5 && (
                <div style={{ fontSize: '0.78rem', color: c.muted, textAlign: 'center' }}>
                  +{referralInfo.referrals.length - 5} ещё (только первые 5 дают скидку)
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: c.muted, lineHeight: 1.6, marginBottom: '0.875rem' }}>
              За каждого приглашённого друга с активным абонементом — скидка <strong style={{ color: c.textSub }}>−10₽/мес</strong>.
              Пригласите 5 друзей — пользуйтесь бесплатно.
            </div>
          )}

          <div style={{ fontSize: '0.78rem', color: c.muted, lineHeight: 1.5, marginBottom: '0.875rem' }}>
            Скидка действует, пока приглашённый активно пользуется сервисом.
            {(status?.activeReferrals ?? 0) < 5 && (
              <> Ещё <strong style={{ color: c.text }}>{5 - (status?.activeReferrals ?? 0)}</strong> активных реферала{5 - (status?.activeReferrals ?? 0) === 1 ? '' : 'ов'} — и абонемент бесплатный.</>
            )}
          </div>

          <button
            onClick={copyReferralLink}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', height: '2.5rem', borderRadius: '0.75rem',
              border: `1px solid ${c.border}`, background: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.875rem', color: c.textSub,
            }}
          >
            <Copy className="w-4 h-4" />
            Скопировать реферальную ссылку
          </button>
        </div>

        {/* Payment history */}
        {history.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: c.text, marginBottom: '0.75rem' }}>
              История платежей
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {history.map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0.75rem', borderRadius: '0.75rem', background: c.subtle,
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: c.text, fontWeight: 500 }}>
                      {p.status === 'active' ? 'Активирован' : p.status === 'pending' ? 'Ожидает подтверждения' : 'Истёк'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: c.muted }}>
                      {formatDate(p.createdAt)}
                      {p.expiresAt && ` — ${formatDate(p.expiresAt)}`}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: c.textSub }}>
                    {p.priceAtPurchase}₽
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment modal */}
      {paymentModalOpen && status && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 1000, padding: '0 0 0 0',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setPaymentModalOpen(false); }}
        >
          <div style={{
            background: c.surface, borderRadius: '1.5rem 1.5rem 0 0',
            padding: '1.5rem 1.5rem 2rem', width: '100%', maxWidth: 560,
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: c.text, marginBottom: '1.25rem' }}>
              Оплата абонемента
            </div>

            {/* Instructions */}
            <div style={{
              padding: '1rem', borderRadius: '0.875rem',
              background: isDark ? 'rgba(34,168,73,0.12)' : '#F0FDF4',
              border: `1px solid ${isDark ? 'rgba(34,168,73,0.3)' : '#BBF7D0'}`,
              marginBottom: '1rem',
            }}>
              <div style={{ fontSize: '0.875rem', color: c.text, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                  Переведите <strong style={{ color: '#22a849' }}>{status.nextPrice}₽</strong> через СБП:
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: c.text, marginBottom: '0.375rem' }}>
                  {SBP_PHONE}
                </div>
                <div style={{ fontSize: '0.8rem', color: c.muted }}>
                  В комментарии укажите: «TrashGo абонемент» + ваш телефон или email
                </div>
              </div>
            </div>

            {/* Payment reference input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: c.muted, marginBottom: '0.375rem' }}>
                Номер операции или последние 4 цифры карты (необязательно)
              </label>
              <input
                type="text"
                placeholder="например: 1234 или AB123456"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                maxLength={100}
                style={{
                  display: 'block', width: '100%', height: '2.75rem',
                  padding: '0 0.875rem', borderRadius: '0.75rem',
                  border: `1.5px solid ${c.border}`, background: c.subtle,
                  color: c.text, fontSize: '0.9rem', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={handleRequestPlan}
              disabled={submitting}
              style={{
                width: '100%', height: '2.875rem', borderRadius: '0.875rem',
                background: submitting ? c.muted : '#22a849', color: '#fff',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600,
                marginBottom: '0.625rem',
              }}
            >
              {submitting ? 'Отправка...' : 'Я оплатил — отправить запрос'}
            </button>

            <button
              onClick={() => setPaymentModalOpen(false)}
              style={{
                width: '100%', height: '2.75rem', borderRadius: '0.875rem',
                background: 'transparent', color: c.muted,
                border: `1px solid ${c.border}`, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '0.875rem',
              }}
            >
              Отмена
            </button>

            <div style={{ fontSize: '0.75rem', color: c.muted, textAlign: 'center', marginTop: '0.75rem', lineHeight: 1.5 }}>
              Администратор активирует абонемент вручную в течение 24 часов после подтверждения оплаты
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
