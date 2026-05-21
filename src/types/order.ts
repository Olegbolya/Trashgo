export type OrderStatus = 'new' | 'accepted' | 'in_progress' | 'pending_confirmation' | 'pending_payment' | 'completed' | 'cancelled';

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
  customerAvgRating?: number | null;
  customerRatingCount?: number;
  customerCompletedOrders?: number;
  contractorPhone?: string;
  contractorName?: string;
  contractorAvgRating?: number | null;
  contractorRatingCount?: number;
  contractorCompletedOrders?: number;
  acceptedAt?: string | null;
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
  updatedAt: string;
  ratingByCustomer: number | null;
  ratingByContractor: number | null;
  wasteType?: 'household' | 'construction' | 'bulky';
  history?: Array<{ status: OrderStatus; createdAt: string; note: string }>;
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
  wasteType?: 'household' | 'construction' | 'bulky';
}
