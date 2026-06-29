import { useTheme } from '../context/ThemeContext';
import { ROLE_COLORS } from '../../stores/role.store';

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

const XP_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5800, 8000];

export function getRankLabel(level: number): string {
  if (level >= 80) return '🏆 Легенда';
  if (level >= 60) return '👑 Мастер';
  if (level >= 40) return '⭐ Эксперт';
  if (level >= 20) return '🛡️ Профи';
  if (level >= 10) return '⚡ Опытный';
  return '🌱 Новичок';
}

export function LevelSystem({ data, variant = 'customer', compact = false }: LevelSystemProps) {
  const { isDark } = useTheme();
  const { level, xp, nextLevelXp, title, achievements, totalOrders } = data;

  const accent = ROLE_COLORS[variant];
  const trackBg = isDark ? '#374151' : '#e5e7eb';
  const surfaceBg = isDark ? '#1e2433' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const subtleBg = isDark ? '#1f2937' : '#f3f4f6';

  const prevLevelXp = XP_THRESHOLDS[Math.max(0, level - 1)] ?? 0;
  const levelRange = nextLevelXp - prevLevelXp;
  const progress = levelRange > 0 ? Math.min(100, ((xp - prevLevelXp) / levelRange) * 100) : 100;

  const getRankTitle = () => getRankLabel(level);

  const ProgressBar = ({ height }: { height: number }) => (
    <div style={{ height, width: '100%', borderRadius: '9999px', overflow: 'hidden', background: trackBg }}>
      <div
        style={{
          height: '100%',
          width: `${Math.max(progress, 0)}%`,
          borderRadius: '9999px',
          background: accent,
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center border-2 relative flex-shrink-0"
          style={{ background: `${accent}18`, borderColor: `${accent}40` }}
        >
          <span className="text-base font-bold" style={{ color: accent }}>{level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium" style={{ color: textColor }}>{getRankTitle()}</span>
            <span className="text-xs" style={{ color: mutedColor }}>Lvl {level}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ProgressBar height={6} />
            </div>
            <span className="text-xs whitespace-nowrap" style={{ color: mutedColor }}>{xp}/{nextLevelXp}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: surfaceBg, border: `1px solid ${borderColor}` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 relative"
            style={{ background: `${accent}18`, borderColor: `${accent}40` }}
          >
            <span className="text-xl font-bold" style={{ color: accent }}>{level}</span>
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: textColor }}>{getRankTitle()}</h2>
            <div className="text-xs" style={{ color: mutedColor }}>{title}</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: mutedColor }}>
          <span>Опыт</span>
          <span>{xp} / {nextLevelXp} XP</span>
        </div>
        <ProgressBar height={8} />
        <div className="text-xs mt-1 text-right" style={{ color: mutedColor }}>{Math.max(0, nextLevelXp - xp)} XP до следующего уровня</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { value: totalOrders, label: 'заказов' },
          { value: achievements, label: 'достижений' },
          { value: Math.floor(level / 10), label: 'наград' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-3 text-center" style={{ background: subtleBg }}>
            <div className="text-xl font-semibold" style={{ color: textColor }}>{s.value}</div>
            <div className="text-xs" style={{ color: mutedColor }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
