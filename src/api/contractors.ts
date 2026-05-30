import { api } from './client';
import type { ApiResponse } from '../types/api';

export interface Contractor {
  id: string;
  name: string;
  district: string;
  transportMode: string;
  level: number;
  xp: number;
  isVerified: boolean;
  completedOrders: number;
  avgRating: number | null;
  ratingCount: number;
}

export interface ContractorReview {
  orderId: string;
  rating: number;
  review: string;
  createdAt: string;
  customerName: string;
}

export const contractorsApi = {
  list(district?: string) {
    const qs = district ? `?district=${encodeURIComponent(district)}` : '';
    return api.get<ApiResponse<Contractor[]>>(`/users/contractors${qs}`);
  },
  getReviews(contractorId: string) {
    return api.get<ApiResponse<ContractorReview[]>>(`/users/contractors/${contractorId}/reviews`);
  },
};
