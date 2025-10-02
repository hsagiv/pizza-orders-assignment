import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import { Order } from '../store/slices/ordersSlice';

interface OrderItemProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

const statusColors = {
  Received: 'default',
  Preparing: 'warning',
  Ready: 'info',
  'En-Route': 'primary',
  Delivered: 'success',
} as const;

const statusLabels = {
  Received: 'Received',
  Preparing: 'Preparing',
  Ready: 'Ready',
  'En-Route': 'En Route',
  Delivered: 'Delivered',
} as const;

export const OrderItem: React.FC<OrderItemProps> = ({ order, onStatusUpdate }) => {
  const handleStatusChange = (event: any) => {
    onStatusUpdate(order.id, event.target.value);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'default';
  };

  const getStatusLabel = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            {order.title}
          </Typography>
          <Chip
            label={getStatusLabel(order.status)}
            color={getStatusColor(order.status)}
            size="small"
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {Number(order.latitude).toFixed(4)}, {Number(order.longitude).toFixed(4)}
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
};
