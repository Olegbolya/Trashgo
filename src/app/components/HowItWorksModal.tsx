interface Step {
  icon: string;
  title: string;
  desc: string;
}

const CUSTOMER_STEPS: Step[] = [
  { icon: '📝', title: 'Создайте заказ', desc: 'Укажите адрес, количество мешков, удобное время или выберите «Как можно скорее». При желании добавьте фото мусора.' },
  { icon: '🔍', title: 'Исполнитель найдёт вас', desc: 'Ваш заказ увидят исполнители в вашем районе. Один из них возьмёт заказ — вы получите уведомление.' },
  { icon: '🚛', title: 'Мусор вывезут', desc: 'Исполнитель приедет по адресу, заберёт мешки и отнесёт в мусорный бак. Вы можете общаться с ним в чате.' },
  { icon: '📷', title: 'Фото как доказательство', desc: 'После выполнения исполнитель присылает фото мусора у бака. Вы видите результат перед подтверждением.' },
  { icon: '✅', title: 'Подтвердите выполнение', desc: 'Проверьте фото и нажмите «Подтвердить». Оплата автоматически зачислится исполнителю на баланс.' },
  { icon: '⭐', title: 'Оцените исполнителя', desc: 'Поставьте оценку от 1 до 5 звёзд. Это помогает другим клиентам выбирать проверенных исполнителей.' },
];

const CONTRACTOR_STEPS: Step[] = [
  { icon: '🟢', title: 'Включите режим «Открыт для заказов»', desc: 'Нажмите переключатель в шапке, чтобы начать принимать заявки из вашего района.' },
  { icon: '👀', title: 'Найдите подходящий заказ', desc: 'Откройте вкладку «Найти заказ» — там все доступные заявки. Нажмите на карточку, чтобы увидеть детали.' },
  { icon: '🗺️', title: 'Проверьте маршрут', desc: 'В деталях заказа нажмите «Маршрут на карте» — увидите адрес на карте. Кнопки Google Maps и 2GIS откроют навигацию.' },
  { icon: '✋', title: 'Возьмите заказ', desc: 'Нажмите «Взять заказ». Заявка переходит к вам — другие исполнители её больше не видят. Езжайте к клиенту.' },
  { icon: '📷', title: 'Сфотографируйте результат', desc: 'После вывоза сделайте фото мусора у бака. Без фото завершить заказ не получится — это защита для клиента.' },
  { icon: '💰', title: 'Получите оплату', desc: 'Клиент подтверждает выполнение — деньги сразу зачисляются на ваш баланс в TrashGo.' },
];

interface Props {
  variant: 'customer' | 'contractor';
  isDark: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ variant, isDark, onClose }: Props) {
  const steps = variant === 'customer' ? CUSTOMER_STEPS : CONTRACTOR_STEPS;
  const ACCENT = variant === 'customer' ? '#66BB6A' : '#2196F3';

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end lg:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full lg:max-w-lg rounded-t-2xl lg:rounded-2xl overflow-y-auto"
        style={{ background: c.surface, maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, background: c.surface, zIndex: 1 }}
        >
          <div>
            <div className="text-lg font-bold" style={{ color: c.text }}>Как это работает?</div>
            <div className="text-xs mt-0.5" style={{ color: c.muted }}>
              {variant === 'customer' ? 'Для заказчика' : 'Для исполнителя'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: c.subtle, border: 'none', cursor: 'pointer', color: c.muted, borderRadius: '0.5rem', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
          >
            ✕
          </button>
        </div>

        {/* Steps */}
        <div className="p-4 space-y-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-2xl"
              style={{ background: c.subtle, border: `1px solid ${c.border}` }}
            >
              <div
                className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${ACCENT}18` }}
              >
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ background: ACCENT, color: 'white' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: c.text }}>{step.title}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: c.muted }}>{step.desc}</p>
              </div>
            </div>
          ))}

          <div className="p-4 rounded-2xl text-center" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30` }}>
            <div className="text-sm font-semibold mb-1" style={{ color: ACCENT }}>
              {variant === 'customer' ? '🏠 Чистота без лишних усилий' : '💼 Зарабатывайте в удобное время'}
            </div>
            <div className="text-xs" style={{ color: c.muted }}>
              {variant === 'customer'
                ? 'TrashGo соединяет вас с надёжными исполнителями рядом с домом'
                : 'Берите столько заказов, сколько хотите, в своём районе'}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl text-sm font-semibold"
            style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Понятно, начать!
          </button>
        </div>
      </div>
    </div>
  );
}
