export type OrderStatus = 'new' | 'accepted' | 'in_progress' | 'pending_confirmation' | 'completed' | 'cancelled';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  contractorId: string | null;
  customerName?: string;
  customerPhone?: string;
  contractorPhone?: string;
  contractorName?: string;
  address: string;
  district: string;
  status: OrderStatus;
  volume: number;
  price: number;
  description: string;
  photoUrls: string[];
  completionPhotoUrls: string[];
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
