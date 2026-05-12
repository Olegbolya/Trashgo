import type { OrderStatus } from '../../types/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Создан',
  accepted: 'Исполнитель принял',
  in_progress: 'В процессе',
  pending_confirmation: 'Ожидает подтверждения',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

const STATUS_ICONS: Record<OrderStatus, string> = {
  new: '📋',
  accepted: '✅',
  in_progress: '🔄',
  pending_confirmation: '⏳',
  completed: '🎉',
  cancelled: '❌',
};

interface HistoryItem {
  status: OrderStatus;
  createdAt: string;
  note: string;
}

interface Props {
  history?: HistoryItem[];
  isDark: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function OrderTimeline({ history, isDark }: Props) {
  if (!history || history.length === 0) return null;

  const text = isDark ? '#e5e7eb' : '#111827';
  const muted = isDark ? '#9ca3af' : '#6b7280';
  const border = isDark ? '#374151' : '#e5e7eb';
  const subtle = isDark ? '#1f2937' : '#f9fafb';
  const dot = isDark ? '#111827' : '#ffffff';

  return (
    <div style={{ background: subtle, borderRadius: '0.75rem', padding: '0.875rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: muted, marginBottom: '0.75rem' }}>
        История
      </div>
      <div style={{ position: 'relative' }}>
        {history.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', paddingBottom: i < history.length - 1 ? '0.875rem' : 0, position: 'relative' }}>
            {i < history.length - 1 && (
              <div style={{ position: 'absolute', left: '0.9rem', top: '1.875rem', bottom: 0, width: '1px', background: border }} />
            )}
            <div style={{
              width: '1.875rem', height: '1.875rem', borderRadius: '50%',
              background: dot, border: `2px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', flexShrink: 0, zIndex: 1,
            }}>
              {STATUS_ICONS[item.status] ?? '•'}
            </div>
            <div style={{ flex: 1, paddingTop: '0.1875rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: text, lineHeight: 1.3 }}>
                {STATUS_LABELS[item.status] ?? item.status}
              </div>
              <div style={{ fontSize: '0.72rem', color: muted, marginTop: '0.125rem' }}>
                {formatTime(item.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
