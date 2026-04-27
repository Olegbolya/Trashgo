import { api } from './client';

export interface ReferralInfo {
  code: string;
  link: string;
  count: number;
  referrals: { name: string; joinedAt: string }[];
}

export const referralsApi = {
  async getMyReferral(): Promise<ReferralInfo> {
    const res = await api.get<{ data: ReferralInfo }>('/referrals/my');
    return res.data;
  },
};
