import { configureStore } from '@reduxjs/toolkit';
import { ordersSlice } from './slices/ordersSlice';
import { settingsSlice } from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    orders: ordersSlice.reducer,
    settings: settingsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
