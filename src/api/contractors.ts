import { api } from './client';
import type { ApiResponse } from '../types/api';

export interface Contractor {
  id: string;
  name: string;
  district: string;
  transportMode: string;
  level: number;
  xp: number;
  completedOrders: number;
  avgRating: number | null;
  ratingCount: number;
}

export const contractorsApi = {
  list(district?: string) {
    const qs = district ? `?district=${encodeURIComponent(district)}` : '';
    return api.get<ApiResponse<Contractor[]>>(`/users/contractors${qs}`);
  },
};
