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
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store/store';
import { fetchOrders, updateOrderStatus } from '../store/slices/ordersSlice';
import { Order } from '../store/slices/ordersSlice';
import { OrderItem } from './OrderItem';
import { OrderMap } from './OrderMap';
import { StatusBadge } from './StatusBadge';
import { useWebSocket } from '../hooks/useWebSocket';

export const OrderList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const { ordersPerPage, sortBy, sortOrder, statusFilter } = useSelector((state: RootState) => state.settings);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);

  // WebSocket connection for real-time updates
  const { isConnected, error: wsError, subscribeToOrderUpdates, unsubscribeFromOrderUpdates } = useWebSocket(
    process.env.REACT_APP_WS_URL || 'http://localhost:3001'
  );

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Subscribe to real-time order updates
  useEffect(() => {
    const handleOrderUpdate = (data: any) => {
      console.log('📡 Received order update:', data);
      // Refresh orders when real-time update is received
      dispatch(fetchOrders());
    };

    if (isConnected) {
      subscribeToOrderUpdates(handleOrderUpdate);
    }

    return () => {
      unsubscribeFromOrderUpdates(handleOrderUpdate);
    };
  }, [isConnected, dispatch, subscribeToOrderUpdates, unsubscribeFromOrderUpdates]);

  // Filter and sort orders based on current settings - MUST be before any early returns
  const filteredAndSortedOrders = React.useMemo(() => {
    // First filter orders by status
    const filtered = statusFilter === 'all' 
      ? orders 
      : orders.filter(order => order.status === statusFilter);
    
    // Then sort the filtered orders
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'orderTime':
          comparison = new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'location':
          // Sort by distance from center (Manhattan coordinates as reference)
          const centerLat = 40.7128;
          const centerLng = -74.0060;
          const distanceA = Math.sqrt(
            Math.pow(Number(a.latitude) - centerLat, 2) + Math.pow(Number(a.longitude) - centerLng, 2)
          );
          const distanceB = Math.sqrt(
            Math.pow(Number(b.latitude) - centerLat, 2) + Math.pow(Number(b.longitude) - centerLng, 2)
          );
          comparison = distanceA - distanceB;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [orders, sortBy, sortOrder, statusFilter]);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Orders ({orders.length})
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: isConnected ? 'success.main' : 'error.main',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {isConnected ? 'Live' : 'Offline'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Filter"
              onChange={(e) => dispatch({ type: 'settings/setStatusFilter', payload: e.target.value })}
            >
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="Received">Received</MenuItem>
              <MenuItem value="Preparing">Preparing</MenuItem>
              <MenuItem value="Ready">Ready</MenuItem>
              <MenuItem value="En-Route">En Route</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
            </Select>
          </FormControl>
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
              <MenuItem value="location">Location</MenuItem>
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Per Page</InputLabel>
            <Select
              value={ordersPerPage}
              label="Per Page"
              onChange={(e) => dispatch({ type: 'settings/setOrdersPerPage', payload: Number(e.target.value) })}
            >
              <MenuItem value={1}>1 Order</MenuItem>
              <MenuItem value={2}>2 Orders</MenuItem>
              <MenuItem value={3}>3 Orders</MenuItem>
              <MenuItem value={4}>4 Orders</MenuItem>
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
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>Title</strong>
                    {sortBy === 'title' && (
                      sortOrder === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>Status</strong>
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>Location</strong>
                    {sortBy === 'location' && (
                      sortOrder === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>Order Time</strong>
                    {sortBy === 'orderTime' && (
                      sortOrder === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell><strong>Sub-Items</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedOrders.slice(0, ordersPerPage).map((order) => (
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

      {filteredAndSortedOrders.length > ordersPerPage && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {ordersPerPage} of {filteredAndSortedOrders.length} orders
          </Typography>
        </Box>
      )}
    </Box>
  );
};
