import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WebSocketOrderUpdate } from '../types/websocket';

/**
 * Custom hook for WebSocket connection management
 * Provides real-time updates for order status changes
 * 
 * @param url - WebSocket server URL
 * @returns WebSocket connection state and methods
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

  /**
   * Subscribe to order updates from WebSocket
   * @param callback - Function to call when order updates are received
   */
  const subscribeToOrderUpdates = (callback: (data: WebSocketOrderUpdate) => void) => {
    if (socketRef.current) {
      // Listen for multiple order events
      socketRef.current.on('order:created', callback);
      socketRef.current.on('order:updated', callback);
      socketRef.current.on('order:status-changed', callback);
      socketRef.current.on('order:deleted', callback);
      // Legacy support
      socketRef.current.on('orderUpdated', callback);
    }
  };

  /**
   * Unsubscribe from order updates
   * @param callback - Function to remove from event listeners
   */
  const unsubscribeFromOrderUpdates = (callback: (data: WebSocketOrderUpdate) => void) => {
    if (socketRef.current) {
      // Unsubscribe from all order events
      socketRef.current.off('order:created', callback);
      socketRef.current.off('order:updated', callback);
      socketRef.current.off('order:status-changed', callback);
      socketRef.current.off('order:deleted', callback);
      // Legacy support
      socketRef.current.off('orderUpdated', callback);
    }
  };

  /**
   * Emit order status update to WebSocket server
   * @param orderId - ID of the order to update
   * @param status - New status for the order
   */
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
