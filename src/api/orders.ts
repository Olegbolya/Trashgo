import { api } from './client';
import type { Order, CreateOrderInput, OrderStatus } from '../types/order';
import type { ApiResponse } from '../types/api';

interface OrdersQuery {
  status?: OrderStatus;
  district?: string;
  page?: number;
  limit?: number;
}

export const ordersApi = {
  list(query?: OrdersQuery) {
    const params = new URLSearchParams();
    if (query?.status) params.set('status', query.status);
    if (query?.district) params.set('district', query.district);
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    const qs = params.toString();
    return api.get<ApiResponse<Order[]>>(`/orders${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return api.get<Order>(`/orders/${id}`);
  },

  create(data: CreateOrderInput) {
    return api.post<Order>('/orders', data);
  },

  updateStatus(id: string, status: OrderStatus) {
    return api.patch<Order>(`/orders/${id}/status`, { status });
  },

  available(district?: string) {
    const qs = district ? `?district=${district}` : '';
    return api.get<ApiResponse<Order[]>>(`/orders/available${qs}`);
  },

  myJobs() {
    return api.get<ApiResponse<Order[]>>('/orders?mode=contractor');
  },
};
