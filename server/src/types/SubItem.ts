// TypeScript interfaces for SubItem entity
// These match the database schema exactly

export enum SubItemType {
  PIZZA = 'pizza',
  DRINK = 'drink',
  SALAD = 'salad',
  DESSERT = 'dessert',
  APPETIZER = 'appetizer',
  OTHER = 'other'
}

export interface SubItem {
  // Primary key
  id: string; // UUID as string
  
  // Foreign key - links to parent order
  orderId: string; // UUID as string
  
  // Item details
  title: string;
  amount: number;
  type: SubItemType;
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubItemRequest {
  title: string;
  amount: number;
  type: SubItemType;
}

export interface UpdateSubItemRequest {
  title?: string;
  amount?: number;
  type?: SubItemType;
}

// Database query result interfaces
export interface SubItemWithOrder extends SubItem {
  order: {
    id: string;
    title: string;
    status: string;
  };
}
