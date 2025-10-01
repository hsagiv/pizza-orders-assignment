import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  ordersPerPage: number;
  sortBy: 'orderTime' | 'status' | 'title';
  sortOrder: 'asc' | 'desc';
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'light' | 'dark';
  language: string;
  rtl: boolean;
}

const initialState: SettingsState = {
  ordersPerPage: 2,
  sortBy: 'orderTime',
  sortOrder: 'desc',
  autoRefresh: true,
  refreshInterval: 5000,
  theme: 'light',
  language: 'en',
  rtl: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setOrdersPerPage: (state, action: PayloadAction<number>) => {
      state.ordersPerPage = Math.max(1, Math.min(4, action.payload));
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
  },
});

export const {
  setOrdersPerPage,
  setSortBy,
  setSortOrder,
  setAutoRefresh,
  setRefreshInterval,
  setTheme,
  setLanguage,
  setRtl,
} = settingsSlice.actions;
