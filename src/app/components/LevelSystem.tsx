import { Award, Star, Trophy, Zap, Target, Crown, Shield, Sparkles } from 'lucide-react';
import { Progress } from './ui/progress';

export interface LevelData {
  level: number;
  xp: number;
  nextLevelXp: number;
  title: string;
  rank: string;
  achievements: number;
  totalOrders: number;
}

interface LevelSystemProps {
  data: LevelData;
  variant?: 'customer' | 'contractor';
  compact?: boolean;
}

export function LevelSystem({ data, variant = 'customer', compact = false }: LevelSystemProps) {
  const { level, xp, nextLevelXp, title, rank, achievements, totalOrders } = data;
  const progress = (xp / nextLevelXp) * 100;

  // Цвета для разных вариантов
  const colors = {
    customer: {
      gradient: 'from-red-500 via-rose-500 to-pink-600',
      accent: 'red',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      progressBg: 'bg-red-100',
      progressBar: 'bg-gradient-to-r from-red-500 to-pink-500',
    },
    contractor: {
      gradient: 'from-emerald-500 via-green-500 to-teal-600',
      accent: 'green',
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      progressBg: 'bg-green-100',
      progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    },
  };

  const style = colors[variant];

  // Иконка ранга в зависимости от уровня
  const getRankIcon = () => {
    if (level >= 60) return <Crown className="w-6 h-6" />;
    if (level >= 40) return <Trophy className="w-6 h-6" />;
    if (level >= 20) return <Shield className="w-6 h-6" />;
    return <Star className="w-6 h-6" />;
  };

  // Название ранга
  const getRankTitle = () => {
    if (level >= 80) return '🏆 Легенда';
    if (level >= 60) return '👑 Мастер';
    if (level >= 40) return '⭐ Эксперт';
    if (level >= 20) return '🛡️ Профи';
    if (level >= 10) return '⚡ Опытный';
    return '🌱 Новичок';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 bg-gradient-to-br ${style.gradient} rounded-xl flex items-center justify-center text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10"></div>
          <span className="relative text-lg font-bold">{level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">{getRankTitle()}</span>
            <span className="text-xs text-gray-500">Lvl {level}</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs text-gray-500 whitespace-nowrap">{xp}/{nextLevelXp}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${style.gradient} rounded-2xl p-6 text-white relative overflow-hidden`}>
      {/* Декоративные круги */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -ml-12 -mt-12"></div>

      <div className="relative">
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 relative">
              {getRankIcon()}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 border-2 border-white">
                {level}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{getRankTitle()}</h2>
              <div className="text-sm text-white/80">{title}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/70 mb-1">Уровень</div>
            <div className="text-3xl font-bold">{level}</div>
          </div>
        </div>

        {/* Прогресс бар */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Опыт</span>
            </div>
            <span className="text-sm text-white/90">
              {xp} / {nextLevelXp} XP
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-white/70 mt-1 text-right">
            {nextLevelXp - xp} XP до следующего уровня
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-2xl font-bold">{totalOrders}</span>
            </div>
            <div className="text-xs text-white/80">заказов</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-2xl font-bold">{achievements}</span>
            </div>
            <div className="text-xs text-white/80">достижений</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-2xl font-bold">{Math.floor(level / 10)}</span>
            </div>
            <div className="text-xs text-white/80">наград</div>
          </div>
        </div>

        {/* Следующее достижение */}
        {level < 80 && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Следующая награда</span>
            </div>
            <div className="text-xs text-white/90">
              {getNextReward(level)}
            </div>
          </div>
        )}

        {level >= 80 && (
          <div className="mt-4 bg-yellow-400/20 backdrop-blur-sm rounded-lg p-3 border-2 border-yellow-400/40">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-bold text-yellow-100">Максимальный уровень достигнут! 🎉</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Функция для получения следующей награды
function getNextReward(level: number): string {
  const rewards = {
    5: 'Значок "Первые шаги" 🌱',
    10: 'Скидка -5% на все заказы 💰',
    15: 'Значок "Активист" ⚡',
    20: 'Ранг "Профи" + скидка -10% 🛡️',
    25: 'Приоритетная поддержка 🎯',
    30: 'Значок "Марафонец" 🏃',
    40: 'Ранг "Эксперт" + скидка -15% ⭐',
    50: 'Эксклюзивная аватарка 🎨',
    60: 'Ранг "Мастер" + скидка -20% 👑',
    70: 'VIP статус 💎',
    80: 'Ранг "Легенда" + максимальная скидка 🏆',
  };

  const nextMilestone = Object.keys(rewards)
    .map(Number)
    .find((milestone) => milestone > level);

  return nextMilestone
    ? `Уровень ${nextMilestone}: ${rewards[nextMilestone as keyof typeof rewards]}`
    : 'Все награды получены! 🎉';
}