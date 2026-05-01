import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CreditCard, Plus, Trash2, CheckCircle, AlertCircle, Wallet, Clock, Info, ChevronRight, Banknote } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { toast } from 'sonner';

const ACCENT = '#2196F3';
const GREEN = '#4CAF50';

const mockPayoutHistory = [
  { date: '28 апр', amount: 750, status: 'done' },
  { date: '21 апр', amount: 500, status: 'done' },
  { date: '14 апр', amount: 1200, status: 'done' },
];

const mockCards = [
  { id: '1', mask: '4242', brand: 'Visa',        bank: 'Тинькофф', isDefault: true },
  { id: '2', mask: '9087', brand: 'МИР',         bank: 'Сбербанк',  isDefault: false },
];

export default function Payment() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuthStore();
  const isContractor = user?.role === 'contractor';
  const [cards, setCards] = useState(mockCards);
  const [withdrawing, setWithdrawing] = useState(false);

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  const balance = user?.balance ?? 0;

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    toast.success('Карта удалена');
  };

  const setDefault = (id: string) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    toast.success('Карта выбрана основной');
  };

  const handleWithdraw = async () => {
    if (balance < 100) {
      toast.error('Минимальная сумма вывода — 100₽');
      return;
    }
    setWithdrawing(true);
    await new Promise(r => setTimeout(r, 1500));
    setWithdrawing(false);
    toast.success('Заявка на вывод отправлена', { description: 'Средства поступят в течение 1-3 рабочих дней' });
  };

  return (
    <div className="min-h-screen pb-14" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
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
            <div className="text-sm font-semibold" style={{ color: c.text }}>
              {isContractor ? 'Выплаты' : 'Способ оплаты'}
            </div>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 py-3 max-w-2xl space-y-3">

        {isContractor ? (
          <>
            {/* Balance card */}
            <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${ACCENT}, #1565C0)` }}>
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 opacity-80" />
                  <span className="text-sm text-white/80">Баланс</span>
                </div>
                <div className="text-4xl font-bold mb-4">{balance.toLocaleString('ru-RU')}₽</div>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing || balance < 100}
                  style={{
                    background: balance >= 100 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: balance >= 100 && !withdrawing ? 'pointer' : 'not-allowed',
                    opacity: balance < 100 ? 0.6 : 1,
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {withdrawing ? (
                    <><div className="w-4 h-4 border-2 border-white/40 rounded-full animate-spin" style={{ borderTopColor: 'white' }} />Отправка...</>
                  ) : (
                    <><Banknote className="w-4 h-4" />Вывести средства</>
                  )}
                </button>
                {balance < 100 && (
                  <div className="text-xs text-white/70 mt-2">Минимум для вывода: 100₽</div>
                )}
              </div>
            </div>

            {/* Tax status */}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.text }}>Налоговый статус</span>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}30` }}>
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: GREEN }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: c.text }}>Самозанятый</div>
                    <div className="text-xs" style={{ color: c.muted }}>Статус подтверждён • ИНН не указан</div>
                  </div>
                </div>
                <button
                  onClick={() => toast.info('Укажите ИНН для автоматического формирования чеков')}
                  className="w-full flex items-center justify-between p-3 rounded-xl"
                  style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}20`, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" style={{ color: ACCENT }} />
                    <span className="text-sm" style={{ color: ACCENT }}>Привязать ИНН для выплат</span>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: ACCENT }} />
                </button>
              </div>
            </div>

            {/* Payout card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.text }}>Карта для выплат</span>
              </div>
              {cards.filter(c => c.isDefault).map(card => (
                <div key={card.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                        <CreditCard className="w-5 h-5" style={{ color: ACCENT }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: c.text }}>•••• {card.mask}</div>
                        <div className="text-xs" style={{ color: c.muted }}>{card.bank} • {card.brand}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toast.info('Смена карты для выплат будет доступна после подключения ЮKassa')}
                      style={{ background: 'none', border: `1px solid ${c.border}`, borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', color: c.muted, fontFamily: 'inherit' }}
                    >
                      Изменить
                    </button>
                  </div>
                  <div className="mt-3 text-xs rounded-lg px-3 py-2" style={{ background: c.subtle, color: c.muted }}>
                    График выплат: каждые 3 дня • Минимум 100₽
                  </div>
                </div>
              ))}
            </div>

            {/* Payout history */}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.text }}>История выплат</span>
              </div>
              {mockPayoutHistory.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < mockPayoutHistory.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${GREEN}15` }}>
                      <CheckCircle className="w-4 h-4" style={{ color: GREEN }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: c.text }}>{p.amount.toLocaleString('ru-RU')}₽</div>
                      <div className="text-xs" style={{ color: c.muted }}>{p.date}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: `${GREEN}15`, color: GREEN }}>Выплачено</span>
                </div>
              ))}
              {mockPayoutHistory.length === 0 && (
                <div className="px-4 py-6 text-center text-sm" style={{ color: c.muted }}>История выплат пуста</div>
              )}
            </div>

            <div className="rounded-xl px-4 py-3 text-xs" style={{ background: `${ACCENT}10`, color: c.muted }}>
              Выплаты производятся через ЮKassa. Для получения выплат необходимо быть самозанятым или ИП.
            </div>
          </>
        ) : (
          <>
            {/* Cards */}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                <CreditCard className="w-4 h-4" style={{ color: ACCENT }} />
                <span className="text-sm font-semibold" style={{ color: c.text }}>Банковские карты</span>
              </div>
              {cards.map((card, i) => (
                <div key={card.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < cards.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: card.isDefault ? `${ACCENT}15` : c.subtle }}>
                    <CreditCard className="w-4 h-4" style={{ color: card.isDefault ? ACCENT : c.muted }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: c.text }}>•••• {card.mask}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: c.subtle, color: c.muted }}>{card.brand}</span>
                      {card.isDefault && <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT }}>Основная</span>}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>{card.bank}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!card.isDefault && (
                      <button
                        onClick={() => setDefault(card.id)}
                        style={{ background: 'none', border: `1px solid ${c.border}`, borderRadius: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer', color: c.muted, fontFamily: 'inherit' }}
                      >
                        Выбрать
                      </button>
                    )}
                    <button
                      onClick={() => removeCard(card.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, padding: '0.25rem', display: 'flex' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => toast.info('Добавление карт будет доступно после подключения ЮKassa')}
                className="w-full flex items-center gap-3 px-4 py-3"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: ACCENT }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Добавить карту</span>
              </button>
            </div>

            {/* SBP */}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                <Wallet className="w-4 h-4" style={{ color: GREEN }} />
                <span className="text-sm font-semibold" style={{ color: c.text }}>Система быстрых платежей</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GREEN}15` }}>
                  <Banknote className="w-4 h-4" style={{ color: GREEN }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: c.text }}>СБП (через любой банк)</div>
                  <div className="text-xs mt-0.5" style={{ color: c.muted }}>Мгновенная оплата без комиссии банков</div>
                </div>
                <button
                  onClick={() => toast.info('СБП будет доступен после подключения платёжной системы')}
                  style={{ background: 'none', border: `1px solid ${c.border}`, borderRadius: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer', color: c.muted, fontFamily: 'inherit' }}
                >
                  Настроить
                </button>
              </div>
            </div>

            {/* How payment works */}
            <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" style={{ color: ACCENT }} />
                <span className="text-sm font-semibold" style={{ color: c.text }}>Как работает оплата</span>
              </div>
              <div className="space-y-2">
                {[
                  { text: 'Создаёте заказ — деньги резервируются (не списываются)' },
                  { text: 'Исполнитель выполняет заказ' },
                  { text: 'Вы подтверждаете — деньги переходят исполнителю' },
                  { text: 'Если не подтвердили 24ч — заказ закрывается автоматически' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white mt-0.5" style={{ background: ACCENT }}>{i + 1}</div>
                    <span className="text-sm" style={{ color: c.textSub }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl px-4 py-3 text-xs flex items-start gap-2" style={{ background: `${ACCENT}10`, color: c.muted }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <span>Деньги списываются <strong style={{ color: c.textSub }}>только после подтверждения выполнения</strong>. До этого момента средства находятся в резерве и не переходят исполнителю.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
