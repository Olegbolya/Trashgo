import { api } from './client';
import type { User, UserRole } from '../types/user';

interface LoginResponse {
  otpSent: boolean;
  isNewUser: boolean;
}

interface VerifyResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface RegisterInput {
  phone: string;
  name: string;
  role: UserRole;
  district: string;
}

export const authApi = {
  login(phone: string) {
    return api.post<LoginResponse>('/auth/login', { phone });
  },

  verify(phone: string, code: string) {
    return api.post<VerifyResponse>('/auth/verify', { phone, code });
  },

  register(data: RegisterInput) {
    return api.post<VerifyResponse>('/auth/register', data);
  },

  me() {
    return api.get<User>('/users/me');
  },

  refresh(refreshToken: string) {
    return api.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken });
  },
};
