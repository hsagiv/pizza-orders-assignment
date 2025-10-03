import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Custom hook for WebSocket connection management
 * Provides real-time updates for order status changes
 */
export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url]);

  // Subscribe to order updates
  const subscribeToOrderUpdates = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('orderUpdated', callback);
    }
  };

  // Unsubscribe from order updates
  const unsubscribeFromOrderUpdates = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off('orderUpdated', callback);
    }
  };

  // Emit order status update
  const emitOrderStatusUpdate = (orderId: string, status: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('updateOrderStatus', { orderId, status });
    }
  };

  return {
    isConnected,
    error,
    subscribeToOrderUpdates,
    unsubscribeFromOrderUpdates,
    emitOrderStatusUpdate,
  };
};
