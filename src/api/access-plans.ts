import { api } from './client';

export interface AccessPlanStatus {
  status: 'trial' | 'active' | 'expired';
  expiresAt: string | null;
  trialEndsAt: string;
  activeReferrals: number;
  discountAmount: number;
  nextPrice: number;
  hasPendingRequest: boolean;
}

export interface AccessPlanRecord {
  id: string;
  status: string;
  priceAtPurchase: number;
  paymentRef: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

export const accessPlansApi = {
  getStatus: async (): Promise<AccessPlanStatus> => {
    const res = await api.get<{ data: AccessPlanStatus }>('/access-plans/status');
    return res.data;
  },

  getHistory: async (): Promise<AccessPlanRecord[]> => {
    const res = await api.get<{ data: AccessPlanRecord[] }>('/access-plans/history');
    return res.data;
  },

  requestPlan: async (paymentRef?: string): Promise<{ id: string; priceAtPurchase: number; status: string }> => {
    const res = await api.post<{ data: { id: string; priceAtPurchase: number; status: string } }>(
      '/access-plans/request',
      { paymentRef: paymentRef || null },
    );
    return res.data;
  },
};
