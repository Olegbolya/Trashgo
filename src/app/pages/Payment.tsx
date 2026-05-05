import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, Wallet, Clock, Info, ChevronRight, Banknote, Copy, TrendingUp, ShoppingBag } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api/auth';
import { toast } from 'sonner';

const ACCENT = '#2196F3';
const GREEN = '#4CAF50';

type PaymentEntry = {
  id: string;
  amount: number;
  address: string;
  district: string;
  date: string;
  type: 'earning' | 'payment';
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function Payment() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuthStore();
  const isContractor = user?.role === 'contractor';
  const [history, setHistory] = useState<PaymentEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

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

  useEffect(() => {
    authApi.paymentHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const totalEarned = history.reduce((s, h) => s + h.amount, 0);

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
              {isContractor ? 'Мои выплаты' : 'История платежей'}
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
                  <span className="text-sm text-white/80">Накопленный баланс</span>
                </div>
                <div className="text-4xl font-bold mb-1">{balance.toLocaleString('ru-RU')}₽</div>
                <div className="text-xs text-white/60 mb-4">Всего выполнено заказов: {history.length}</div>
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <TrendingUp className="w-4 h-4 opacity-80 flex-shrink-0" />
                  <span className="text-xs text-white/80">Заработано всего: <strong className="text-white">{totalEarned.toLocaleString('ru-RU')}₽</strong></span>
                </div>
              </div>
            </div>

            {/* СБП receiving info */}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.text }}>Ваш номер для получения оплаты</span>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between p-3 rounded-xl mb-3" style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}25` }}>
                  <div>
                    <div className="text-xs mb-1" style={{ color: c.muted }}>СБП — Система быстрых платежей</div>
                    <div className="text-lg font-bold" style={{ color: c.text }}>{user?.phone || '—'}</div>
                    <div className="text-xs mt-0.5" style={{ color: c.muted }}>Клиенты переводят деньги на этот номер</div>
                  </div>
                  <button
                    onClick={() => { if (user?.phone) { navigator.clipboard.writeText(user.phone); toast.success('Номер скопирован'); } }}
                    style={{ background: `${GREEN}15`, border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', color: GREEN, display: 'flex' }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs rounded-lg px-3 py-2" style={{ background: c.subtle, color: c.muted }}>
                  Комиссия платформы: <strong style={{ color: c.textSub }}>0%</strong> — клиент переводит вам напрямую через СБП
                </div>
              </div>
            </div>

            {/* INN / Tax status */}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.text }}>Налоговый статус</span>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}30` }}>
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: GREEN }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: c.text }}>Самозанятый</div>
                    <div className="text-xs" style={{ color: c.muted }}>Самостоятельно уплачивайте налог 4% через приложение «Мой налог»</div>
                  </div>
                </div>
                <button
                  onClick={() => toast.info('Укажите ИНН в настройках профиля для ведения учёта')}
                  className="w-full flex items-center justify-between p-3 rounded-xl"
                  style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}20`, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" style={{ color: ACCENT }} />
                    <span className="text-sm" style={{ color: ACCENT }}>Привязать ИНН для учёта доходов</span>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: ACCENT }} />
                </button>
              </div>
            </div>

            {/* Earnings history */}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.text }}>История заработка</span>
              </div>
              {historyLoading ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: c.muted }}>Загружаем...</div>
              ) : history.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: c.muted }}>Выполненных заказов пока нет</div>
              ) : (
                history.map((entry, i) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < history.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${GREEN}15` }}>
                        <Banknote className="w-4 h-4" style={{ color: GREEN }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium" style={{ color: c.text }}>{entry.amount.toLocaleString('ru-RU')}₽</div>
                        <div className="text-xs truncate max-w-[160px]" style={{ color: c.muted }}>{entry.address}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: `${GREEN}15`, color: GREEN }}>Получено</span>
                      <span className="text-xs" style={{ color: c.muted }}>{formatDate(entry.date)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Customer spend summary */}
            <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${ACCENT}, #1565C0)` }}>
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="w-4 h-4 opacity-80" />
                  <span className="text-sm text-white/80">Всего потрачено</span>
                </div>
                <div className="text-4xl font-bold mb-1">{totalEarned.toLocaleString('ru-RU')}₽</div>
                <div className="text-xs text-white/60">Заказов выполнено: {history.length}</div>
              </div>
            </div>

            {/* How P2P payment works */}
            <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" style={{ color: ACCENT }} />
                <span className="text-sm font-semibold" style={{ color: c.text }}>Как работает оплата</span>
              </div>
              <div className="space-y-2">
                {[
                  'Создаёте заказ — исполнитель принимает и выполняет',
                  'Исполнитель фотографирует выполненную работу',
                  'Вы подтверждаете — система показывает телефон для перевода',
                  'Переводите оплату напрямую через СБП — без комиссии',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white mt-0.5" style={{ background: ACCENT }}>{i + 1}</div>
                    <span className="text-sm" style={{ color: c.textSub }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs rounded-lg px-3 py-2 font-medium" style={{ background: `${GREEN}12`, color: GREEN }}>
                Комиссия платформы: 0% — прямой перевод исполнителю через СБП
              </div>
            </div>

            {/* Payment history */}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.text }}>История платежей</span>
              </div>
              {historyLoading ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: c.muted }}>Загружаем...</div>
              ) : history.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: c.muted }}>Выполненных заказов пока нет</div>
              ) : (
                history.map((entry, i) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < history.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}15` }}>
                        <Banknote className="w-4 h-4" style={{ color: ACCENT }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium" style={{ color: c.text }}>{entry.amount.toLocaleString('ru-RU')}₽</div>
                        <div className="text-xs truncate max-w-[160px]" style={{ color: c.muted }}>{entry.address}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: `${ACCENT}15`, color: ACCENT }}>Оплачено</span>
                      <span className="text-xs" style={{ color: c.muted }}>{formatDate(entry.date)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
