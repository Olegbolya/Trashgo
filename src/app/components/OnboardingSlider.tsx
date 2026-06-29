import { useState, useRef, useEffect } from 'react';

interface Slide {
  emoji: string;
  title: string;
  text: string;
}

const CUSTOMER_SLIDES: Slide[] = [
  {
    emoji: '🗑️',
    title: 'Добро пожаловать в TrashGo!',
    text: 'Закажите вывоз мусора у проверенных соседей. Быстро, удобно и выгодно.',
  },
  {
    emoji: '📦',
    title: 'Создайте заказ за минуту',
    text: 'Укажите адрес, объём мусора и цену. Исполнители из вашего района откликнутся сами.',
  },
  {
    emoji: '🏆',
    title: 'Следите и зарабатывайте XP',
    text: 'Отслеживайте статус в реальном времени, оценивайте исполнителей и прокачивайте уровень.',
  },
];

const CONTRACTOR_SLIDES: Slide[] = [
  {
    emoji: '💼',
    title: 'Добро пожаловать в TrashGo!',
    text: 'Берите заказы рядом с домом и зарабатывайте в удобное для вас время.',
  },
  {
    emoji: '🔍',
    title: 'Найдите подходящий заказ',
    text: 'Фильтруйте по району, дате и цене. Принимайте выгодные заявки одним нажатием.',
  },
  {
    emoji: '⭐',
    title: 'Выполняйте и прокачивайтесь',
    text: 'Фотографируйте результат, получайте рейтинг от заказчиков и открывайте достижения.',
  },
];

interface Props {
  role: 'customer' | 'contractor';
  isDark: boolean;
  onFinish: () => void;
}

export function OnboardingSlider({ role, isDark, onFinish }: Props) {
  const [step, setStep] = useState(0);
  const slides = role === 'customer' ? CUSTOMER_SLIDES : CONTRACTOR_SLIDES;
  const slide = slides[step];
  const isLast = step === slides.length - 1;
  const touchStartX = useRef<number | null>(null);

  const ACCENT = role === 'customer' ? '#4CAF50' : '#2196F3';
  const bg = isDark ? '#111827' : '#ffffff';
  const overlay = 'rgba(0,0,0,0.6)';
  const text = isDark ? '#f9fafb' : '#111827';
  const muted = isDark ? '#9ca3af' : '#6b7280';
  const subtle = isDark ? '#1f2937' : '#f3f4f6';

  // Skip onboarding if already dismissed for this role
  useEffect(() => {
    if (localStorage.getItem('onboarding_done_' + role)) {
      onFinish();
    }
  }, [role, onFinish]);

  const handleDismiss = () => {
    localStorage.setItem('onboarding_done_' + role, '1');
    onFinish();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta < -50) {
      // swipe left → next
      if (isLast) { onFinish(); } else { setStep(s => s + 1); }
    } else if (delta > 50) {
      // swipe right → back
      if (step > 0) setStep(s => s - 1);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: overlay,
    }}>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%', maxWidth: '480px',
          background: bg, borderRadius: '1.5rem 1.5rem 0 0',
          padding: '2rem 1.5rem 2.5rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
        }}
      >
        {/* Handle */}
        <div style={{ width: '2.5rem', height: '0.25rem', borderRadius: '2px', background: isDark ? '#374151' : '#d1d5db', marginBottom: '0.25rem' }} />

        {/* Skip */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onFinish}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: '0.875rem', fontFamily: 'inherit', padding: '0.25rem 0' }}
          >
            Пропустить
          </button>
        </div>

        {/* Emoji */}
        <div style={{
          width: '5rem', height: '5rem', borderRadius: '1.5rem',
          background: `${ACCENT}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem',
        }}>
          {slide.emoji}
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: text, marginBottom: '0.625rem', lineHeight: 1.3 }}>
            {slide.title}
          </div>
          <div style={{ fontSize: '0.9375rem', color: muted, lineHeight: 1.55 }}>
            {slide.text}
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? '1.5rem' : '0.5rem',
                height: '0.5rem',
                borderRadius: '0.25rem',
                background: i === step ? ACCENT : (isDark ? '#374151' : '#d1d5db'),
                transition: 'width 0.25s, background 0.25s',
              }}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={() => isLast ? onFinish() : setStep(s => s + 1)}
          style={{
            width: '100%', height: '3rem', borderRadius: '0.875rem',
            background: ACCENT, color: 'white', border: 'none',
            fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'opacity 0.15s',
          }}
        >
          {isLast ? 'Начать' : 'Далее'}
        </button>

        {/* Dismiss forever */}
        <button
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: '0.8rem', fontFamily: 'inherit', padding: '0.25rem 0', marginTop: '-0.5rem' }}
        >
          Больше не показывать
        </button>
      </div>
    </div>
  );
}
