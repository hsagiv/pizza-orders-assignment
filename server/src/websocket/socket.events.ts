// WebSocket event handlers
// This file handles WebSocket events and broadcasting

import { Server as SocketIOServer, Socket } from 'socket.io';
import { SocketRooms } from './socket.rooms';
import { OrderService } from '../services/Order.service';
import { OrderStatus } from '../types/Order';

export class SocketEvents {
  private io: SocketIOServer;
  private rooms: SocketRooms;

  constructor(io: SocketIOServer, rooms: SocketRooms) {
    this.io = io;
    this.rooms = rooms;
  }

  /**
   * Handle order created event
   */
  public async handleOrderCreated(order: any): Promise<void> {
    try {
      // Broadcast to all clients
      this.rooms.broadcastToAll('order:created', {
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to order updates room
      this.rooms.broadcastToOrderUpdates('new-order', {
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to status-specific room
      this.rooms.broadcastToStatusRoom(order.status, 'order-joined-status', {
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });

      console.log(`📡 Broadcasted order created: ${order.id}`);
    } catch (error) {
      console.error('❌ Error broadcasting order created:', error);
    }
  }

  /**
   * Handle order updated event
   */
  public async handleOrderUpdated(order: any): Promise<void> {
    try {
      // Broadcast to all clients
      this.rooms.broadcastToAll('order:updated', {
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to order updates room
      this.rooms.broadcastToOrderUpdates('order-updated', {
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });

      console.log(`📡 Broadcasted order updated: ${order.id}`);
    } catch (error) {
      console.error('❌ Error broadcasting order updated:', error);
    }
  }

  /**
   * Handle order status changed event
   */
  public async handleOrderStatusChanged(order: any, oldStatus: OrderStatus): Promise<void> {
    try {
      // Broadcast to all clients
      this.rooms.broadcastToAll('order:status-changed', {
        success: true,
        data: order,
        oldStatus,
        timestamp: new Date().toISOString(),
      });

      // Notify old status room that order left
      this.rooms.broadcastToStatusRoom(oldStatus, 'order-left-status', {
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });

      // Notify new status room that order joined
      this.rooms.broadcastToStatusRoom(order.status, 'order-joined-status', {
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });

      console.log(`📡 Broadcasted status change: ${order.id} from ${oldStatus} to ${order.status}`);
    } catch (error) {
      console.error('❌ Error broadcasting status change:', error);
    }
  }

  /**
   * Handle order deleted event
   */
  public async handleOrderDeleted(orderId: string): Promise<void> {
    try {
      // Broadcast to all clients
      this.rooms.broadcastToAll('order:deleted', {
        success: true,
        data: { id: orderId },
        timestamp: new Date().toISOString(),
      });

      // Broadcast to order updates room
      this.rooms.broadcastToOrderUpdates('order-deleted', {
        success: true,
        data: { id: orderId },
        timestamp: new Date().toISOString(),
      });

      console.log(`📡 Broadcasted order deleted: ${orderId}`);
    } catch (error) {
      console.error('❌ Error broadcasting order deleted:', error);
    }
  }

  /**
   * Handle admin broadcast
   */
  public async handleAdminBroadcast(message: string, type: string = 'info'): Promise<void> {
    try {
      // Broadcast to admin room
      this.rooms.broadcastToAdminRoom('admin-message', {
        message,
        type,
        timestamp: new Date().toISOString(),
      });

      console.log(`📡 Admin broadcast: ${message}`);
    } catch (error) {
      console.error('❌ Error broadcasting admin message:', error);
    }
  }

  /**
   * Handle system notification
   */
  public async handleSystemNotification(message: string, type: string = 'info'): Promise<void> {
    try {
      // Broadcast to all clients
      this.rooms.broadcastToAll('system-notification', {
        message,
        type,
        timestamp: new Date().toISOString(),
      });

      console.log(`📡 System notification: ${message}`);
    } catch (error) {
      console.error('❌ Error broadcasting system notification:', error);
    }
  }

  /**
   * Handle statistics update
   */
  public async handleStatisticsUpdate(): Promise<void> {
    try {
      const statistics = await OrderService.getOrderStatistics();
      
      // Broadcast to admin room
      this.rooms.broadcastToAdminRoom('statistics-update', {
        success: true,
        data: statistics,
        timestamp: new Date().toISOString(),
      });

      console.log(`📡 Broadcasted statistics update`);
    } catch (error) {
      console.error('❌ Error broadcasting statistics update:', error);
    }
  }

  /**
   * Handle client request for orders
   */
  public async handleClientOrdersRequest(socket: Socket, filters: any): Promise<void> {
    try {
      const orders = await OrderService.getOrders({
        status: filters.status,
        limit: filters.limit || 20,
        offset: filters.offset || 0,
        includeSubItems: filters.includeSubItems || false,
      });

      socket.emit('orders-response', {
        success: true,
        data: orders,
        filters,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      socket.emit('orders-error', {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle client request for order by ID
   */
  public async handleClientOrderRequest(socket: Socket, orderId: string): Promise<void> {
    try {
      const order = await OrderService.getOrderById(orderId, true);
      
      if (order) {
        socket.emit('order-response', {
          success: true,
          data: order,
          timestamp: new Date().toISOString(),
        });
      } else {
        socket.emit('order-error', {
          success: false,
          error: 'Order not found',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      socket.emit('order-error', {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle client status update request
   */
  public async handleClientStatusUpdate(socket: Socket, orderId: string, status: OrderStatus): Promise<void> {
    try {
      const order = await OrderService.updateOrderStatus(orderId, status);
      
      if (order) {
        // Broadcast the update to all clients
        await this.handleOrderStatusChanged(order, status);
        
        socket.emit('status-update-success', {
          success: true,
          message: 'Order status updated successfully',
          timestamp: new Date().toISOString(),
        });
      } else {
        socket.emit('status-update-error', {
          success: false,
          error: 'Order not found',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      socket.emit('status-update-error', {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get connection statistics
   */
  public getConnectionStatistics(): {
    totalConnections: number;
    roomStatistics: any;
    uptime: number;
  } {
    return {
      totalConnections: this.io.engine.clientsCount,
      roomStatistics: this.rooms.getRoomStatistics(),
      uptime: process.uptime(),
    };
  }
}
