import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

/**
 * Order Management Redux Slice
 * 
 * Handles all order-related state management including:
 * - Fetching orders from API
 * - Updating order status
 * - Real-time WebSocket integration
 * - State persistence
 */

// Types
export interface Order {
  id: string;
  title: string;
  latitude: number | string;
  longitude: number | string;
  orderTime: string;
  status: 'Received' | 'Preparing' | 'Ready' | 'En-Route' | 'Delivered';
  subItems: SubItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SubItem {
  id: string;
  orderId: string;
  title: string;
  amount: number;
  type: 'pizza' | 'drink' | 'salad' | 'dessert' | 'appetizer' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      // Request all orders by setting a high limit
      const response = await fetch('/api/orders?limit=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      
      // Handle nested response structure
      const ordersData = data.data || data;
      return ordersData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }: { orderId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Slice
export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
        state.lastUpdated = new Date().toISOString();
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        // Extract the data array from the API response
        state.orders = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        // The API returns { success: true, data: order, ... }
        const updatedOrder = action.payload.data;
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
          state.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setOrders, updateOrder, clearError } = ordersSlice.actions;
