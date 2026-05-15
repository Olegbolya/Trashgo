import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  MapPin, Clock, Package, ArrowLeft, User, CheckCircle,
  AlertTriangle, Star, Phone, Zap, MessageCircle, Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { ordersApi } from '../../api/orders';
import { useAuthStore } from '../../stores/auth.store';
import { useTheme } from '../context/ThemeContext';
import type { Order } from '../../types/order';

const ACCENT = '#2196F3';
const GREEN = '#22c55e';
const ORANGE = '#FF9800';
const RED = '#ef4444';

const STATUS_LABELS: Record<string, string> = {
  new: 'Ищет исполнителя',
  accepted: 'Принят исполнителем',
  in_progress: 'В работе',
  pending_confirmation: 'Ожидает подтверждения',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

const STATUS_COLORS: Record<string, string> = {
  new: ACCENT,
  accepted: ORANGE,
  in_progress: ORANGE,
  pending_confirmation: '#8B5CF6',
  completed: GREEN,
  cancelled: RED,
};

function StarRow({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{ background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', padding: '2px' }}
        >
          <Star
            className="w-6 h-6"
            fill={(hover || value) >= s ? '#FFC107' : 'none'}
            style={{ color: (hover || value) >= s ? '#FFC107' : '#9ca3af' }}
          />
        </button>
      ))}
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDark } = useTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  useEffect(() => {
    if (!id) return;
    ordersApi.getById(id)
      .then((res) => {
        const data = (res as unknown as { data: Order }).data ?? (res as unknown as Order);
        setOrder(data);
        if (data.ratingByCustomer && user?.id === data.customerId) setRatingSubmitted(true);
        if (data.ratingByContractor && user?.id === data.contractorId) setRatingSubmitted(true);
      })
      .catch(() => toast.error('Не удалось загрузить заказ'))
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  const isCustomer = order?.customerId === user?.id;
  const isContractor = order?.contractorId === user?.id;

  const handleConfirm = async () => {
    if (!order) return;
    setConfirming(true);
    try {
      await ordersApi.confirmOrder(order.id);
      setOrder((o) => o ? { ...o, status: 'completed' } : o);
      toast.success('Выполнение подтверждено!');
    } catch {
      toast.error('Не удалось подтвердить');
    } finally {
      setConfirming(false);
    }
  };

  const handleRate = async () => {
    if (!order || rating === 0) return;
    setSubmittingRating(true);
    try {
      await ordersApi.rate(order.id, rating);
      setRatingSubmitted(true);
      toast.success('Оценка отправлена!');
    } catch {
      toast.error('Не удалось отправить оценку');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDispute = async () => {
    if (!order || !disputeReason.trim()) return;
    setSubmittingDispute(true);
    try {
      await ordersApi.disputeOrder(order.id, disputeReason);
      toast.success('Жалоба подана', { description: 'Поддержка рассмотрит в течение 7 дней' });
      setShowDispute(false);
    } catch {
      toast.error('Не удалось подать жалобу');
    } finally {
      setSubmittingDispute(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.bg }}>
        <div className="w-8 h-8 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: c.bg }}>
        <div className="text-base font-medium" style={{ color: c.text }}>Заказ не найден</div>
        <button onClick={() => navigate(-1)} style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
          Вернуться назад
        </button>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[order.status] ?? c.muted;
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const scheduledText = order.asap
    ? '⚡ Как можно скорее'
    : order.scheduledAt
      ? new Date(order.scheduledAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
      : '—';

  return (
    <div className="min-h-screen pb-10" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Назад</span>
            </button>
            <div className="text-sm font-semibold" style={{ color: c.text }}>
              Заказ #{order.id.slice(0, 8).toUpperCase()}
            </div>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 py-3 max-w-2xl space-y-3">

        {/* Status banner */}
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}30` }}>
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: statusColor }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: statusColor }}>{statusLabel}</div>
            {order.status === 'pending_confirmation' && isCustomer && (
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Исполнитель отметил заказ выполненным — подтвердите</div>
            )}
            {order.status === 'accepted' && isCustomer && (
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Исполнитель принял заказ и скоро прибудет</div>
            )}
            {order.status === 'in_progress' && isCustomer && (
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Работа выполняется</div>
            )}
          </div>
          <div className="text-xl font-bold flex-shrink-0" style={{ color: c.text }}>{order.price}₽</div>
        </div>

        {/* Order details */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <div className="text-sm font-semibold" style={{ color: c.text }}>Детали заказа</div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: c.muted }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs mb-0.5" style={{ color: c.muted }}>Адрес</div>
              <div className="text-sm" style={{ color: c.text }}>{order.address}</div>
              {order.district && <div className="text-xs mt-0.5" style={{ color: c.muted }}>{order.district}</div>}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: c.muted }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs mb-0.5" style={{ color: c.muted }}>Время</div>
              <div className="text-sm" style={{ color: c.text }}>{scheduledText}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Package className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: c.muted }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs mb-0.5" style={{ color: c.muted }}>Объём</div>
              <div className="text-sm" style={{ color: c.text }}>{order.volume} {order.volume === 1 ? 'мешок' : order.volume < 5 ? 'мешка' : 'мешков'}</div>
            </div>
          </div>

          {order.asap && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${ORANGE}15` }}>
              <Zap className="w-4 h-4 flex-shrink-0" style={{ color: ORANGE }} />
              <span className="text-xs font-medium" style={{ color: ORANGE }}>Срочный заказ</span>
            </div>
          )}

          {order.description && (
            <div className="pt-2" style={{ borderTop: `1px solid ${c.border}` }}>
              <div className="text-xs mb-1" style={{ color: c.muted }}>Описание</div>
              <div className="text-sm" style={{ color: c.text }}>{order.description}</div>
            </div>
          )}

          {order.photoUrls?.length > 0 && (
            <div className="pt-2" style={{ borderTop: `1px solid ${c.border}` }}>
              <div className="text-xs mb-2" style={{ color: c.muted }}>Фото заказа</div>
              <div className="flex gap-2 flex-wrap">
                {order.photoUrls.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Completion photos */}
        {order.completionPhotoUrls?.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" style={{ color: GREEN }} />
              <div className="text-sm font-semibold" style={{ color: c.text }}>Фото выполнения</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {order.completionPhotoUrls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-20 h-20 rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}

        {/* Counterpart info */}
        {isCustomer && order.contractorId && (
          <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="text-sm font-semibold mb-3" style={{ color: c.text }}>Исполнитель</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0" style={{ background: ACCENT }}>
                {(order.contractorName ?? 'И').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: c.text }}>{order.contractorName ?? 'Исполнитель'}</div>
                {order.contractorPhone && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <Phone className="w-3 h-3" style={{ color: c.muted }} />
                    <span className="text-xs" style={{ color: c.muted }}>{order.contractorPhone}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(order.contractorPhone!); toast.success('Номер скопирован'); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: c.muted, display: 'flex', alignItems: 'center' }}
                      title="Скопировать номер"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isContractor && (
          <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="text-sm font-semibold mb-3" style={{ color: c.text }}>Заказчик</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0" style={{ background: GREEN }}>
                {(order.customerName ?? 'З').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: c.text }}>{order.customerName ?? 'Заказчик'}</div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <Phone className="w-3 h-3" style={{ color: c.muted }} />
                    <span className="text-xs" style={{ color: c.muted }}>{order.customerPhone}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(order.customerPhone!); toast.success('Номер скопирован'); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: c.muted, display: 'flex', alignItems: 'center' }}
                      title="Скопировать номер"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer actions */}
        {isCustomer && order.status === 'pending_confirmation' && (
          <div className="rounded-2xl p-4 space-y-2" style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}30` }}>
            <div className="text-sm font-semibold" style={{ color: c.text }}>Подтвердите выполнение</div>
            <div className="text-xs" style={{ color: c.muted }}>
              Исполнитель отметил работу выполненной. Проверьте результат и подтвердите.
            </div>
            {order.completionPhotoUrls?.length === 0 && (
              <div className="text-xs" style={{ color: c.muted }}>Фото выполнения не прикреплено.</div>
            )}
            <button
              disabled={confirming}
              onClick={handleConfirm}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: GREEN,
                color: 'white', border: 'none', cursor: confirming ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '0.875rem', opacity: confirming ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontFamily: 'inherit',
              }}
            >
              {confirming
                ? <><div className="w-4 h-4 border-2 border-white/40 rounded-full animate-spin" style={{ borderTopColor: 'white' }} />Подтверждаем...</>
                : <><CheckCircle className="w-4 h-4" />Подтвердить выполнение</>}
            </button>
            <button
              onClick={() => setShowDispute(true)}
              style={{
                width: '100%', padding: '0.625rem', borderRadius: '0.75rem', background: 'transparent',
                color: RED, border: `1px solid ${RED}40`, cursor: 'pointer',
                fontSize: '0.8125rem', fontFamily: 'inherit',
              }}
            >
              Работа выполнена некорректно
            </button>
          </div>
        )}

        {/* Dispute form */}
        {showDispute && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: c.surface, border: `1px solid ${RED}40` }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: RED }} />
              <div className="text-sm font-semibold" style={{ color: c.text }}>Жалоба</div>
            </div>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Опишите проблему с выполнением работы..."
              style={{
                width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '0.5rem',
                border: `1px solid ${c.border}`, background: c.subtle, color: c.text,
                fontSize: '0.875rem', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDispute(false)}
                style={{ flex: 1, padding: '0.625rem', borderRadius: '0.5rem', background: c.subtle, color: c.muted, border: `1px solid ${c.border}`, cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit' }}
              >
                Отмена
              </button>
              <button
                disabled={submittingDispute || !disputeReason.trim()}
                onClick={handleDispute}
                style={{ flex: 1, padding: '0.625rem', borderRadius: '0.5rem', background: RED, color: 'white', border: 'none', cursor: submittingDispute ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', fontWeight: 600, opacity: submittingDispute ? 0.7 : 1, fontFamily: 'inherit' }}
              >
                {submittingDispute ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        )}

        {/* Rating section — completed orders */}
        {order.status === 'completed' && !ratingSubmitted && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: '#FFC107' }} />
              <div className="text-sm font-semibold" style={{ color: c.text }}>
                {isCustomer ? 'Оцените исполнителя' : 'Оцените заказчика'}
              </div>
            </div>
            <StarRow value={rating} onChange={setRating} />
            <button
              disabled={rating === 0 || submittingRating}
              onClick={handleRate}
              style={{
                width: '100%', padding: '0.625rem', borderRadius: '0.75rem',
                background: rating > 0 ? ACCENT : c.subtle,
                color: rating > 0 ? 'white' : c.muted,
                border: 'none', cursor: rating > 0 && !submittingRating ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit',
                opacity: submittingRating ? 0.7 : 1,
              }}
            >
              {submittingRating ? 'Отправка...' : 'Отправить оценку'}
            </button>
          </div>
        )}

        {order.status === 'completed' && ratingSubmitted && (
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}30` }}>
            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: GREEN }} />
            <div className="text-sm font-medium" style={{ color: GREEN }}>Оценка отправлена</div>
          </div>
        )}

        {/* Chat hint */}
        {(order.status === 'accepted' || order.status === 'in_progress' || order.status === 'pending_confirmation') && (
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}20` }}>
            <MessageCircle className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
            <div className="text-xs" style={{ color: c.muted }}>
              Для связи используйте чат в разделе активных заказов на главной странице
            </div>
          </div>
        )}

        {/* Fallback for viewers not party to the order */}
        {!isCustomer && !isContractor && (
          <div className="rounded-2xl p-4 text-center" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <User className="w-8 h-8 mx-auto mb-2" style={{ color: c.muted }} />
            <div className="text-sm" style={{ color: c.muted }}>Вы не являетесь участником этого заказа</div>
          </div>
        )}
      </div>
    </div>
  );
}
