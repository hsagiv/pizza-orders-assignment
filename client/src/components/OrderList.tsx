import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store/store';
import { fetchOrders, updateOrderStatus } from '../store/slices/ordersSlice';
import { Order } from '../store/slices/ordersSlice';
import { OrderItem } from './OrderItem';
import { OrderMap } from './OrderMap';
import { StatusBadge } from './StatusBadge';

export const OrderList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const { ordersPerPage, sortBy, sortOrder } = useSelector((state: RootState) => state.settings);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    dispatch(updateOrderStatus({ orderId, status: newStatus }));
  };

  // Helper function to safely format coordinates
  const formatCoordinates = (lat: number | string, lng: number | string) => {
    try {
      const latitude = Number(lat);
      const longitude = Number(lng);
      if (isNaN(latitude) || isNaN(longitude)) {
        return 'Invalid coordinates';
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      return 'Invalid coordinates';
    }
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

  const handleOrderSelect = (order: Order) => {
    setSelectedOrderId(order.id);
  };

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

      {/* View Mode Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={viewMode} 
          onChange={(e, newValue) => setViewMode(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="List View" value="list" />
          <Tab label="Map View" value="map" />
        </Tabs>
      </Box>

      {/* Conditional rendering based on view mode */}
      {viewMode === 'list' ? (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="orders table">
            <TableHead>
              <TableRow>
                <TableCell><strong>Order ID</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Order Time</strong></TableCell>
                <TableCell><strong>Sub-Items</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.slice(0, ordersPerPage).map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell component="th" scope="row">
                    {order.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {order.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={order.status} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatCoordinates(order.latitude, order.longitude)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {new Date(order.orderTime).toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <RestaurantIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {order.subItems?.length || 0} items
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="Received">Received</MenuItem>
                        <MenuItem value="Preparing">Preparing</MenuItem>
                        <MenuItem value="Ready">Ready</MenuItem>
                        <MenuItem value="En-Route">En-Route</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <OrderMap
          orders={orders}
          onOrderSelect={handleOrderSelect}
          {...(selectedOrderId && { selectedOrderId })}
        />
      )}

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
