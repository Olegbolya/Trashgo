import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  type: 'order_status' | 'chat' | 'xp';
  title: string;
  message: string;
  orderId?: string;
  timestamp: number;
  read: boolean;
}

export interface NotificationSettings {
  pushOrderStatus: boolean;
  pushChat: boolean;
  pushXP: boolean;
  emailEnabled: boolean;
  emailAddress: string;
}

const defaultSettings: NotificationSettings = {
  pushOrderStatus: true,
  pushChat: true,
  pushXP: true,
  emailEnabled: false,
  emailAddress: '',
};

interface NotificationsStore {
  notifications: AppNotification[];
  settings: NotificationSettings;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  updateSettings: (s: Partial<NotificationSettings>) => void;
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      notifications: [],
      settings: defaultSettings,
      addNotification: (n) =>
        set((state) => ({
          notifications: [
            { ...n, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, timestamp: Date.now(), read: false },
            ...state.notifications,
          ].slice(0, 50),
        })),
      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearAll: () => set({ notifications: [] }),
      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),
    }),
    { name: 'notifications-storage' }
  )
);
