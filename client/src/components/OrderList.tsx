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
import { LazyMap } from './LazyMap';
import { StatusBadge } from './StatusBadge';
import { useWebSocket } from '../hooks/useWebSocket';
import { setStatusFilter, setShowAll } from '../store/slices/settingsSlice';
import { formatCoordinates, formatTime, formatOrderId } from '../utils/formatUtils';
import { WebSocketOrderUpdate } from '../types/websocket';
import { useLanguage } from '../contexts/LanguageContext';

export const OrderList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const { ordersPerPage, showAll, sortBy, sortOrder, statusFilter } = useSelector((state: RootState) => state.settings);
  const { t } = useLanguage();
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
    const handleOrderUpdate = (data: WebSocketOrderUpdate) => {
      console.log('📡 Received order update:', data);
      console.log('📡 WebSocket event type:', data);
      // Refresh orders when real-time update is received
      dispatch(fetchOrders());
    };

    if (isConnected) {
      console.log('🔌 WebSocket connected, subscribing to order updates');
      subscribeToOrderUpdates(handleOrderUpdate);
    } else {
      console.log('🔌 WebSocket not connected, cannot subscribe to updates');
    }

    return () => {
      console.log('🔌 Unsubscribing from order updates');
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

  if (filteredAndSortedOrders.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No {statusFilter} orders found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try selecting a different status filter to see other orders.
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
            {statusFilter === 'all' ? 'All Orders' : `${statusFilter} Orders`} ({filteredAndSortedOrders.length})
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
                  {isConnected ? t('live') : t('offline')}
                </Typography>
                {showAll && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                    <Typography variant="caption" color="primary.main" fontWeight="bold">
                      📋 ALL
                    </Typography>
                  </Box>
                )}
              </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('filter')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('filter')}
              onChange={(e) => dispatch({ type: 'settings/setStatusFilter', payload: e.target.value })}
            >
              <MenuItem value="all">{t('allOrders')}</MenuItem>
              <MenuItem value="Received">{t('received')}</MenuItem>
              <MenuItem value="Preparing">{t('preparing')}</MenuItem>
              <MenuItem value="Ready">{t('ready')}</MenuItem>
              <MenuItem value="En-Route">{t('enRoute')}</MenuItem>
              <MenuItem value="Delivered">{t('delivered')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('sortBy')}</InputLabel>
            <Select
              value={sortBy}
              label={t('sortBy')}
              onChange={(e) => dispatch({ type: 'settings/setSortBy', payload: e.target.value })}
            >
              <MenuItem value="orderTime">{t('orderTime')}</MenuItem>
              <MenuItem value="status">{t('status')}</MenuItem>
              <MenuItem value="title">{t('title')}</MenuItem>
              <MenuItem value="location">{t('location')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('order')}</InputLabel>
            <Select
              value={sortOrder}
              label={t('order')}
              onChange={(e) => dispatch({ type: 'settings/setSortOrder', payload: e.target.value })}
            >
              <MenuItem value="asc">{t('ascending')}</MenuItem>
              <MenuItem value="desc">{t('descending')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('perPage')}</InputLabel>
            <Select
              value={ordersPerPage}
              label={t('perPage')}
              disabled={showAll}
              onChange={(e) => dispatch({ type: 'settings/setOrdersPerPage', payload: Number(e.target.value) })}
            >
              <MenuItem value={1}>{t('oneOrder')}</MenuItem>
              <MenuItem value={2}>{t('twoOrders')}</MenuItem>
              <MenuItem value={3}>{t('threeOrders')}</MenuItem>
              <MenuItem value={4}>{t('fourOrders')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('display')}</InputLabel>
            <Select
              value={showAll ? 'all' : 'paginated'}
              label={t('display')}
              onChange={(e) => dispatch(setShowAll(e.target.value === 'all'))}
            >
              <MenuItem value="paginated">{t('paginated')}</MenuItem>
              <MenuItem value="all">{t('showAll')}</MenuItem>
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
          <Tab label={t('listView')} value="list" />
          <Tab label={t('mapView')} value="map" />
        </Tabs>
      </Box>

      {/* Conditional rendering based on view mode */}
      {viewMode === 'list' ? (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="orders table">
            <TableHead>
              <TableRow>
                <TableCell><strong>{t('orderId')}</strong></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>{t('title')}</strong>
                    {sortBy === 'title' && (
                      sortOrder === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>{t('status')}</strong>
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>{t('location')}</strong>
                    {sortBy === 'location' && (
                      sortOrder === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>{t('orderTime')}</strong>
                    {sortBy === 'orderTime' && (
                      sortOrder === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell><strong>{t('subItems')}</strong></TableCell>
                <TableCell><strong>{t('actions')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedOrders.slice(0, showAll ? filteredAndSortedOrders.length : ordersPerPage).map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell component="th" scope="row">
                        {formatOrderId(order.id)}
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
                            {formatTime(order.orderTime)}
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
        <LazyMap
          orders={filteredAndSortedOrders}
          onOrderSelect={handleOrderSelect}
          selectedOrderId={selectedOrderId}
        />
      )}

      {!showAll && filteredAndSortedOrders.length > ordersPerPage && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {ordersPerPage} of {filteredAndSortedOrders.length} orders
          </Typography>
        </Box>
      )}
      {showAll && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing all {filteredAndSortedOrders.length} orders
          </Typography>
        </Box>
      )}
    </Box>
  );
};
