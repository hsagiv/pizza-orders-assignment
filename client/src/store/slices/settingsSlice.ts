import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  ordersPerPage: number;
  showAll: boolean; // New field for show all mode
  sortBy: 'orderTime' | 'status' | 'title' | 'location';
  sortOrder: 'asc' | 'desc';
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'light' | 'dark';
  language: string;
  rtl: boolean;
  // Filter settings
  statusFilter: 'Received' | 'Preparing' | 'Ready' | 'En-Route' | 'Delivered';
}

const initialState: SettingsState = {
  ordersPerPage: 2,
  showAll: false, // Default to paginated view
  sortBy: 'orderTime',
  sortOrder: 'desc',
  autoRefresh: true,
  refreshInterval: 5000,
  theme: 'light',
  language: 'en',
  rtl: false,
  statusFilter: 'Received', // Default to showing only "Received" orders
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setOrdersPerPage: (state, action: PayloadAction<number>) => {
      state.ordersPerPage = Math.max(1, Math.min(4, action.payload));
    },
    setShowAll: (state, action: PayloadAction<boolean>) => {
      state.showAll = action.payload;
      // When enabling showAll, disable pagination
      if (action.payload) {
        state.ordersPerPage = 1; // Reset to minimum when showing all
      }
    },
    setSortBy: (state, action: PayloadAction<'orderTime' | 'status' | 'title'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = Math.max(1000, action.payload);
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setRtl: (state, action: PayloadAction<boolean>) => {
      state.rtl = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<'Received' | 'Preparing' | 'Ready' | 'En-Route' | 'Delivered'>) => {
      state.statusFilter = action.payload;
    },
  },
});

export const {
  setOrdersPerPage,
  setShowAll,
  setSortBy,
  setSortOrder,
  setAutoRefresh,
  setRefreshInterval,
  setTheme,
  setLanguage,
  setRtl,
  setStatusFilter,
} = settingsSlice.actions;
