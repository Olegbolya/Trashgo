import { useNavigate } from 'react-router';
import { Users, Copy, Share2, CheckCircle, Gift, Zap, ChevronRight } from 'lucide-react';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { referralsApi, type ReferralInfo } from '../../api/referrals';

const ACCENT = '#2196F3';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'сегодня';
  if (days === 1) return '1 день назад';
  if (days < 7) return `${days} дней назад`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 неделю назад' : `${weeks} недели назад`;
}

export default function ContractorReferral() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  useEffect(() => {
    document.title = 'Приведи напарника — TrashGo';
    return () => { document.title = 'TrashGo — Вывоз мусора в Казани'; };
  }, []);

  useEffect(() => {
    referralsApi.getMyContractorReferral()
      .then(setInfo)
      .catch(() => toast.error('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }, []);

  const count = info?.count ?? 0;
  const link = info?.link ?? '';

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (!link || !navigator.share) return;
    navigator.share({ title: 'TrashGo — работа рядом с домом', text: 'Присоединяйся к TrashGo — вывози мусор и зарабатывай!', url: link });
  };

  // Achievements
  const achievements = [
    { icon: '🤝', title: 'Наставник', desc: 'Пригласи 1 исполнителя', target: 1, reward: '+50 XP' },
    { icon: '👷', title: 'Бригадир',  desc: 'Пригласи 3 исполнителей', target: 3, reward: '+150 XP' },
    { icon: '🏗️', title: 'Подрядчик', desc: 'Пригласи 5 исполнителей', target: 5, reward: '+500 XP + бейдж' },
  ];

  return (
    <div className="min-h-screen pb-14" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
        </div>
      ) : (
        <div className="container mx-auto px-3 py-3 max-w-2xl space-y-3">

          {/* Hero */}
          <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${ACCENT}, #1565C0)` }}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-6 h-6" />
                <h1 className="text-2xl font-bold">Приведи напарника</h1>
              </div>
              <div className="text-white/90 text-sm mb-5">
                Пригласи друга стать исполнителем — получи денежный бонус когда он выполнит первые 5 заказов
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold">+150₽</div>
                  <div className="text-xs text-white/80 mt-1">после 5 заказов напарника</div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold">+5%</div>
                  <div className="text-xs text-white/80 mt-1">от каждого его заказа в 1-й месяц</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="text-3xl font-bold mb-1" style={{ color: ACCENT }}>{count}</div>
              <div className="text-xs" style={{ color: c.muted }}>Приглашено исполнителей</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="text-3xl font-bold mb-1" style={{ color: '#4CAF50' }}>{count >= 1 ? `${count * 150}₽` : '0₽'}</div>
              <div className="text-xs" style={{ color: c.muted }}>Потенциальный бонус</div>
            </div>
          </div>

          {/* Referral link + CTA — merged */}
          <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="px-4 py-3" style={{ background: `${ACCENT}14`, borderBottom: `1px solid ${c.border}` }}>
              <div className="text-base font-bold mb-0.5" style={{ color: c.text }}>Расскажи напарникам!</div>
              <div className="text-xs" style={{ color: c.muted }}>Поделись ссылкой — они зарегистрируются как исполнители, ты получишь бонус</div>
            </div>
            <div className="p-4">
              <div className="rounded-lg p-3 mb-3" style={{ background: c.subtle, border: `1px solid ${c.border}` }}>
                <div className="text-xs mb-1" style={{ color: c.muted }}>Ваша реферальная ссылка для исполнителей</div>
                <div className="text-sm font-mono break-all" style={{ color: c.text }}>{link || '...'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyLink}
                  disabled={!link}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: `1px solid ${c.border}`, background: 'transparent', color: c.text, cursor: !link ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', opacity: !link ? 0.5 : 1 }}
                >
                  {copied ? <><CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />Скопировано!</> : <><Copy className="w-4 h-4" />Копировать</>}
                </button>
                <button
                  onClick={shareLink}
                  disabled={!link}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: ACCENT, color: 'white', cursor: !link ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', opacity: !link ? 0.5 : 1 }}
                >
                  <Share2 className="w-4 h-4" />Поделиться
                </button>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: `${ACCENT}14`, borderBottom: `1px solid ${c.border}` }}>
              <Zap className="w-4 h-4" style={{ color: ACCENT }} />
              <h2 className="text-sm font-semibold" style={{ color: c.text }}>Как работает программа «Приведи напарника»</h2>
            </div>

            <div style={{ background: c.surface }}>
              {/* Step 1 */}
              <div className="flex gap-3 p-4" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm" style={{ background: ACCENT }}>1</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold mb-0.5" style={{ color: c.text }}>Поделитесь уникальной ссылкой</div>
                  <div className="text-xs leading-relaxed" style={{ color: c.muted }}>Скопируйте ссылку выше и отправьте знакомому. Ссылка автоматически направит его на регистрацию как <strong style={{ color: c.textSub }}>исполнителя</strong> — не заказчика.</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 p-4" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm" style={{ background: ACCENT }}>2</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold mb-0.5" style={{ color: c.text }}>Напарник выполняет первые 5 заказов</div>
                  <div className="text-xs leading-relaxed" style={{ color: c.muted }}>Он регистрируется, находит заказы рядом с домом и начинает работать. Ваш бонус копится незаметно для него.</div>
                </div>
              </div>

              {/* Step 3 — highlight */}
              <div className="flex gap-3 p-4" style={{ borderBottom: `1px solid ${c.border}`, background: `${ACCENT}08` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm" style={{ background: '#4CAF50' }}>3</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="text-sm font-semibold" style={{ color: c.text }}>Вы получаете</div>
                    <span className="text-sm font-bold px-2 py-0.5 rounded-lg text-white" style={{ background: '#4CAF50' }}>+150₽</span>
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: c.muted }}>После 5-го выполненного заказа напарника — 150₽ зачисляется на ваш баланс автоматически. Деньги доступны сразу.</div>
                </div>
              </div>

              {/* Step 4 — highlight */}
              <div className="flex gap-3 p-4" style={{ background: `${ACCENT}05` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm" style={{ background: '#FF9800' }}>4</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <div className="text-sm font-semibold" style={{ color: c.text }}>Ещё</div>
                    <span className="text-sm font-bold px-2 py-0.5 rounded-lg text-white" style={{ background: '#FF9800' }}>+5% весь первый месяц</span>
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: c.muted }}>С каждого следующего заказа напарника вы получаете 5% от его суммы. Максимум — 500₽ за месяц. После месяца бонус заканчивается.</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="px-4 py-3 flex items-start gap-2" style={{ background: `${ACCENT}10`, borderTop: `1px solid ${c.border}` }}>
              <Gift className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
              <div className="text-xs leading-relaxed" style={{ color: isDark ? '#93c5fd' : '#1d4ed8' }}>
                <strong>Итого за одного напарника:</strong> до <strong>150₽ + 500₽ = 650₽</strong> в первый месяц. Приглашайте больше — бонусы суммируются.
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Достижения</h2>
            <div className="space-y-2">
              {achievements.map((a) => {
                const unlocked = count >= a.target;
                return (
                  <div key={a.title} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: unlocked ? `${ACCENT}12` : c.subtle, border: `1px solid ${unlocked ? ACCENT + '30' : c.border}` }}>
                    <div className="text-2xl">{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold flex items-center gap-2" style={{ color: unlocked ? ACCENT : c.text }}>
                        {a.title}
                        {unlocked && <CheckCircle className="w-3.5 h-3.5" style={{ color: '#4CAF50' }} />}
                      </div>
                      <div className="text-xs" style={{ color: c.muted }}>{a.desc}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: unlocked ? '#4CAF5018' : c.border + '40', color: unlocked ? '#4CAF50' : c.muted }}>
                        {a.reward}
                      </div>
                      <div className="text-[10px] text-center mt-1" style={{ color: c.muted }}>{count}/{a.target}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Referred contractors list */}
          {info && info.referrals.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Ваши напарники ({count})</h2>
              <div className="space-y-2">
                {info.referrals.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: c.subtle }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: ACCENT }}>
                      {r.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: c.text }}>{r.name}</div>
                      <div className="text-xs" style={{ color: c.muted }}>{timeAgo(r.joinedAt)}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.isActive ? '#4CAF50' : '#9ca3af' }} />
                      <span className="text-xs font-medium" style={{ color: r.isActive ? '#4CAF50' : c.muted }}>
                        {r.isActive ? 'активен' : 'неактивен'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bonus cap note */}
          <div className="rounded-2xl p-4" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}30` }}>
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <div className="text-xs" style={{ color: c.textSub }}>
                <strong style={{ color: c.text }}>Условия программы:</strong> бонус +5% от заказов напарника действует первые 30 дней с момента его регистрации. Максимальный бонус — 500₽ в месяц с одного напарника. Бонус зачисляется на баланс и доступен для вывода.
              </div>
            </div>
          </div>

          {/* Customer referral cross-link */}
          <div
            className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
            style={{ background: c.surface, border: `1px solid ${c.border}` }}
            onClick={() => navigate('/invite-neighbor')}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#66BB6A18' }}>
              <Zap className="w-6 h-6" style={{ color: '#66BB6A' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: c.text }}>Вы также заказчик?</div>
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Приглашайте соседей и получайте скидку на вывоз мусора</div>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: c.muted }} />
          </div>
        </div>
      )}
    </div>
  );
}
