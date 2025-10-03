import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Paper } from '@mui/material';
import { Order } from '../store/slices/ordersSlice';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different order statuses
const createStatusIcon = (status: string) => {
  const colors = {
    'Received': '#ff9800',    // Orange
    'Preparing': '#ff5722',   // Deep Orange
    'Ready': '#2196f3',       // Blue
    'En-Route': '#9c27b0',    // Purple
    'Delivered': '#4caf50',   // Green
  };
  
  const color = colors[status as keyof typeof colors] || '#666';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: bold;
    ">${status.charAt(0)}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface SimpleMapProps {
  orders: Order[];
  onOrderSelect?: (order: Order) => void;
  selectedOrderId?: string | undefined;
}

// Component to handle map updates when orders change
const MapUpdater: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const map = useMap();
  
  useEffect(() => {
    if (orders.length > 0) {
      const bounds = L.latLngBounds(
        orders.map(order => [Number(order.latitude), Number(order.longitude)])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [orders, map]);
  
  return null;
};

export const SimpleMap: React.FC<SimpleMapProps> = ({
  orders,
  onOrderSelect,
  selectedOrderId,
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // NYC default

  useEffect(() => {
    if (orders.length > 0) {
      // Calculate center based on orders
      const avgLat = orders.reduce((sum, order) => sum + Number(order.latitude), 0) / orders.length;
      const avgLng = orders.reduce((sum, order) => sum + Number(order.longitude), 0) / orders.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [orders]);

  const handleMarkerClick = (order: Order) => {
    if (onOrderSelect) {
      onOrderSelect(order);
    }
  };

  if (orders.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No orders to display on map
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ height: '500px', width: '100%', borderRadius: 2, overflow: 'hidden' }}>
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater orders={orders} />
        
        {orders.map((order) => (
          <Marker
            key={order.id}
            position={[Number(order.latitude), Number(order.longitude)]}
            icon={createStatusIcon(order.status)}
            eventHandlers={{
              click: () => handleMarkerClick(order),
            }}
          >
            <Popup>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {order.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Status: {order.status}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Order Time: {new Date(order.orderTime).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Location: {Number(order.latitude).toFixed(4)}, {Number(order.longitude).toFixed(4)}
                </Typography>
                {order.subItems && order.subItems.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Items ({order.subItems.length}):
                    </Typography>
                    {order.subItems.map((item, index) => (
                      <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                        • {item.title} x{item.amount} ({item.type})
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};
