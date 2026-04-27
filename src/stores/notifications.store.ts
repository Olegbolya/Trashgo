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

interface NotificationsStore {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (n) =>
        set((state) => ({
          notifications: [
            { ...n, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, timestamp: Date.now(), read: false },
            ...state.notifications,
          ].slice(0, 50),
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearAll: () => set({ notifications: [] }),
    }),
    { name: 'notifications-storage' }
  )
);
