import { useState } from 'react';
import { Trophy, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  previewCount?: number;
}

function AchievementCard({ achievement, accent, text, muted, subtle, isDark, cardBorder }: {
  achievement: Achievement;
  accent: string; text: string; muted: string; subtle: string; isDark: boolean; cardBorder: string;
}) {
  return (
    <div
      style={{
        borderRadius: '0.75rem',
        padding: '0.875rem',
        border: `1px solid ${achievement.unlocked ? accent + '50' : cardBorder}`,
        background: achievement.unlocked ? `${accent}08` : subtle,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{achievement.icon}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.125rem', color: achievement.unlocked ? text : muted }}>
        {achievement.title}
      </div>
      <div style={{ fontSize: '0.7rem', color: muted, marginBottom: '0.5rem', lineHeight: 1.4 }}>
        {achievement.description}
      </div>

      {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
        <div style={{ marginTop: '0.375rem' }}>
          <div style={{ height: '0.375rem', borderRadius: '9999px', overflow: 'hidden', background: isDark ? '#374151' : '#e5e7eb' }}>
            <div
              style={{
                height: '100%',
                borderRadius: '9999px',
                background: achievement.unlocked ? accent : muted,
                width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: muted }}>
            {achievement.progress}/{achievement.maxProgress}
          </div>
        </div>
      )}

      {achievement.reward && achievement.unlocked && (
        <div style={{ marginTop: '0.5rem', borderRadius: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${accent}30`, background: `${accent}12`, color: accent }}>
          {achievement.reward}
        </div>
      )}
    </div>
  );
}

export function AchievementsPanel({ achievements, variant = 'customer', previewCount = 4 }: AchievementsPanelProps) {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const accent = variant === 'contractor' ? '#4CAF50' : '#2196F3';
  const surface = isDark ? '#1e2433' : '#ffffff';
  const border = isDark ? '#374151' : '#e5e7eb';
  const subtle = isDark ? '#1f2937' : '#f3f4f6';
  const text = isDark ? '#f9fafb' : '#111827';
  const muted = isDark ? '#9ca3af' : '#6b7280';
  const cardBorder = isDark ? '#374151' : '#d1d5db';

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const preview = achievements.slice(0, previewCount);
  const rest = achievements.slice(previewCount);
  const hasMore = rest.length > 0;

  const cardProps = { accent, text, muted, subtle, isDark, cardBorder };

  return (
    <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '1rem', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy style={{ width: '1rem', height: '1rem', color: muted }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: text }}>Достижения</span>
        </div>
        <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', border: `1px solid ${border}`, fontSize: '0.75rem', fontWeight: 600, background: `${accent}12`, color: accent }}>
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      {/* Preview grid (always visible) */}
      <div style={{ padding: '1rem 1rem 0', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
        {preview.map(a => <AchievementCard key={a.id} achievement={a} {...cardProps} />)}
      </div>

      {/* Expandable rest */}
      {hasMore && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.625rem',
            padding: expanded ? '0.625rem 1rem 0' : '0 1rem',
            maxHeight: expanded ? `${Math.ceil(rest.length / 2) * 200}px` : '0',
            overflow: 'hidden',
            transition: 'max-height 0.4s ease, padding 0.3s ease',
          }}
        >
          {rest.map(a => <AchievementCard key={a.id} achievement={a} {...cardProps} />)}
        </div>
      )}

      {/* Toggle button */}
      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            width: '100%', padding: '0.75rem 1rem',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600, color: accent,
            fontFamily: 'inherit',
            borderTop: `1px solid ${border}`,
            marginTop: '1rem',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = `${accent}08`)}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          {expanded ? 'Скрыть' : `Показать ещё ${rest.length}`}
          <ChevronDown
            style={{
              width: '0.875rem', height: '0.875rem',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          />
        </button>
      )}

      {/* Bottom padding when no button or expanded */}
      {!hasMore && <div style={{ height: '1rem' }} />}
    </div>
  );
}
