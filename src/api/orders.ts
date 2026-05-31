import { api } from './client';
import type { Order, CreateOrderInput, OrderStatus, ChatMessage } from '../types/order';
import type { ApiResponse } from '../types/api';

interface OrdersQuery {
  status?: OrderStatus;
  district?: string;
  page?: number;
  limit?: number;
}

export const ordersApi = {
  list(query?: OrdersQuery & { offset?: number }) {
    const params = new URLSearchParams();
    if (query?.status) params.set('status', query.status);
    if (query?.district) params.set('district', query.district);
    params.set('limit', String(query?.limit ?? 20));
    if (query?.offset) params.set('offset', String(query.offset));
    return api.get<ApiResponse<Order[]> & { meta: { hasMore: boolean; nextOffset: number | null } }>(`/orders?${params}`);
  },

  getById(id: string) {
    return api.get<Order>(`/orders/${id}`);
  },

  create(data: CreateOrderInput) {
    return api.post<Order>('/orders', data);
  },

  update(id: string, data: Partial<CreateOrderInput>) {
    return api.patch<Order>(`/orders/${id}`, data);
  },

  updateStatus(id: string, status: OrderStatus, extra?: { etaMinutes?: number }) {
    return api.patch<Order>(`/orders/${id}/status`, { status, ...extra });
  },

  accept(id: string) {
    return api.patch<Order>(`/orders/${id}/status`, { status: 'accepted' });
  },

  available(district?: string, cursor?: string, limit = 20) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (district) params.set('district', district);
    if (cursor) params.set('cursor', cursor);
    return api.get<ApiResponse<Order[]> & { meta: { hasMore: boolean; nextCursor: string | null } }>(`/orders/available?${params}`);
  },

  myJobs(offset = 0, limit = 20) {
    return api.get<ApiResponse<Order[]> & { meta: { hasMore: boolean; nextOffset: number | null } }>(`/orders?mode=contractor&offset=${offset}&limit=${limit}`);
  },

  completeOrder(id: string, completionPhotoUrls: string[]) {
    return api.post<Order>(`/orders/${id}/complete`, { completionPhotoUrls });
  },

  confirmOrder(id: string) {
    return api.post<Order>(`/orders/${id}/confirm`, {});
  },

  getMessages(id: string) {
    return api.get<ApiResponse<ChatMessage[]>>(`/orders/${id}/messages`);
  },

  sendMessage(id: string, text: string, photoUrl?: string | null) {
    return api.post<ChatMessage>(`/orders/${id}/messages`, { text, ...(photoUrl ? { photoUrl } : {}) });
  },

  rate(id: string, rating: number, review?: string) {
    return api.post<{ ok: boolean }>(`/orders/${id}/rate`, { rating, ...(review ? { review } : {}) });
  },

  disputeOrder(id: string, reason: string) {
    return api.post<{ ok: boolean }>(`/orders/${id}/dispute`, { reason });
  },

  paymentDispute(id: string) {
    return api.post<{ ok: boolean }>(`/orders/${id}/payment-dispute`, {});
  },

  confirmPayment(id: string) {
    return api.post<{ data: unknown }>(`/orders/${id}/confirm-payment`, {});
  },

  blockCustomer(id: string) {
    return api.post<{ ok: boolean }>(`/orders/${id}/block-customer`, {});
  },

  unassignContractor(id: string) {
    return api.post<{ ok: true }>(`/orders/${id}/unassign-contractor`, {});
  },
};
