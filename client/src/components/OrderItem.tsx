import React, { useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import { Order } from '../store/slices/ordersSlice';
import { StatusBadge } from './StatusBadge';
import { formatCoordinates, formatTime } from '../utils/formatUtils';

interface OrderItemProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

// Status configuration removed - now using StatusBadge component

export const OrderItem: React.FC<OrderItemProps> = React.memo(({ order, onStatusUpdate }) => {
  const handleStatusChange = useCallback((event: SelectChangeEvent<string>) => {
    onStatusUpdate(order.id, event.target.value);
  }, [order.id, onStatusUpdate]);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            {order.title}
          </Typography>
          <StatusBadge 
            status={order.status} 
            size="small" 
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {formatCoordinates(order.latitude, order.longitude)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {formatTime(order.orderTime)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <RestaurantIcon fontSize="small" />
            Items ({order.subItems?.length || 0})
          </Typography>
          <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
            {order.subItems?.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography variant="body2">
                  {item.title} ({item.type})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  x{item.amount}
                </Typography>
              </Box>
            )) || (
              <Typography variant="body2" color="text.secondary">
                No items available
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <FormControl fullWidth size="small">
            <Select
              value={order.status}
              onChange={handleStatusChange}
              displayEmpty
            >
              <MenuItem value="Received">Received</MenuItem>
              <MenuItem value="Preparing">Preparing</MenuItem>
              <MenuItem value="Ready">Ready</MenuItem>
              <MenuItem value="En-Route">En Route</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );
});
