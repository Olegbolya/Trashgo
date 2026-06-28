import { api } from './client';

export interface AccessPlanStatus {
  status: 'trial' | 'active' | 'expired';
  expiresAt: string | null;
  trialEndsAt: string;
  activeReferrals: number;
  discountAmount: number;
  nextPrice: number;
  hasPendingRequest: boolean;
  yookassaEnabled?: boolean;
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

  requestPlan: async (paymentRef?: string, promoCode?: string): Promise<{ id: string; priceAtPurchase: number; discountApplied?: number; promoCode?: string | null; status: string; paymentUrl?: string }> => {
    const res = await api.post<{ data: { id: string; priceAtPurchase: number; discountApplied?: number; promoCode?: string | null; status: string; paymentUrl?: string } }>(
      '/access-plans/request',
      { paymentRef: paymentRef || null, promoCode: promoCode || null },
    );
    return res.data;
  },

  verifyPayment: async (planId: string): Promise<{ activated: boolean }> => {
    const res = await api.post<{ data: { activated: boolean } }>('/access-plans/verify-payment', { planId });
    return res.data;
  },

  checkPromo: async (code: string): Promise<{ code: string; discountAmount: number }> => {
    const res = await api.get<{ data: { code: string; discountAmount: number } }>(`/access-plans/promo-check/${encodeURIComponent(code)}`);
    return res.data;
  },
};
