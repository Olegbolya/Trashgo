import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { subscriptionsApi } from '../../api/subscriptions';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { KazanAddressInput } from '../components/KazanAddressInput';

const ACCENT = '#4CAF50';

const weekDays = [
  { id: 1, label: 'ПН', full: 'Понедельник' },
  { id: 2, label: 'ВТ', full: 'Вторник' },
  { id: 3, label: 'СР', full: 'Среда' },
  { id: 4, label: 'ЧТ', full: 'Четверг' },
  { id: 5, label: 'ПТ', full: 'Пятница' },
  { id: 6, label: 'СБ', full: 'Суббота' },
  { id: 7, label: 'ВС', full: 'Воскресенье' },
];

export default function CreateSubscription() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [time, setTime] = useState('18:00');
  const [address, setAddress] = useState('');
  const [entrance, setEntrance] = useState('');
  const [apartment, setApartment] = useState('');
  const [floor, setFloor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('50');

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
    input:   isDark ? '#1f2937' : '#f9fafb',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: `1px solid ${c.border}`,
    borderRadius: '0.75rem',
    background: c.input,
    color: c.text,
    fontFamily: 'inherit',
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const card: React.CSSProperties = {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: '1rem',
    padding: '1.25rem',
  };

  const toggleDay = (id: number) =>
    setSelectedDays(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);

  const buildDescription = () => {
    const parts: string[] = [];
    if (entrance) parts.push(`подъезд ${entrance}`);
    if (floor)    parts.push(`этаж ${floor}`);
    if (apartment) parts.push(`кв. ${apartment}`);
    if (description) parts.push(description);
    return parts.join(', ');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await subscriptionsApi.create({
        address,
        days: selectedDays,
        time,
        price: Number(price),
        description: buildDescription(),
      });
      toast.success('Расписание создано');
      navigate(-1);
    } catch {
      toast.error('Не удалось создать расписание');
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = step === 1 ? selectedDays.length > 0
    : step === 3 ? address.trim().length > 0
    : true;

  return (
    <div className="min-h-screen" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}`, paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="font-semibold text-sm" style={{ color: c.text }}>График вывоза</span>
            <div className="w-8" />
          </div>
        </div>

        {/* Step progress */}
        <div className="container mx-auto px-4 pb-3">
          <div className="flex gap-1.5 max-w-lg mx-auto">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className="flex-1 h-1 rounded-full"
                style={{ background: s <= step ? ACCENT : c.border, transition: 'background 0.2s' }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-5 pb-28 max-w-lg">

        {/* STEP 1 — Days */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: c.text }}>Дни недели</h2>
              <p className="text-sm" style={{ color: c.muted }}>В какие дни нужен вывоз мусора?</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {weekDays.map(day => {
                const sel = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    style={{
                      padding: '0.875rem',
                      borderRadius: '0.875rem',
                      border: `2px solid ${sel ? ACCENT : c.border}`,
                      background: sel ? `${ACCENT}18` : c.surface,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div className="text-sm font-bold" style={{ color: sel ? ACCENT : c.text }}>{day.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>{day.full}</div>
                  </button>
                );
              })}
            </div>
            {selectedDays.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: `${ACCENT}15`, color: ACCENT }}>
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>
                  {selectedDays.map(id => weekDays.find(d => d.id === id)?.label).join(', ')}
                  {' · '}
                  {selectedDays.length === 1 ? '1 день' : selectedDays.length < 5 ? `${selectedDays.length} дня` : `${selectedDays.length} дней`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Time */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: c.text }}>Время вывоза</h2>
              <p className="text-sm" style={{ color: c.muted }}>Во сколько должен приехать исполнитель?</p>
            </div>
            <div style={card}>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                style={{ ...inputStyle, fontSize: '2rem', fontWeight: 700, textAlign: 'center', background: c.subtle }}
              />
            </div>
            <div style={card}>
              <p className="text-xs font-medium mb-3" style={{ color: c.muted }}>Популярное время</p>
              <div className="grid grid-cols-3 gap-2">
                {['08:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    style={{
                      padding: '0.625rem',
                      borderRadius: '0.625rem',
                      border: `1.5px solid ${time === t ? ACCENT : c.border}`,
                      background: time === t ? `${ACCENT}18` : c.subtle,
                      color: time === t ? ACCENT : c.textSub,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Address */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: c.text }}>Адрес</h2>
              <p className="text-sm" style={{ color: c.muted }}>Откуда забирать мусор?</p>
            </div>
            <div style={card} className="space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: c.muted }}>Улица и дом</label>
                <KazanAddressInput
                  value={address}
                  onChange={setAddress}
                  placeholder="ул. Баумана, 58"
                  style={inputStyle}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: c.muted }}>Подъезд</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={entrance}
                    onChange={e => setEntrance(e.target.value)}
                    placeholder="1"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: c.muted }}>Этаж</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={floor}
                    onChange={e => setFloor(e.target.value)}
                    placeholder="5"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: c.muted }}>Квартира</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={apartment}
                    onChange={e => setApartment(e.target.value)}
                    placeholder="42"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: c.muted }}>Комментарий (необязательно)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Домофон 58, второй корпус"
                  rows={2}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Price & Summary */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: c.text }}>Цена за вывоз</h2>
              <p className="text-sm" style={{ color: c.muted }}>Сколько платить за один раз?</p>
            </div>
            <div style={card}>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  style={{ ...inputStyle, fontSize: '2rem', fontWeight: 700, textAlign: 'center', flex: 1 }}
                />
                <span className="text-2xl font-bold" style={{ color: c.text }}>₽</span>
              </div>
            </div>
            <div style={card}>
              <p className="text-xs font-medium mb-3" style={{ color: c.muted }}>Рекомендуемая цена</p>
              <div className="grid grid-cols-3 gap-2">
                {['40', '50', '60', '70', '80', '100'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPrice(p)}
                    style={{
                      padding: '0.625rem',
                      borderRadius: '0.625rem',
                      border: `1.5px solid ${price === p ? ACCENT : c.border}`,
                      background: price === p ? `${ACCENT}18` : c.subtle,
                      color: price === p ? ACCENT : c.textSub,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >{p}₽</button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl p-5" style={{ background: isDark ? '#0d1f0d' : '#f0fdf4', border: `1px solid ${ACCENT}40` }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: ACCENT }}>Сводка подписки</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: c.muted }}>Дни:</span>
                  <span className="font-medium" style={{ color: c.text }}>
                    {selectedDays.map(id => weekDays.find(d => d.id === id)?.label).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: c.muted }}>Время:</span>
                  <span className="font-medium" style={{ color: c.text }}>{time}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span style={{ color: c.muted, flexShrink: 0 }}>Адрес:</span>
                  <span className="font-medium text-right" style={{ color: c.text }}>
                    {[address, entrance && `подъезд ${entrance}`, floor && `эт. ${floor}`, apartment && `кв. ${apartment}`].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: c.muted }}>За раз:</span>
                  <span className="font-medium" style={{ color: c.text }}>{price}₽</span>
                </div>
                <div className="pt-2 mt-1 border-t" style={{ borderColor: `${ACCENT}30` }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: c.muted }}>В неделю:</span>
                    <span className="text-lg font-bold" style={{ color: ACCENT }}>{selectedDays.length * Number(price)}₽</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span style={{ color: c.muted }}>В месяц (~4 нед.):</span>
                    <span className="font-semibold" style={{ color: c.textSub }}>{selectedDays.length * Number(price) * 4}₽</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{ background: c.surface, borderTop: `1px solid ${c.border}`, paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  flex: 1, padding: '0.875rem', borderRadius: '0.875rem',
                  border: `1px solid ${c.border}`, background: 'transparent',
                  color: c.textSub, fontSize: '0.9375rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Назад
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext}
                style={{
                  flex: 1, padding: '0.875rem', borderRadius: '0.875rem',
                  border: 'none', background: ACCENT, color: 'white',
                  fontSize: '0.9375rem', fontWeight: 600,
                  cursor: canNext ? 'pointer' : 'not-allowed',
                  opacity: canNext ? 1 : 0.45,
                  fontFamily: 'inherit',
                }}
              >
                Далее
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!address || !price || submitting}
                style={{
                  flex: 1, padding: '0.875rem', borderRadius: '0.875rem',
                  border: 'none', background: ACCENT, color: 'white',
                  fontSize: '0.9375rem', fontWeight: 600,
                  cursor: (!address || !price || submitting) ? 'not-allowed' : 'pointer',
                  opacity: (!address || !price || submitting) ? 0.45 : 1,
                  fontFamily: 'inherit',
                }}
              >
                {submitting ? 'Создание...' : 'Создать подписку'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
