import { useNavigate } from 'react-router';
import { Users, Copy, Share2, CheckCircle, Gift, Briefcase, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { referralsApi, type ReferralInfo } from '../../api/referrals';
import { accessPlansApi, type AccessPlanStatus } from '../../api/access-plans';

const GREEN = '#22c55e';
const GREEN_DARK = '#16a34a';
const PRICE = 50;
const DISCOUNT_PER = 10;
const MAX_FREE = 5;

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
  const [planStatus, setPlanStatus] = useState<AccessPlanStatus | null>(null);
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
    Promise.all([
      referralsApi.getMyReferral(),
      accessPlansApi.getStatus().catch(() => null),
    ])
      .then(([info, status]) => {
        setReferralInfo(info);
        setPlanStatus(status);
      })
      .catch(() => toast.error('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = referralInfo?.referrals.filter(r => r.isActive).length ?? 0;
  const totalCount = referralInfo?.count ?? 0;
  const discount = Math.min(activeCount * DISCOUNT_PER, PRICE);
  const nextPrice = Math.max(PRICE - discount, 0);
  const referralLink = referralInfo?.link ?? '';

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareLink = () => {
    if (!referralLink) return;
    const text = activeCount >= MAX_FREE
      ? `Присоединяйся к TrashGo — вывоз мусора рядом с домом. Первый месяц бесплатно!`
      : `Присоединяйся к TrashGo! Если 5 друзей активны — абонемент бесплатный (сейчас ${nextPrice === 0 ? 'бесплатно' : `${nextPrice}₽/мес`}).`;
    if (navigator.share) {
      navigator.share({ title: 'TrashGo — вывоз мусора', text, url: referralLink });
    } else {
      copyLink();
    }
  };

  return (
    <div className="min-h-screen pb-14" style={{ background: c.bg }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTopColor: GREEN }} />
        </div>
      ) : (
        <div className="container mx-auto px-3 py-3 max-w-2xl space-y-3">

          {/* Hero — subscription price */}
          <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5" />
                <span className="font-semibold text-base">Пригласи соседей — плати меньше</span>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <div>
                  <div className="text-xs text-white/80 mb-1">Ваш абонемент сейчас</div>
                  {discount > 0 ? (
                    <div className="flex items-end gap-2">
                      <div className="text-5xl font-bold">{nextPrice === 0 ? '0₽' : `${nextPrice}₽`}</div>
                      <div className="text-2xl text-white/60 line-through pb-1">{PRICE}₽</div>
                    </div>
                  ) : (
                    <div className="text-5xl font-bold">{PRICE}₽<span className="text-xl font-normal text-white/80">/мес</span></div>
                  )}
                </div>
              </div>
              {/* Progress bar to free */}
              <div className="bg-white/20 rounded-full h-2.5 overflow-hidden mb-2">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((activeCount / MAX_FREE) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/70">
                <span>{activeCount} из {MAX_FREE} активных рефералов</span>
                <span>бесплатно →</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="text-2xl font-bold" style={{ color: GREEN }}>{totalCount}</div>
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Приглашено</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="text-2xl font-bold" style={{ color: GREEN_DARK }}>{activeCount}</div>
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Активных</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="text-2xl font-bold" style={{ color: c.text }}>{discount}₽</div>
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Скидка</div>
            </div>
          </div>

          {/* Share link */}
          <div className="rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="px-4 py-3" style={{ background: `${GREEN}15`, borderBottom: `1px solid ${c.border}` }}>
              <div className="text-base font-bold mb-0.5" style={{ color: c.text }}>Поделитесь ссылкой</div>
              <div className="text-xs" style={{ color: c.muted }}>Каждый активный реферал даёт −{DISCOUNT_PER}₽ к цене абонемента</div>
            </div>
            <div className="p-4">
              <div className="rounded-xl p-3 mb-3" style={{ background: c.subtle, border: `1px solid ${c.border}` }}>
                <div className="text-xs mb-1" style={{ color: c.muted }}>Ваша ссылка</div>
                <div className="text-sm font-mono break-all" style={{ color: c.text }}>{referralLink || '...'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyLink}
                  disabled={!referralLink}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.75rem', border: `1px solid ${c.border}`, background: 'transparent', color: c.text, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: 500 }}
                >
                  {copied ? <><CheckCircle size={16} color={GREEN_DARK} /> Скопировано!</> : <><Copy size={16} /> Копировать</>}
                </button>
                <button
                  onClick={shareLink}
                  disabled={!referralLink}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.75rem', border: 'none', background: GREEN, color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: 500 }}
                >
                  <Share2 size={16} /> Поделиться
                </button>
              </div>
            </div>
          </div>

          {/* Discount ladder */}
          <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="text-sm font-semibold mb-3" style={{ color: c.text }}>Как работает скидка</div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((n) => {
                const reached = activeCount >= n;
                const price = Math.max(PRICE - n * DISCOUNT_PER, 0);
                return (
                  <div
                    key={n}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: reached ? '#22c55e10' : c.subtle, border: `1px solid ${reached ? '#22c55e40' : c.border}` }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold" style={{ background: reached ? GREEN : c.border }}>
                      {reached ? '✓' : n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: reached ? (isDark ? '#86efac' : '#14532d') : c.text }}>
                        {n} {n === 1 ? 'активный реферал' : n < 5 ? 'активных реферала' : 'активных рефералов'}
                      </div>
                    </div>
                    <div className="text-sm font-bold px-2 py-1 rounded-lg" style={{ background: reached ? '#22c55e18' : 'transparent', color: reached ? GREEN_DARK : c.muted, border: reached ? 'none' : `1px solid ${c.border}` }}>
                      {price === 0 ? 'Бесплатно' : `${price}₽/мес`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Referral list */}
          {referralInfo && referralInfo.referrals.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="text-sm font-semibold mb-3" style={{ color: c.text }}>
                Ваши рефералы ({totalCount})
              </div>
              <div className="space-y-2">
                {referralInfo.referrals.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: c.subtle }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}>
                      {r.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: c.text }}>{r.name}</div>
                      <div className="text-xs" style={{ color: c.muted }}>{timeAgo(r.joinedAt)}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.isActive ? GREEN : '#9ca3af' }} />
                      <span className="text-xs font-medium" style={{ color: r.isActive ? GREEN_DARK : c.muted }}>
                        {r.isActive ? `−${DISCOUNT_PER}₽` : 'неактивен'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {referralInfo.referrals.some(r => !r.isActive) && (
                <div className="mt-3 p-3 rounded-xl" style={{ background: isDark ? '#1f2937' : '#fef3c7', border: `1px solid ${isDark ? '#374151' : '#fde68a'}` }}>
                  <div className="text-xs" style={{ color: isDark ? '#fbbf24' : '#92400e' }}>
                    ⚠️ Неактивные рефералы не учитываются в скидке — скидка восстанавливается, когда они продлевают абонемент
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div className="rounded-2xl p-4" style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}30` }}>
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN_DARK }} />
              <div className="text-xs leading-relaxed" style={{ color: isDark ? '#86efac' : '#14532d' }}>
                <strong>Скидка динамическая:</strong> учитываются только рефералы с активным абонементом. Если реферал не продлил — скидка уменьшается. Продлил снова — восстанавливается.
              </div>
            </div>
          </div>

          {/* Cross-link */}
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
              <div className="text-xs mt-0.5" style={{ color: c.muted }}>Отдельная программа для исполнителей — приведи напарника</div>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: c.muted }} />
          </div>
        </div>
      )}
    </div>
  );
}
