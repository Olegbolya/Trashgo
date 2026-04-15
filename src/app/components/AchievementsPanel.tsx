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
  const accentBg = variant === 'contractor' ? 'bg-green-50' : 'bg-gray-50';
  const accentBorder = variant === 'contractor' ? 'border-green-200' : 'border-gray-200';
  const accentText = variant === 'contractor' ? 'text-green-700' : 'text-gray-700';
  const badgeBg = variant === 'contractor' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-700';

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Достижения</h2>
        </div>
        <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${badgeBg}`}>
          {unlockedCount}/{achievements.length}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="p-4 grid grid-cols-2 gap-2.5">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-xl p-3.5 border transition-all ${
              achievement.unlocked
                ? `bg-white ${accentBorder}`
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-2xl mb-2">{achievement.icon}</div>
            <h3 className={`text-xs font-semibold mb-0.5 ${achievement.unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
              {achievement.title}
            </h3>
            <p className="text-xs text-gray-400 mb-2 leading-tight">
              {achievement.description}
            </p>

            {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
              <div className="mt-1.5">
                <div className="h-1.5 rounded-full overflow-hidden bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${achievement.unlocked ? (variant === 'contractor' ? 'bg-green-500' : 'bg-gray-900') : 'bg-gray-400'}`}
                    style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs mt-1 text-gray-400">
                  {achievement.progress}/{achievement.maxProgress}
                </div>
              </div>
            )}

            {achievement.reward && achievement.unlocked && (
              <div className={`mt-2 rounded-lg px-2 py-1 text-xs font-medium border ${accentBg} ${accentBorder} ${accentText}`}>
                {achievement.reward}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
