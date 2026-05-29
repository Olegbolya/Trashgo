import { useState } from 'react';

interface Props {
  orderId: string;
  targetName: string;
  role: 'customer' | 'contractor';
  isDark: boolean;
  onSubmit: (rating: number, review?: string) => Promise<void>;
  onSkip: () => void;
}

export function RatingModal({ orderId, targetName, role, isDark, onSubmit, onSkip }: Props) {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const ACCENT = role === 'customer' ? '#66BB6A' : '#2196F3';

  const c = {
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  const labels = ['', 'Плохо', 'Неплохо', 'Хорошо', 'Отлично', 'Превосходно'];
  const active = hovered || selected;

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(selected, review.trim() || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end lg:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="w-full lg:max-w-sm rounded-t-2xl lg:rounded-2xl"
        style={{ background: c.surface }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="text-3xl mb-3">⭐</div>
          <div className="text-base font-bold mb-1" style={{ color: c.text }}>
            Оцените {role === 'customer' ? 'исполнителя' : 'заказчика'}
          </div>
          {targetName && (
            <div className="text-sm mb-4" style={{ color: c.muted }}>{targetName}</div>
          )}

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setSelected(star)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '2.2rem', lineHeight: 1,
                  color: star <= active ? '#FBBF24' : (isDark ? '#374151' : '#d1d5db'),
                  transform: star <= active ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.1s',
                }}
              >
                ★
              </button>
            ))}
          </div>

          <div className="text-sm font-medium mb-4" style={{ color: active ? '#FBBF24' : c.muted, minHeight: '1.25rem' }}>
            {active ? labels[active] : 'Выберите оценку'}
          </div>

          {/* Review text — only for customer rating contractor */}
          {role === 'customer' && (
            <textarea
              value={review}
              onChange={e => setReview(e.target.value.slice(0, 300))}
              placeholder="Напишите отзыв (необязательно)..."
              rows={2}
              style={{
                width: '100%', padding: '0.625rem 0.75rem',
                border: `1px solid ${c.border}`, borderRadius: '0.75rem',
                background: c.subtle, color: c.text, fontSize: '0.875rem',
                fontFamily: 'inherit', resize: 'none', outline: 'none',
                marginBottom: '1rem', boxSizing: 'border-box',
              }}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="w-full h-11 rounded-xl text-sm font-semibold mb-2"
            style={{
              background: selected ? ACCENT : (isDark ? '#374151' : '#e5e7eb'),
              color: selected ? 'white' : c.muted,
              border: 'none', cursor: selected ? 'pointer' : 'not-allowed',
              opacity: submitting ? 0.6 : 1, fontFamily: 'inherit',
            }}
          >
            {submitting ? 'Отправляем...' : 'Отправить оценку'}
          </button>

          <button
            onClick={onSkip}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontSize: '0.8rem', fontFamily: 'inherit' }}
          >
            Пропустить
          </button>
        </div>
      </div>
    </div>
  );
}
