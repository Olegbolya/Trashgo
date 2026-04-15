import { create } from 'zustand';
import type { Order } from '../types/order';

interface OrdersStore {
  orders: Order[];
  availableOrders: Order[];
  isLoading: boolean;

  setOrders: (orders: Order[]) => void;
  setAvailableOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: [],
  availableOrders: [],
  isLoading: false,

  setOrders: (orders) => set({ orders }),
  setAvailableOrders: (orders) => set({ availableOrders: orders }),

  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),

  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
      availableOrders: state.availableOrders.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
