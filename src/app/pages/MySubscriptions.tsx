import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, RefreshCw, Calendar, Pause, Play, Plus, Trash2, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTheme } from '../context/ThemeContext';
import { subscriptionsApi, type Subscription } from '../../api/subscriptions';
import { toast } from 'sonner';

const DAY_LABELS: Record<number, string> = { 1: 'ПН', 2: 'ВТ', 3: 'СР', 4: 'ЧТ', 5: 'ПТ', 6: 'СБ', 7: 'ВС' };

export default function MySubscriptions() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Мои подписки — TrashGo';
    return () => { document.title = 'TrashGo — Вывоз мусора в Казани'; };
  }, []);

  useEffect(() => {
    subscriptionsApi.list()
      .then(res => setSubs(res.data))
      .catch(() => toast.error('Не удалось загрузить подписки'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (sub: Subscription) => {
    setToggling(sub.id);
    const prev = subs;
    setSubs(s => s.map(x => x.id === sub.id ? { ...x, active: !x.active } : x));
    try {
      await subscriptionsApi.update(sub.id, { active: !sub.active });
    } catch {
      setSubs(prev);
      toast.error('Не удалось обновить подписку');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить подписку?')) return;
    setDeleting(id);
    const prev = subs;
    setSubs(s => s.filter(x => x.id !== id));
    try {
      await subscriptionsApi.remove(id);
      toast.success('Подписка удалена');
    } catch {
      setSubs(prev);
      toast.error('Не удалось удалить подписку');
    } finally {
      setDeleting(null);
    }
  };

  const active = subs.filter(s => s.active);
  const paused = subs.filter(s => !s.active);

  const bg = isDark ? 'bg-gray-950' : 'bg-gray-50';
  const card = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const cardActive = isDark ? 'bg-gray-900 border-green-700' : 'bg-green-50 border-green-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const subtext = isDark ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className={`min-h-screen ${bg}`}>
      <header className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-50`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate(-1)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <ArrowLeft className={`w-6 h-6 ${text}`} />
            </button>
            <h1 className={`font-semibold ${text}`}>Мои подписки</h1>
            <button
              onClick={() => navigate('/create-subscription')}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <Plus className={`w-6 h-6 ${text}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : subs.length === 0 ? (
          <div className={`${card} border-2 border-dashed rounded-2xl p-12 text-center`}>
            <RefreshCw className={`w-16 h-16 ${muted} mx-auto mb-4`} />
            <div className={`text-lg font-medium ${text} mb-2`}>Нет подписок</div>
            <div className={`text-sm ${muted} mb-6`}>
              Настройте регулярный вывоз мусора по расписанию
            </div>
            <Button
              onClick={() => navigate('/create-subscription')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Создать расписание
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <section>
                <h2 className={`text-lg font-semibold ${text} mb-3`}>Активные</h2>
                <div className="space-y-3">
                  {active.map(sub => (
                    <SubCard
                      key={sub.id}
                      sub={sub}
                      isDark={isDark}
                      cardClass={cardActive}
                      text={text}
                      muted={muted}
                      subtext={subtext}
                      toggling={toggling === sub.id}
                      deleting={deleting === sub.id}
                      onToggle={() => handleToggle(sub)}
                      onDelete={() => handleDelete(sub.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {paused.length > 0 && (
              <section>
                <h2 className={`text-lg font-semibold ${text} mb-3`}>На паузе</h2>
                <div className="space-y-3">
                  {paused.map(sub => (
                    <SubCard
                      key={sub.id}
                      sub={sub}
                      isDark={isDark}
                      cardClass={card}
                      text={text}
                      muted={muted}
                      subtext={subtext}
                      toggling={toggling === sub.id}
                      deleting={deleting === sub.id}
                      onToggle={() => handleToggle(sub)}
                      onDelete={() => handleDelete(sub.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface SubCardProps {
  sub: Subscription;
  isDark: boolean;
  cardClass: string;
  text: string;
  muted: string;
  subtext: string;
  toggling: boolean;
  deleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function SubCard({ sub, isDark, cardClass, text, muted, subtext, toggling, deleting, onToggle, onDelete }: SubCardProps) {
  const tagBg = isDark ? 'bg-gray-700 text-gray-200' : 'bg-green-100 text-green-800';
  const infoBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`${cardClass} border-2 rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className={`w-4 h-4 ${muted}`} />
            <span className={`font-medium ${text}`}>{sub.address}</span>
          </div>
          {sub.district && (
            <div className={`text-xs ${muted} ml-6`}>{sub.district}</div>
          )}
        </div>
        <div className="text-right ml-4">
          <div className={`text-xl font-semibold ${sub.active ? 'text-green-600' : muted}`}>{sub.price}₽</div>
          <div className={`text-xs ${muted}`}>за вывоз</div>
        </div>
      </div>

      <div className={`${infoBg} border rounded-xl p-3 mb-3`}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className={`text-xs ${muted} mb-1`}>Дни</div>
            <div className="flex flex-wrap gap-1">
              {sub.days.map(d => (
                <span key={d} className={`px-1.5 py-0.5 rounded text-xs font-medium ${tagBg}`}>
                  {DAY_LABELS[d] ?? d}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className={`text-xs ${muted} mb-1`}>Время</div>
            <div className={`flex items-center gap-1 ${subtext}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{sub.time}</span>
            </div>
          </div>
          {(sub as any).interval && (sub as any).interval !== 'weekly' && (
            <div>
              <div className={`text-xs ${muted} mb-1`}>Периодичность</div>
              <div className={`text-xs font-medium ${subtext}`}>
                {(sub as any).interval === 'biweekly' ? 'Раз в 2 нед.' : 'Ежемесячно'}
              </div>
            </div>
          )}
        </div>
      </div>

      {sub.contractorName && (
        <div className={`flex items-center gap-1.5 text-xs mb-2 px-2 py-1 rounded-lg w-fit ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
          <User className="w-3 h-3" />
          <span>Исполнитель: {sub.contractorName}</span>
        </div>
      )}

      {sub.description ? (
        <div className={`text-xs ${muted} mb-3`}>{sub.description}</div>
      ) : null}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className={`flex-1 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : ''}`}
          onClick={onToggle}
          disabled={toggling}
        >
          {sub.active
            ? <><Pause className="w-4 h-4 mr-1.5" />Пауза</>
            : <><Play className="w-4 h-4 mr-1.5" />Возобновить</>
          }
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`${isDark ? 'bg-gray-800 border-gray-700 text-red-400 hover:bg-gray-700' : 'text-red-500 hover:text-red-600'}`}
          onClick={onDelete}
          disabled={deleting}
        >
          <Trash2 className="w-4 h-4 mr-1" />{deleting ? 'Удаляем...' : 'Удалить'}
        </Button>
      </div>
    </div>
  );
}
