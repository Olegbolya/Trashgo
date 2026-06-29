import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy, Star, Award, TrendingUp, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { leaderboardApi, type LeaderboardEntry } from '../../api/leaderboard';
import { toast } from 'sonner';
import PrivacyFooter from '../components/PrivacyFooter';

const DISTRICTS = ['', 'Вахитовский', 'Авиастроительный', 'Московский', 'Кировский', 'Советский', 'Ново-Савиновский', 'Приволжский'];

const RANK_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
const RANK_ICONS = ['🥇', '🥈', '🥉'];

const LEVEL_NAMES: Record<number, string> = {
  1: 'Новичок', 2: 'Стажёр', 3: 'Мастер', 4: 'Эксперт', 5: 'Профи', 6: 'Легенда',
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    document.title = 'Рейтинг исполнителей — TrashGo';
    return () => { document.title = 'TrashGo — Вывоз мусора в Казани'; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = (showLoader = false) => {
      if (showLoader) setLoading(true);
      leaderboardApi.get(district || undefined, 30)
        .then(res => { if (!cancelled) setEntries(res.data); })
        .catch(() => { if (showLoader) toast.error('Не удалось загрузить рейтинг'); })
        .finally(() => { if (showLoader) setLoading(false); });
    };
    load(true);
    const id = setInterval(() => load(false), 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [district]);

  const bg = isDark ? 'bg-gray-950' : 'bg-gray-50';
  const card = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const subtext = isDark ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bg}`}>
      <header className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-50`} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate(-1)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <ArrowLeft className={`w-6 h-6 ${text}`} />
            </button>
            <h1 className={`font-semibold ${text}`}>Рейтинг исполнителей</h1>
            <button
              onClick={() => setShowFilter(v => !v)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <Filter className={`w-5 h-5 ${district ? 'text-green-500' : text}`} />
            </button>
          </div>
        </div>
      </header>

      {showFilter && (
        <div className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b px-4 py-3`}>
          <div className="container mx-auto max-w-xl">
            <p className={`text-xs ${muted} mb-2`}>Район</p>
            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map(d => (
                <button
                  key={d || 'all'}
                  onClick={() => { setDistrict(d); setShowFilter(false); }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    district === d
                      ? 'bg-green-600 text-white'
                      : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {d || 'Все районы'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && entries.length >= 3 && (
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-6 px-4">
          <div className="container mx-auto max-w-xl">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              <PodiumCard entry={entries[1]} position={2} />
              {/* 1st */}
              <PodiumCard entry={entries[0]} position={1} featured />
              {/* 3rd */}
              <PodiumCard entry={entries[2]} position={3} />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4 pb-24 max-w-xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className={`${card} border rounded-2xl p-12 text-center`}>
            <Trophy className={`w-16 h-16 ${muted} mx-auto mb-4`} />
            <div className={`text-lg font-medium ${text} mb-2`}>Рейтинг пуст</div>
            <div className={`text-sm ${muted}`}>Пока нет завершённых заказов в этом районе</div>
          </div>
        ) : (
          <div className={`${card} border rounded-2xl overflow-hidden`}>
            {entries.slice(entries.length >= 3 ? 3 : 0).map((entry, idx) => {
              const rank = entries.length >= 3 ? idx + 4 : idx + 1;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    idx !== 0 ? (isDark ? 'border-t border-gray-800' : 'border-t border-gray-100') : ''
                  }`}
                >
                  <span className={`w-8 text-center font-bold text-sm ${rank <= 3 ? RANK_COLORS[rank - 1] : muted}`}>
                    {rank <= 3 ? RANK_ICONS[rank - 1] : rank}
                  </span>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${text} truncate`}>{entry.name}</div>
                    <div className={`text-xs ${muted}`}>{entry.district || 'Казань'} · {LEVEL_NAMES[entry.level] ?? `Уровень ${entry.level}`}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-semibold ${text}`}>{entry.ordersCompleted}</div>
                    <div className={`text-xs ${muted}`}>заказов</div>
                  </div>
                  {entry.avgRating !== null && (
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-sm font-semibold">{entry.avgRating}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className={`${card} border rounded-2xl p-4 mt-4`}>
          <div className={`text-sm font-medium ${text} mb-2 flex items-center gap-2`}>
            <Award className="w-4 h-4 text-green-500" />
            Как попасть в топ
          </div>
          <ul className={`text-xs ${subtext} space-y-1`}>
            <li>• Выполняйте больше заказов</li>
            <li>• Получайте высокие оценки от клиентов</li>
            <li>• Набирайте XP и повышайте уровень</li>
            <li>• Рейтинг обновляется в реальном времени</li>
          </ul>
        </div>
      </div>
      <PrivacyFooter />
    </div>
  );
}

function PodiumCard({ entry, position, featured }: { entry: LeaderboardEntry; position: number; featured?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${featured ? 'mb-0' : '-mb-4'}`}>
      <span className="text-2xl">{RANK_ICONS[position - 1]}</span>
      <div className={`${featured ? 'w-14 h-14 text-lg' : 'w-11 h-11 text-base'} rounded-full bg-white/20 flex items-center justify-center font-bold text-white`}>
        {entry.name.charAt(0).toUpperCase()}
      </div>
      <div className={`text-center ${featured ? '' : 'scale-90 origin-bottom'}`}>
        <div className="text-white text-sm font-semibold leading-tight max-w-[80px] truncate">{entry.name.split(' ')[0]}</div>
        <div className="text-green-100 text-xs">{entry.ordersCompleted} заказов</div>
      </div>
      <div className={`${featured ? 'h-16' : 'h-10'} w-16 ${featured ? 'bg-white/30' : 'bg-white/20'} rounded-t-xl flex items-end justify-center pb-1`}>
        <span className="text-white font-bold text-lg">{position}</span>
      </div>
    </div>
  );
}
