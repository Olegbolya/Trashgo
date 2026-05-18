export type UserRole = 'customer' | 'contractor';

export interface User {
  id: string;
  phone: string;
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
  telegramLinked: boolean;
  isAvailable: boolean;
  inn: string | null;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
