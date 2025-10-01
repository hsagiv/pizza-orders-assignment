// TypeScript interfaces for Order entity
// These match the database schema exactly

export enum OrderStatus {
  RECEIVED = 'Received',
  PREPARING = 'Preparing',
  READY = 'Ready',
  EN_ROUTE = 'En-Route',
  DELIVERED = 'Delivered'
}

export interface Order {
  // Primary key
  id: string; // UUID as string
  
  // Order details
  title: string;
  latitude: number;
  longitude: number;
  orderTime: Date;
  status: OrderStatus;
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  
  // Related data (populated when needed)
  subItems?: SubItem[];
}

export interface CreateOrderRequest {
  title: string;
  latitude: number;
  longitude: number;
  subItems: CreateSubItemRequest[];
}

export interface UpdateOrderRequest {
  title?: string;
  latitude?: number;
  longitude?: number;
  status?: OrderStatus;
}

export interface OrderWithSubItems extends Order {
  subItems: SubItem[];
}

// Import SubItem interface (defined in separate file)
import { SubItem, CreateSubItemRequest } from './SubItem';
