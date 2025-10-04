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

/**
 * OrderList Component
 * 
 * Main component for displaying and managing pizza orders
 * Features:
 * - Real-time order updates via WebSocket
 * - Order status management
 * - List and map view modes
 * - Sorting and filtering capabilities
 * - Responsive design with Material-UI
 */
export const OrderList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const { ordersPerPage, showAll, sortBy, sortOrder, statusFilter } = useSelector((state: RootState) => state.settings);
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [switchingToShowAll, setSwitchingToShowAll] = useState(false);

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

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus }));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleShowAllChange = (showAll: boolean) => {
    if (showAll) {
      setSwitchingToShowAll(true);
      // Simulate a brief loading state
      setTimeout(() => {
        setSwitchingToShowAll(false);
      }, 500);
    }
    dispatch(setShowAll(showAll));
  };


  if ((loading && orders.length === 0) || switchingToShowAll) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {switchingToShowAll ? 'Loading all records...' : 'Loading orders...'}
        </Typography>
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
              onChange={(e) => handleShowAllChange(e.target.value === 'all')}
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
        <TableContainer component={Paper} sx={{ mt: 2, position: 'relative' }}>
          {(loading || switchingToShowAll) && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {switchingToShowAll ? 'Loading all records...' : 'Loading...'}
              </Typography>
            </Box>
          )}
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
                        disabled={updatingOrderId === order.id}
                      >
                        <MenuItem value="Received">Received</MenuItem>
                        <MenuItem value="Preparing">Preparing</MenuItem>
                        <MenuItem value="Ready">Ready</MenuItem>
                        <MenuItem value="En-Route">En-Route</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                      </Select>
                      {updatingOrderId === order.id && (
                        <CircularProgress size={16} sx={{ ml: 1 }} />
                      )}
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ position: 'relative', minHeight: '400px' }}>
          {(loading || switchingToShowAll) && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {switchingToShowAll ? 'Loading all records...' : 'Loading map...'}
              </Typography>
            </Box>
          )}
          <LazyMap
            orders={filteredAndSortedOrders}
            onOrderSelect={handleOrderSelect}
            selectedOrderId={selectedOrderId}
          />
        </Box>
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
