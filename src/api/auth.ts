import { api } from './client';
import type { User, UserRole } from '../types/user';

interface VkidResponse {
  isNewUser: boolean;
  phone?: string;
  name?: string;
  tempToken?: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

interface LoginResponse {
  otpSent: boolean;
  isNewUser: boolean;
  needsPhone?: boolean;
  devCode?: string;
  channel?: 'telegram' | 'sms' | 'dev' | 'email';
  telegramBotLink?: string;
  deliveryEmail?: string;
}

interface VerifyFirebaseResponse {
  isNewUser?: boolean;
  phone?: string;
  tempToken?: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

interface RegisterFirebaseInput {
  tempToken: string;
  name: string;
  role: UserRole;
  district: string;
  refCode?: string;
}

interface VerifyResponse {
  verified?: boolean;
  isNewUser?: boolean;
  user: User;
  token: string;
  refreshToken: string;
}

interface RegisterInput {
  email?: string;
  phone: string;
  code: string;
  name: string;
  role: UserRole;
  district: string;
  transportMode?: string;
  refCode?: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi = {
  async login(email: string, phone?: string): Promise<LoginResponse> {
    const res = await api.post<{ data: LoginResponse }>('/auth/login', { email, ...(phone ? { phone } : {}) });
    return res.data;
  },

  async verify(emailOrPhone: string, code: string, role?: string, isEmail = true): Promise<VerifyResponse> {
    const key = isEmail ? { email: emailOrPhone } : { phone: emailOrPhone };
    const res = await api.post<{ data: VerifyResponse }>('/auth/verify', { ...key, code, role });
    return res.data;
  },

  async register(data: RegisterInput): Promise<RegisterResponse> {
    const res = await api.post<{ data: RegisterResponse }>('/auth/register', data);
    return res.data;
  },

  async verifyFirebase(idToken: string): Promise<VerifyFirebaseResponse> {
    const res = await api.post<{ data: VerifyFirebaseResponse }>('/auth/verify-firebase', { idToken });
    return res.data;
  },

  async registerFirebase(data: RegisterFirebaseInput): Promise<RegisterResponse> {
    const res = await api.post<{ data: RegisterResponse }>('/auth/register-firebase', data);
    return res.data;
  },

  async me(): Promise<User> {
    const res = await api.get<{ data: User }>('/users/me');
    return res.data;
  },

  async paymentHistory(): Promise<{ id: string; amount: number; address: string; district: string; date: string; type: 'earning' | 'payment' }[]> {
    const res = await api.get<{ data: { id: string; amount: number; address: string; district: string; date: string; type: 'earning' | 'payment' }[] }>('/users/payment-history');
    return res.data;
  },

  async refresh(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const res = await api.post<{ data: { token: string; refreshToken: string } }>('/auth/refresh', { refreshToken });
    return res.data;
  },

  async updateProfile(data: {
    name?: string;
    district?: string;
    email?: string | null;
    transportMode?: string;
    addresses?: string[];
    notifPush?: boolean;
    notifEmail?: boolean;
    notifEmailAddress?: string | null;
    notifTelegram?: boolean;
    fcmToken?: string | null;
    isAvailable?: boolean;
    inn?: string | null;
    [key: string]: any;
  }): Promise<User> {
    const res = await api.patch<{ data: User }>('/users/me', data);
    return res.data;
  },

  async vkidExchange(data: { access_token?: string; user_id?: string; code?: string; redirect_uri?: string; code_verifier?: string; device_id?: string; id_token?: string }): Promise<VkidResponse> {
    const res = await api.post<{ data: VkidResponse }>('/auth/vkid', data);
    return res.data;
  },

  async registerVkid(data: { tempToken: string; name: string; role: UserRole; district: string; transportMode?: string; inn?: string; refCode?: string }): Promise<{ user: User; token: string; refreshToken: string }> {
    const res = await api.post<{ data: { user: User; token: string; refreshToken: string } }>('/auth/register-vkid', data);
    return res.data;
  },

  async resendOtp(email: string): Promise<LoginResponse> {
    const res = await api.post<{ data: LoginResponse }>('/auth/login', { email });
    return res.data;
  },

  async requestEmailChange(email: string): Promise<{ sent: boolean; devCode?: string }> {
    const res = await api.post<{ data: { sent: boolean; devCode?: string } }>('/users/request-email-change', { email });
    return res.data;
  },

  async confirmEmailChange(email: string, code: string): Promise<{ ok: boolean; email: string }> {
    const res = await api.post<{ data: { ok: boolean; email: string } }>('/users/confirm-email-change', { email, code });
    return res.data;
  },

  async verifyInn(inn: string): Promise<{ inn: string; selfEmployed: boolean }> {
    const res = await api.post<{ data: { inn: string; selfEmployed: boolean } }>('/users/verify-inn', { inn });
    return res.data;
  },

  async appealFreeze(reason: string): Promise<{ ok: boolean }> {
    const res = await api.post<{ data: { ok: boolean } }>('/users/appeal-freeze', { reason });
    return res.data;
  },

  async getStats(): Promise<{ weeklyEarnings: number; monthlyEarnings: number; totalEarnings: number; completedOrders: number; avgRating: number | null; ratingCount: number }> {
    const res = await api.get<{ data: { weeklyEarnings: number; monthlyEarnings: number; totalEarnings: number; completedOrders: number; avgRating: number | null; ratingCount: number } }>('/users/stats');
    return res.data;
  },
};
