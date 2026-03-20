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
  const { level, xp, nextLevelXp, title, achievements, totalOrders } = data;
  const progress = (xp / nextLevelXp) * 100;

  const accentClass = variant === 'contractor' ? 'text-green-600' : 'text-gray-900';
  const bgClass = variant === 'contractor' ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200';

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
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 ${bgClass} relative flex-shrink-0`}>
          <span className={`text-base font-bold ${accentClass}`}>{level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{getRankTitle()}</span>
            <span className="text-xs text-gray-400">Lvl {level}</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs text-gray-400 whitespace-nowrap">{xp}/{nextLevelXp}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${bgClass} relative`}>
            <span className={`text-xl font-bold ${accentClass}`}>{level}</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{getRankTitle()}</h2>
            <div className="text-xs text-gray-500">{title}</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Опыт</span>
          <span>{xp} / {nextLevelXp} XP</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-xs text-gray-400 mt-1 text-right">{nextLevelXp - xp} XP до следующего уровня</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-xl font-semibold text-gray-900">{totalOrders}</div>
          <div className="text-xs text-gray-500">заказов</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-xl font-semibold text-gray-900">{achievements}</div>
          <div className="text-xs text-gray-500">достижений</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-xl font-semibold text-gray-900">{Math.floor(level / 10)}</div>
          <div className="text-xs text-gray-500">наград</div>
        </div>
      </div>
    </div>
  );
}
