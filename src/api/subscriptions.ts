import { api } from './client';

export interface Subscription {
  id: string;
  customerId: string;
  address: string;
  district: string;
  days: number[];
  time: string;
  price: number;
  description: string;
  active: boolean;
  createdAt: string;
}

export interface CreateSubscriptionInput {
  address: string;
  district?: string;
  days: number[];
  time?: string;
  price: number;
  description?: string;
}

export const subscriptionsApi = {
  list() {
    return api.get<{ data: Subscription[] }>('/subscriptions');
  },

  create(data: CreateSubscriptionInput) {
    return api.post<{ data: Subscription }>('/subscriptions', data);
  },

  update(id: string, data: Partial<CreateSubscriptionInput & { active: boolean }>) {
    return api.patch<{ data: Subscription }>(`/subscriptions/${id}`, data);
  },

  remove(id: string) {
    return api.delete<{ ok: boolean }>(`/subscriptions/${id}`);
  },
};
