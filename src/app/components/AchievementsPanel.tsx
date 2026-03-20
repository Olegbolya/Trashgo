import { Trophy } from 'lucide-react';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  reward?: string;
}

interface AchievementsPanelProps {
  achievements: Achievement[];
  variant?: 'customer' | 'contractor';
}

export function AchievementsPanel({ achievements, variant = 'customer' }: AchievementsPanelProps) {
  const colors = {
    customer: {
      unlocked: 'from-red-500 to-pink-600',
      locked: 'from-gray-300 to-gray-400',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    contractor: {
      unlocked: 'from-emerald-500 to-teal-600',
      locked: 'from-gray-300 to-gray-400',
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
  };

  const style = colors[variant];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`${style.bg} border-b-2 border-gray-200 px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className={`w-5 h-5 ${style.text}`} />
            <h2 className="font-semibold text-gray-900">Достижения</h2>
          </div>
          <div className={`px-3 py-1 rounded-full ${style.bg} ${style.border} border`}>
            <span className={`text-sm font-bold ${style.text}`}>
              {unlockedCount}/{achievements.length}
            </span>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="p-5 grid grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-xl p-4 border-2 transition-all ${
              achievement.unlocked
                ? `bg-gradient-to-br ${style.unlocked} border-transparent text-white shadow-lg`
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            <div className="text-3xl mb-2">{achievement.icon}</div>
            <h3 className={`text-sm font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-700'}`}>
              {achievement.title}
            </h3>
            <p className={`text-xs mb-2 ${achievement.unlocked ? 'text-white/80' : 'text-gray-500'}`}>
              {achievement.description}
            </p>

            {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
              <div className="mt-2">
                <div className={`h-1.5 rounded-full overflow-hidden ${achievement.unlocked ? 'bg-white/20' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${achievement.unlocked ? 'bg-white' : 'bg-gray-400'}`}
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
                <div className={`text-xs mt-1 ${achievement.unlocked ? 'text-white/70' : 'text-gray-500'}`}>
                  {achievement.progress}/{achievement.maxProgress}
                </div>
              </div>
            )}

            {achievement.reward && achievement.unlocked && (
              <div className="mt-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-white">
                🎁 {achievement.reward}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
