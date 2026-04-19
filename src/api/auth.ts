import { api } from './client';
import type { User, UserRole } from '../types/user';

interface LoginResponse {
  otpSent: boolean;
  isNewUser: boolean;
  devCode?: string;
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
}

interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi = {
  async login(phone: string): Promise<LoginResponse> {
    const res = await api.post<{ data: LoginResponse }>('/auth/login', { phone });
    return res.data;
  },

  async verify(phone: string, code: string): Promise<VerifyResponse> {
    const res = await api.post<{ data: VerifyResponse }>('/auth/verify', { phone, code });
    return res.data;
  },

  async register(data: RegisterInput): Promise<RegisterResponse> {
    const res = await api.post<{ data: RegisterResponse }>('/auth/register', data);
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
};
