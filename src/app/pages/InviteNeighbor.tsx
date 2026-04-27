import { useNavigate } from 'react-router';
import { ArrowLeft, Users, TrendingDown, Copy, Share2, CheckCircle, MapPin, Gift, Sparkles, Phone, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { referralsApi, type ReferralInfo } from '../../api/referrals';

export default function InviteNeighbor() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    referralsApi.getMyReferral()
      .then(setReferralInfo)
      .catch(() => toast.error('Не удалось загрузить реферальные данные'))
      .finally(() => setLoading(false));
  }, []);

  // Скидочная механика
  const basePrice = 60;
  const maxDiscount = 20;
  const discountPerPerson = 2;
  const currentNeighbors = referralInfo?.count ?? 0;

  const calculateDiscount = (neighbors: number) => Math.min(neighbors * discountPerPerson, maxDiscount);
  const calculatePrice = (neighbors: number) => {
    const discount = calculateDiscount(neighbors);
    return basePrice - (basePrice * discount / 100);
  };

  const currentDiscount = calculateDiscount(currentNeighbors);
  const currentPrice = calculatePrice(currentNeighbors);
  const nextPrice = calculatePrice(currentNeighbors + 1);
  const maxPrice = calculatePrice(10);
  const progressToMax = (currentNeighbors / 10) * 100;

  const referralLink = referralInfo?.link ?? '';

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (!referralLink) return;
    if (navigator.share) {
      navigator.share({
        title: 'TrashGo - Вывоз мусора',
        text: `Присоединяйся! Вместе дешевле — уже ${currentDiscount}% скидка!`,
        url: referralLink,
      });
    }
  };

  const formatJoinedAt = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'сегодня';
    if (days === 1) return '1 день назад';
    if (days < 7) return `${days} дней назад`;
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 неделю назад' : `${weeks} недели назад`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Назад</span>
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="container mx-auto px-3 py-3">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Hero - Current Discount */}
            <div className="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-6 h-6" />
                  <h1 className="text-2xl font-bold">Пригласи соседей</h1>
                </div>

                <div className="mb-5">
                  <div className="text-sm text-white/80 mb-2">Ваша текущая цена</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-5xl font-bold">{currentPrice.toFixed(0)}₽</div>
                    <div className="text-xl text-white/60 line-through mb-2">{basePrice}₽</div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <TrendingDown className="w-4 h-4" />
                    <span className="font-semibold">-{currentDiscount}% скидка</span>
                    <span className="text-white/80">• {currentNeighbors} соседей</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/80">До максимальной скидки</span>
                    <span className="text-sm font-semibold">{Math.max(0, 10 - currentNeighbors)} соседей</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-300 transition-all duration-500"
                      style={{ width: `${progressToMax}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-white/70">
                    {currentNeighbors} из 10 соседей • {maxDiscount - currentDiscount}% осталось
                  </div>
                </div>
              </div>
            </div>

            {/* Economics Calculator */}
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Экономия при приглашении</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-white/80 mb-1">Сейчас платите</div>
                    <div className="text-2xl font-bold">{currentPrice.toFixed(0)}₽</div>
                    <div className="text-xs text-white/70">за вывоз</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-white/80 mb-1">+1 сосед = цена</div>
                    <div className="text-2xl font-bold">{nextPrice.toFixed(0)}₽</div>
                    <div className="text-xs text-white/70">-{(currentPrice - nextPrice).toFixed(0)}₽ экономия</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold mb-1">При 10 соседях</div>
                      <div className="text-3xl font-bold">{maxPrice.toFixed(0)}₽</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/80 mb-1">Экономия</div>
                      <div className="text-2xl font-bold text-green-200">-{(basePrice - maxPrice).toFixed(0)}₽</div>
                      <div className="text-xs text-white/70">каждый раз</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/80">
                    💰 В месяц (2 раза в неделю): -{((basePrice - maxPrice) * 8).toFixed(0)}₽ экономия
                  </div>
                </div>
              </div>
            </div>

            {/* Neighbors List */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Приглашённые соседи</div>
                  <div className="text-xs text-gray-500">{currentNeighbors} участников</div>
                </div>
              </div>

              {referralInfo && referralInfo.referrals.length > 0 ? (
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Ваши соседи</div>
                  {referralInfo.referrals.map((neighbor, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {neighbor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{neighbor.name}</div>
                          <div className="text-xs text-gray-500">{formatJoinedAt(neighbor.joinedAt)}</div>
                        </div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4 mb-4">
                  Пока никого нет. Пригласите первого соседа!
                </div>
              )}

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-xs text-purple-700">
                  🎯 <strong>Цель:</strong> Ещё {Math.max(0, 10 - currentNeighbors)} соседей до максимальной скидки 20%
                </div>
              </div>
            </div>

            {/* Referral Link */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Реферальная ссылка</h2>
              <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Ваша ссылка</div>
                <div className="text-sm font-mono text-gray-900 break-all">{referralLink || '...'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={copyLink} variant="outline" className="w-full" disabled={!referralLink}>
                  {copied ? (
                    <><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Скопировано!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" />Копировать</>
                  )}
                </Button>
                <Button onClick={shareLink} className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={!referralLink}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Поделиться
                </Button>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Как это работает?</h2>
              <div className="space-y-4">
                {[
                  { n: 1, title: 'Пригласите соседей', desc: 'Отправьте ссылку соседям из вашего подъезда' },
                  { n: 2, title: 'Они регистрируются', desc: 'Сосед создает заказ через вашу ссылку' },
                  { n: 3, title: 'Скидка растет для всех!', desc: 'Каждый сосед = +2% скидки (максимум 20%)' },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600 font-bold text-sm">{n}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
                      <div className="text-xs text-gray-600">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-purple-900">
                    <strong>Бонус:</strong> Первый приглашённый сосед дает вам дополнительно -5₽ на следующий заказ!
                  </div>
                </div>
              </div>
            </div>

            {/* Discount Table */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Таблица скидок</h2>
              <div className="space-y-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => {
                  const discount = calculateDiscount(count);
                  const price = calculatePrice(count);
                  const isCurrent = count === currentNeighbors;
                  return (
                    <div
                      key={count}
                      className={`flex items-center justify-between p-2.5 rounded-lg ${isCurrent ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isCurrent ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                          {count}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${isCurrent ? 'text-purple-900' : 'text-gray-900'}`}>
                            {count} {count === 1 ? 'сосед' : count < 5 ? 'соседа' : 'соседей'}
                          </div>
                          {isCurrent && <div className="text-xs text-purple-600 font-medium">Ваш уровень</div>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-base font-bold ${isCurrent ? 'text-purple-900' : 'text-gray-900'}`}>{price.toFixed(0)}₽</div>
                        <div className={`text-xs ${isCurrent ? 'text-purple-600' : 'text-gray-500'}`}>-{discount}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="text-lg font-bold mb-2">Расскажите соседям!</div>
                <div className="text-sm text-white/90 mb-4">
                  Чем больше вас — тем дешевле каждому. Создайте чат подъезда или расклейте объявления.
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => toast.info('WhatsApp', { description: 'Интеграция с мессенджерами в разработке' })}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={() => toast.info('Звонок', { description: 'Функция звонков в разработке' })}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  >
                    <Phone className="w-4 h-4 mr-1.5" />
                    Позвонить
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
