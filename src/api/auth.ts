import { api } from './client';
import type { User, UserRole } from '../types/user';

interface LoginResponse {
  otpSent: boolean;
  isNewUser: boolean;
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
  phone: string;
  code: string;
  name: string;
  role: UserRole;
  district: string;
  refCode?: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi = {
  async login(phone: string, deliveryEmail?: string): Promise<LoginResponse> {
    const res = await api.post<{ data: LoginResponse }>('/auth/login', { phone, ...(deliveryEmail ? { deliveryEmail } : {}) });
    return res.data;
  },

  async verify(phone: string, code: string, role?: string): Promise<VerifyResponse> {
    const res = await api.post<{ data: VerifyResponse }>('/auth/verify', { phone, code, role });
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
  }): Promise<User> {
    const res = await api.patch<{ data: User }>('/users/me', data);
    return res.data;
  },
};
