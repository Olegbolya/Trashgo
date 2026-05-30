export type UserRole = 'customer' | 'contractor';

export interface User {
  id: string;
  phone: string;
  email?: string | null;
  name: string;
  role: UserRole;
  district: string;
  transportMode?: string;
  xp: number;
  level: number;
  balance: number;
  avgRating: number | null;
  ratingCount: number;
  addresses: string[];
  notifPush: boolean;
  notifEmail: boolean;
  notifEmailAddress: string | null;
  notifTelegram?: boolean;
  telegramLinked: boolean;
  isAvailable: boolean;
  inn: string | null;
  innVerified: boolean;
  frozen: boolean;
  freezeReason: string | null;
  isVerified?: boolean;
  createdAt: string;
  subscriptionStatus?: 'trial' | 'active' | 'expired';
  subscriptionExpiresAt?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
