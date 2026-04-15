export type OrderStatus = 'new' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  contractorId: string | null;
  address: string;
  district: string;
  status: OrderStatus;
  volume: number;
  price: number;
  description: string;
  scheduledAt: string;
  createdAt: string;
}

export interface CreateOrderInput {
  address: string;
  district: string;
  volume: number;
  price: number;
  description: string;
  scheduledAt: string;
}
