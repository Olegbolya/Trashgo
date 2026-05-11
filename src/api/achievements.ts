import { api } from './client';

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  chain?: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress?: number;
  maxProgress?: number;
}

export const achievementsApi = {
  async getMy(): Promise<AchievementItem[]> {
    const res = await api.get<{ data: AchievementItem[] }>('/achievements/my');
    return res.data;
  },
};
