import { api } from './client';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  district: string;
  level: number;
  xp: number;
  ordersCompleted: number;
  avgRating: number | null;
}

export const leaderboardApi = {
  get(district?: string, limit = 20) {
    const params = new URLSearchParams();
    if (district) params.set('district', district);
    params.set('limit', String(limit));
    return api.get<{ data: LeaderboardEntry[] }>(`/leaderboard?${params}`);
  },
};
