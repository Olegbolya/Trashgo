export type OrderStatus = 'new' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  contractorId: string | null;
  customerName?: string;
  address: string;
  district: string;
  status: OrderStatus;
  volume: number;
  price: number;
  description: string;
  photoUrls: string[];
  asap: boolean;
  scheduledAt: string | null;
  createdAt: string;
}

export interface CreateOrderInput {
  address: string;
  district: string;
  volume: number;
  price: number;
  description: string;
  asap?: boolean;
  scheduledAt?: string;
  photoUrls?: string[];
}
