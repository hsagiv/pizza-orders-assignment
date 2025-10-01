import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import { AppDispatch, RootState } from '../store/store';
import { fetchOrders, updateOrderStatus } from '../store/slices/ordersSlice';
import { Order } from '../store/slices/ordersSlice';
import { OrderItem } from './OrderItem';

export const OrderList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const { ordersPerPage, sortBy, sortOrder } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    dispatch(updateOrderStatus({ orderId, status: newStatus }));
  };

  if (loading && orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading orders: {error}
      </Alert>
    );
  }

  if (orders.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No orders found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Orders will appear here when they are created.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Orders ({orders.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => dispatch({ type: 'settings/setSortBy', payload: e.target.value })}
            >
              <MenuItem value="orderTime">Order Time</MenuItem>
              <MenuItem value="status">Status</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              label="Order"
              onChange={(e) => dispatch({ type: 'settings/setSortOrder', payload: e.target.value })}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {orders.slice(0, ordersPerPage).map((order) => (
          <Grid item xs={12} md={6} key={order.id}>
            <OrderItem
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          </Grid>
        ))}
      </Grid>

      {orders.length > ordersPerPage && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {ordersPerPage} of {orders.length} orders
          </Typography>
        </Box>
      )}
    </Box>
  );
};
