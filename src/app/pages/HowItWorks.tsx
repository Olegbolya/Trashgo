import { useNavigate } from 'react-router';
import { ArrowLeft, Package, User, CheckCircle, DollarSign, MapPin, Trash2, ChevronRight, Star, Zap, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PrivacyFooter from '../components/PrivacyFooter';

const GREEN = '#4CAF50';
const BLUE  = '#2196F3';

export default function HowItWorks() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  const customerSteps = [
    {
      icon: User,
      color: BLUE,
      title: 'Создайте заказ',
      desc: 'Укажите адрес, время и объём мусора. Установите удобную цену.',
      tags: ['📍 ул. Баумана, 58', '⏰ Сегодня 18:00', '💰 60₽'],
    },
    {
      icon: Package,
      color: GREEN,
      title: 'Исполнитель принимает',
      desc: 'Ближайший исполнитель видит ваш заказ и берёт его в работу.',
      tags: ['✅ Заказ принят'],
    },
    {
      icon: MapPin,
      color: GREEN,
      title: 'Мусор забирают',
      desc: 'Исполнитель приходит по адресу, забирает и выносит мусор.',
      tags: ['🗑️ Мусор вынесен'],
    },
    {
      icon: CheckCircle,
      color: GREEN,
      title: 'Отметка о выполнении',
      desc: 'Исполнитель нажимает «Выполнено» — вы получаете уведомление.',
    },
    {
      icon: DollarSign,
      color: BLUE,
      title: 'Подтвердите и оплатите',
      desc: 'Проверьте результат и подтвердите выполнение. Оплата списывается автоматически.',
      tags: ['💸 60₽ → Исполнитель'],
      highlight: true,
    },
  ];

  const contractorSteps = [
    {
      icon: Trash2,
      color: GREEN,
      title: 'Найдите заказ',
      desc: 'Просматривайте доступные заказы рядом с вами или ждите новых.',
      tags: ['📍 Вахитовский район', '⏰ Сегодня 19:00', '💰 60₽'],
    },
    {
      icon: CheckCircle,
      color: GREEN,
      title: 'Возьмите в работу',
      desc: 'Нажмите «Взять заказ» — заказ закрепляется за вами.',
      tags: ['✅ Заказ за мной'],
    },
    {
      icon: MapPin,
      color: GREEN,
      title: 'Выполните заказ',
      desc: 'Приедьте по адресу, заберите и вынесьте мусор в контейнер.',
      tags: ['🗑️ Мусор вынесен'],
    },
    {
      icon: Star,
      color: BLUE,
      title: 'Получите оплату',
      desc: 'После подтверждения заказчиком деньги приходят на ваш баланс.',
      tags: ['💸 Баланс пополнен'],
      highlight: true,
    },
  ];

  const advantages = [
    { icon: Shield, color: BLUE,  title: 'Безопасность',    desc: 'Оплата происходит только после подтверждения выполнения заказчиком' },
    { icon: Zap,    color: GREEN, title: 'Быстро',          desc: 'Исполнители рядом с вами — заказ выполняется в день создания' },
    { icon: Star,   color: '#FF9800', title: 'Честный рейтинг', desc: 'После каждого заказа обе стороны оценивают друг друга' },
  ];

  const renderStep = (step: typeof customerSteps[0], index: number, total: number) => {
    const Icon = step.icon;
    const isLast = index === total - 1;
    return (
      <div key={index}>
        <div className="flex gap-4">
          {/* Number + line */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: step.color }}>
              {index + 1}
            </div>
            {!isLast && <div className="w-0.5 flex-1 min-h-[2rem] mt-2 mb-2" style={{ background: `${step.color}30` }} />}
          </div>
          {/* Content */}
          <div className={`flex-1 rounded-2xl p-4 mb-${isLast ? '0' : '2'}`} style={{
            background: step.highlight ? `${step.color}12` : c.subtle,
            border: `1px solid ${step.highlight ? step.color + '40' : c.border}`,
            marginBottom: isLast ? 0 : '0.5rem',
          }}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: step.color }} />
              <div className="text-sm font-semibold" style={{ color: step.highlight ? step.color : c.text }}>{step.title}</div>
            </div>
            <div className="text-xs mb-2" style={{ color: c.muted }}>{step.desc}</div>
            {step.tags && (
              <div className="flex flex-wrap gap-1.5">
                {step.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: c.surface, color: c.textSub, border: `1px solid ${c.border}` }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Назад</span>
            </button>
            <div className="text-sm font-semibold" style={{ color: c.text }}>Как это работает?</div>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 py-4 max-w-2xl space-y-4">

        {/* Hero */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${BLUE}, #1565C0)` }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-6 h-6" />
              <h1 className="text-xl font-bold">TrashGo — просто и честно</h1>
            </div>
            <p className="text-white/85 text-sm leading-relaxed">
              Платформа соединяет заказчиков и исполнителей. Создайте заказ или найдите работу рядом — всё в несколько нажатий.
            </p>
          </div>
        </div>

        {/* Customer scenario */}
        <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BLUE}18` }}>
              <User className="w-5 h-5" style={{ color: BLUE }} />
            </div>
            <div>
              <div className="text-base font-bold" style={{ color: c.text }}>Я заказчик</div>
              <div className="text-xs" style={{ color: c.muted }}>Хочу, чтобы мусор вынесли</div>
            </div>
          </div>
          <div>
            {customerSteps.map((step, i) => renderStep(step, i, customerSteps.length))}
          </div>
        </div>

        {/* Contractor scenario */}
        <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GREEN}18` }}>
              <Trash2 className="w-5 h-5" style={{ color: GREEN }} />
            </div>
            <div>
              <div className="text-base font-bold" style={{ color: c.text }}>Я исполнитель</div>
              <div className="text-xs" style={{ color: c.muted }}>Хочу зарабатывать на выносе мусора</div>
            </div>
          </div>
          <div>
            {contractorSteps.map((step, i) => renderStep(step, i, contractorSteps.length))}
          </div>
        </div>

        {/* Advantages */}
        <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Ключевые преимущества</h2>
          <div className="space-y-3">
            {advantages.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}18` }}>
                    <Icon className="w-4 h-4" style={{ color: a.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-0.5" style={{ color: c.text }}>{a.title}</div>
                    <div className="text-xs" style={{ color: c.muted }}>{a.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ quick */}
        <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Частые вопросы</h2>
          <div className="space-y-2">
            {[
              { q: 'Сколько стоит вынос?',        a: 'От 50₽ — цену устанавливает заказчик при создании заказа.' },
              { q: 'Когда придут деньги?',         a: 'Сразу после подтверждения заказчиком — деньги зачисляются на баланс.' },
              { q: 'Что если исполнитель не пришёл?', a: 'Заказ возвращается в очередь и становится доступен другим исполнителям.' },
              { q: 'Нужна ли регистрация?',        a: 'Да — войдите по номеру телефона, это занимает 30 секунд.' },
            ].map(({ q, a }, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: c.subtle }}>
                <div className="text-sm font-medium mb-0.5" style={{ color: c.text }}>{q}</div>
                <div className="text-xs" style={{ color: c.muted }}>{a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
          style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}30` }}
          onClick={() => navigate(-1)}
        >
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ color: c.text }}>Готовы начать?</div>
            <div className="text-xs mt-0.5" style={{ color: c.muted }}>Вернитесь в личный кабинет и создайте первый заказ</div>
          </div>
          <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: GREEN }} />
        </div>

      </div>
      <PrivacyFooter />
    </div>
  );
}
