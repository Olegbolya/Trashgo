import { api } from './client';

export interface ReferralInfo {
  code: string;
  link: string;
  count: number;
  discount?: number;
  referrals: { name: string; role?: string; joinedAt: string; isActive: boolean }[];
}

export const referralsApi = {
  async getMyReferral(): Promise<ReferralInfo> {
    const res = await api.get<{ data: ReferralInfo }>('/referrals/my?target=customer');
    return res.data;
  },
  async getMyContractorReferral(): Promise<ReferralInfo> {
    const res = await api.get<{ data: ReferralInfo }>('/referrals/my?target=contractor');
    return res.data;
  },
};
