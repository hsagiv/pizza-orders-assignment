import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { OrderList } from '../OrderList';
import { ordersSlice } from '../../store/slices/ordersSlice';
import { settingsSlice } from '../../store/slices/settingsSlice';

// Mock WebSocket hook
jest.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    error: null,
    subscribeToOrderUpdates: jest.fn(),
    unsubscribeFromOrderUpdates: jest.fn(),
  }),
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      orders: ordersSlice.reducer,
      settings: settingsSlice.reducer,
    },
    preloadedState: {
      orders: {
        orders: [
          {
            id: '1',
            title: 'Test Order',
            latitude: 40.7128,
            longitude: -74.0060,
            orderTime: '2024-01-01T10:00:00Z',
            status: 'Received',
            subItems: [],
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z',
          },
        ],
        loading: false,
        error: null,
        lastUpdated: null,
      },
      settings: {
        ordersPerPage: 2,
        sortBy: 'orderTime',
        sortOrder: 'desc',
        autoRefresh: true,
        refreshInterval: 5000,
        theme: 'light',
        language: 'en',
        rtl: false,
        statusFilter: 'all',
      },
      ...initialState,
    },
  });
};

const renderWithProvider = (component: React.ReactElement, store = createMockStore()) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe('OrderList', () => {
  it('renders orders table', () => {
    renderWithProvider(<OrderList />);
    expect(screen.getByText('Orders (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Order')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const store = createMockStore({
      orders: {
        orders: [],
        loading: true,
        error: null,
        lastUpdated: null,
      },
    });
    renderWithProvider(<OrderList />, store);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const store = createMockStore({
      orders: {
        orders: [],
        loading: false,
        error: 'Failed to load orders',
        lastUpdated: null,
      },
    });
    renderWithProvider(<OrderList />, store);
    expect(screen.getByText('Error loading orders: Failed to load orders')).toBeInTheDocument();
  });

  it('shows no orders message when empty', () => {
    const store = createMockStore({
      orders: {
        orders: [],
        loading: false,
        error: null,
        lastUpdated: null,
      },
    });
    renderWithProvider(<OrderList />, store);
    expect(screen.getByText('No orders found')).toBeInTheDocument();
  });

  it('allows switching between list and map view', () => {
    renderWithProvider(<OrderList />);
    
    // Should start with list view
    expect(screen.getByText('List View')).toBeInTheDocument();
    
    // Click map view tab
    fireEvent.click(screen.getByText('Map View'));
    expect(screen.getByText('Map View')).toBeInTheDocument();
  });

  it('allows filtering by status', () => {
    renderWithProvider(<OrderList />);
    
    const filterSelect = screen.getByLabelText('Filter');
    fireEvent.mouseDown(filterSelect);
    
    // Should show filter options
    expect(screen.getByText('All Orders')).toBeInTheDocument();
    expect(screen.getByText('Received')).toBeInTheDocument();
  });

  it('allows changing orders per page', () => {
    renderWithProvider(<OrderList />);
    
    const perPageSelect = screen.getByLabelText('Per Page');
    fireEvent.mouseDown(perPageSelect);
    
    // Should show per page options
    expect(screen.getByText('1 Order')).toBeInTheDocument();
    expect(screen.getByText('2 Orders')).toBeInTheDocument();
    expect(screen.getByText('3 Orders')).toBeInTheDocument();
    expect(screen.getByText('4 Orders')).toBeInTheDocument();
  });
});
