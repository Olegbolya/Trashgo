import { api } from './client';
import type { User, UserRole } from '../types/user';

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
    transportMode?: string;
    addresses?: string[];
    notifPush?: boolean;
    notifEmail?: boolean;
    notifEmailAddress?: string | null;
    fcmToken?: string | null;
    isAvailable?: boolean;
    inn?: string | null;
  }): Promise<User> {
    const res = await api.patch<{ data: User }>('/users/me', data);
    return res.data;
  },

  async botInfo(): Promise<{ username: string | null }> {
    return api.get<{ username: string | null }>('/auth/bot-info');
  },

  async requestTelegram(phone: string): Promise<{ telegramBotLink: string }> {
    const res = await api.post<{ data: { telegramBotLink: string } }>('/auth/request-telegram', { phone });
    return res.data;
  },

  async resendOtp(email: string): Promise<LoginResponse> {
    const res = await api.post<{ data: LoginResponse }>('/auth/login', { email });
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
};
