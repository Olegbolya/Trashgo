import { useNavigate } from 'react-router';
import { ArrowLeft, Users, Copy, Share2, CheckCircle, MapPin, Gift, Zap, Phone, MessageCircle, Briefcase, ChevronRight, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { referralsApi, type ReferralInfo } from '../../api/referrals';

const GREEN = '#16a34a';
const GREEN_LIGHT = '#22c55e';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'сегодня';
  if (days === 1) return '1 день назад';
  if (days < 7) return `${days} дней назад`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 неделю назад' : `${weeks} недели назад`;
}

export default function InviteNeighbor() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  useEffect(() => {
    referralsApi.getMyReferral()
      .then(setReferralInfo)
      .catch(() => toast.error('Не удалось загрузить реферальные данные'))
      .finally(() => setLoading(false));
  }, []);

  const count = referralInfo?.count ?? 0;
  // Use server-computed discount if available, otherwise calculate locally
  const discount = referralInfo?.discount ?? Math.min(count * 2, 20);
  const referralLink = referralInfo?.link ?? '';

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareLink = () => {
    if (!referralLink) return;
    if (navigator.share) {
      navigator.share({
        title: 'TrashGo — вывоз мусора',
        text: `Присоединяйся! Вместе дешевле — уже ${discount}% скидка на вывоз мусора!`,
        url: referralLink,
      });
    }
  };

  // Milestone thresholds for progress display
  const milestones = [
    { count: 1,  discount: 2,  label: '1 сосед',   reward: '−2%' },
    { count: 3,  discount: 6,  label: '3 соседа',  reward: '−6%' },
    { count: 5,  discount: 10, label: '5 соседей', reward: '−10%' },
    { count: 10, discount: 20, label: '10 соседей', reward: '−20% макс' },
  ];
  const nextMilestone = milestones.find((m) => count < m.count);

  return (
    <div className="min-h-screen pb-14" style={{ background: c.bg }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Назад</span>
            </button>
            <div className="text-sm font-semibold" style={{ color: c.text }}>Пригласи соседей</div>
            <div className="w-16" />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTopColor: GREEN_LIGHT }} />
        </div>
      ) : (
        <div className="container mx-auto px-3 py-3 max-w-2xl space-y-3">

          {/* Hero — current discount */}
          <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${GREEN_LIGHT}, ${GREEN})` }}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5" />
                <span className="font-semibold text-base">Программа «Сосед помогает соседу»</span>
              </div>
              <div className="flex items-end gap-4 mb-4">
                <div>
                  <div className="text-xs text-white/80 mb-1">Ваша скидка на сервис</div>
                  <div className="text-5xl font-bold">{discount}%</div>
                </div>
                {discount < 20 && (
                  <div className="text-sm text-white/80 pb-1">
                    {nextMilestone
                      ? `ещё ${nextMilestone.count - count} ${nextMilestone.count - count === 1 ? 'сосед' : 'соседей'} → ${nextMilestone.reward}`
                      : 'максимальная скидка!'}
                  </div>
                )}
              </div>
              {/* Progress bar */}
              <div className="bg-white/20 rounded-full h-2.5 overflow-hidden mb-2">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/70">
                <span>{count} из 10 соседей</span>
                <span>−20% макс</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="text-2xl font-bold" style={{ color: GREEN_LIGHT }}>{count}</div>
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Соседей</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="text-2xl font-bold" style={{ color: GREEN }}>{discount}%</div>
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Скидка</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="text-2xl font-bold" style={{ color: c.text }}>{20 - discount}%</div>
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>До макс.</div>
            </div>
          </div>

          {/* Referral link */}
          <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: c.text }}>Ваша ссылка для соседей</h2>
            <div className="rounded-xl p-3 mb-3" style={{ background: c.subtle, border: `1px solid ${c.border}` }}>
              <div className="text-xs mb-1" style={{ color: c.muted }}>Ссылка для заказчиков</div>
              <div className="text-sm font-mono break-all" style={{ color: c.text }}>{referralLink || '...'}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={copyLink} variant="outline" className="w-full" disabled={!referralLink}>
                {copied
                  ? <><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Скопировано!</>
                  : <><Copy className="w-4 h-4 mr-2" />Копировать</>}
              </Button>
              <Button onClick={shareLink} className="w-full text-white" style={{ background: GREEN }} disabled={!referralLink}>
                <Share2 className="w-4 h-4 mr-2" />Поделиться
              </Button>
            </div>
          </div>

          {/* Milestones */}
          <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: c.text }}>Ступени скидки</h2>
            <div className="space-y-2">
              {milestones.map((m) => {
                const reached = count >= m.count;
                return (
                  <div
                    key={m.count}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: reached ? '#22c55e10' : c.subtle, border: `1px solid ${reached ? '#22c55e40' : c.border}` }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: reached ? GREEN_LIGHT : c.border, color: 'white' }}
                    >
                      {reached ? <CheckCircle className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: reached ? (isDark ? '#86efac' : '#14532d') : c.text }}>{m.label}</div>
                      <div className="text-xs" style={{ color: c.muted }}>{reached ? 'Достигнуто' : `Ещё ${m.count - count}`}</div>
                    </div>
                    <div
                      className="text-sm font-bold px-2 py-1 rounded-lg"
                      style={{ background: reached ? '#22c55e18' : c.border + '40', color: reached ? GREEN : c.muted }}
                    >
                      {m.reward}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invited neighbors list */}
          {referralInfo && referralInfo.referrals.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4" style={{ color: GREEN }} />
                <h2 className="text-sm font-semibold" style={{ color: c.text }}>Ваши соседи ({count})</h2>
              </div>
              <div className="space-y-2">
                {referralInfo.referrals.map((n, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: c.subtle }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${GREEN_LIGHT}, ${GREEN})` }}>
                      {n.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: c.text }}>{n.name}</div>
                      <div className="text-xs" style={{ color: c.muted }}>{timeAgo(n.joinedAt)}</div>
                    </div>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: GREEN_LIGHT }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: '#22c55e14', borderBottom: `1px solid ${c.border}` }}>
              <Zap className="w-4 h-4" style={{ color: GREEN }} />
              <h2 className="text-sm font-semibold" style={{ color: c.text }}>Как работает программа</h2>
            </div>
            <div style={{ background: c.surface }}>
              {[
                {
                  n: 1,
                  title: 'Поделитесь ссылкой',
                  desc: 'Отправьте ссылку соседям — через WhatsApp, в чат подъезда или лично. Ссылка направит их на регистрацию как заказчика.',
                  tag: '📋 Ваша ссылка выше',
                  color: GREEN,
                },
                {
                  n: 2,
                  title: 'Сосед регистрируется',
                  desc: 'Как только сосед зарегистрируется по вашей ссылке — вы получите уведомление и ваша скидка увеличится на 2%.',
                  tag: '✅ Автоматически',
                  color: GREEN,
                },
                {
                  n: 3,
                  title: 'Ваша скидка растёт',
                  desc: 'Каждый приглашённый сосед добавляет +2% к вашей личной скидке на сервисный сбор. Максимум — 20% при 10 соседях.',
                  tag: '🎯 До −20%',
                  color: GREEN_LIGHT,
                },
                {
                  n: 4,
                  title: 'Скидка применяется к сервисному сбору',
                  desc: 'Скидка распространяется на сервисный сбор платформы — подключается автоматически при каждом заказе.',
                  tag: '💳 Постоянно',
                  color: '#0891b2',
                },
              ].map(({ n, title, desc, tag, color }, i, arr) => (
                <div key={n} className="flex gap-3 p-4" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold mt-0.5" style={{ background: color }}>{n}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-0.5" style={{ color: c.text }}>{title}</div>
                    <div className="text-xs mb-2 leading-relaxed" style={{ color: c.muted }}>{desc}</div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: '#22c55e15', color: isDark ? '#86efac' : '#15803d' }}>{tag}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 flex items-start gap-2" style={{ background: '#22c55e10', borderTop: `1px solid ${c.border}` }}>
              <Gift className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: GREEN }} />
              <div className="text-xs leading-relaxed" style={{ color: isDark ? '#86efac' : '#14532d' }}>
                <strong>Скидка личная:</strong> каждый участник программы получает свою скидку пропорционально количеству приглашённых соседей. Пригласили больше — экономите больше.
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)` }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="text-base font-bold mb-2">Расскажите соседям!</div>
              <div className="text-sm text-white/90 mb-4">
                Чем больше вас — тем больше скидка у каждого. Отправьте ссылку прямо сейчас.
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => toast.info('WhatsApp', { description: 'Используйте кнопку «Поделиться» выше' })}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => toast.info('Звонок', { description: 'Функция звонков в разработке' })}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Phone className="w-4 h-4 mr-1.5" />
                  Позвонить
                </Button>
              </div>
            </div>
          </div>

          {/* Cross-link to contractor referral */}
          <div
            className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
            style={{ background: c.surface, border: `1px solid ${c.border}` }}
            onClick={() => navigate('/contractor-referral')}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#2196F318' }}>
              <Briefcase className="w-6 h-6" style={{ color: '#2196F3' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: c.text }}>Вы исполнитель?</div>
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Отдельная программа для исполнителей — приведи напарника и получай денежный бонус</div>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: c.muted }} />
          </div>
        </div>
      )}
    </div>
  );
}
