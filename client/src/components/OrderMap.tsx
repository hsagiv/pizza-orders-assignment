import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { LocationOn as LocationIcon, Info as InfoIcon } from '@mui/icons-material';
import { Order } from '../store/slices/ordersSlice';

interface OrderMapProps {
  orders: Order[];
  onOrderSelect?: (order: Order) => void;
  selectedOrderId?: string;
}

// Simple map implementation using CSS and HTML
// This is a lightweight alternative to heavy map libraries
export const OrderMap: React.FC<OrderMapProps> = ({ 
  orders, 
  onOrderSelect, 
  selectedOrderId 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapBounds, setMapBounds] = useState({
    minLat: 40.7,
    maxLat: 40.8,
    minLng: -74.1,
    maxLng: -73.9
  });

  // Calculate map bounds based on orders
  useEffect(() => {
    if (orders.length === 0) return;

    const lats = orders.map(order => Number(order.latitude));
    const lngs = orders.map(order => Number(order.longitude));

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Add padding
    const latPadding = (maxLat - minLat) * 0.1;
    const lngPadding = (maxLng - minLng) * 0.1;

    setMapBounds({
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding
    });
  }, [orders]);

  const getOrderPosition = (order: Order) => {
    const lat = Number(order.latitude);
    const lng = Number(order.longitude);
    
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Received': '#f44336',
      'Preparing': '#ff9800',
      'Ready': '#2196f3',
      'En-Route': '#9c27b0',
      'Delivered': '#4caf50'
    };
    return colors[status as keyof typeof colors] || '#666';
  };

  const handleOrderClick = (order: Order) => {
    if (onOrderSelect) {
      onOrderSelect(order);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '400px', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 2
      }}
    >
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            linear-gradient(45deg, #667eea 0%, #764ba2 100%)
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.03) 2px,
                rgba(255,255,255,0.03) 4px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.03) 2px,
                rgba(255,255,255,0.03) 4px
              )
            `
          }
        }}
      >
        {/* Map title */}
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          padding: '8px 12px',
          borderRadius: 1,
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="primary" />
            Orders Map ({orders.length} orders)
          </Typography>
        </Box>

        {/* Order markers */}
        {orders.map((order) => {
          const position = getOrderPosition(order);
          const isSelected = selectedOrderId === order.id;
          
          return (
            <Tooltip
              key={order.id}
              title={
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {order.title}
                  </Typography>
                  <Typography variant="body2">
                    Status: {order.status}
                  </Typography>
                  <Typography variant="body2">
                    Time: {new Date(order.orderTime).toLocaleTimeString()}
                  </Typography>
                  <Typography variant="body2">
                    Items: {order.subItems?.length || 0}
                  </Typography>
                </Box>
              }
              arrow
              placement="top"
            >
              <Box
                onClick={() => handleOrderClick(order)}
                sx={{
                  position: 'absolute',
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: isSelected ? 20 : 10,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translate(-50%, -50%) scale(1.2)',
                    zIndex: 20
                  }
                }}
              >
                <Box
                  sx={{
                    width: isSelected ? 24 : 16,
                    height: isSelected ? 24 : 16,
                    borderRadius: '50%',
                    background: getStatusColor(order.status),
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                    }
                  }}
                >
                  {isSelected && (
                    <InfoIcon sx={{ 
                      fontSize: 12, 
                      color: 'white',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                    }} />
                  )}
                </Box>
              </Box>
            </Tooltip>
          );
        })}

        {/* Map legend */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 16, 
          right: 16, 
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          padding: 2,
          borderRadius: 1,
          backdropFilter: 'blur(10px)',
          minWidth: 200
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Order Status
          </Typography>
          {['Received', 'Preparing', 'Ready', 'En-Route', 'Delivered'].map(status => (
            <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: getStatusColor(status),
                  border: '1px solid white'
                }}
              />
              <Typography variant="body2">{status}</Typography>
            </Box>
          ))}
        </Box>

        {/* Grid overlay */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
          opacity: 0.3
        }} />
      </Box>
    </Paper>
  );
};
