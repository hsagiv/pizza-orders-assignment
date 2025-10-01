// WebSocket service integration
// This file provides WebSocket integration with the order service

import { SocketServer } from '@/websocket';
import { OrderService } from './Order.service';
import { OrderStatus } from '@/types/Order';

export class WebSocketService {
  private socketServer: SocketServer | null = null;

  /**
   * Initialize WebSocket service
   */
  public initialize(socketServer: SocketServer): void {
    this.socketServer = socketServer;
    console.log('✅ WebSocket service initialized');
  }

  /**
   * Broadcast order created event
   */
  public async broadcastOrderCreated(order: any): Promise<void> {
    if (!this.socketServer) {
      console.warn('⚠️  WebSocket server not initialized');
      return;
    }

    try {
      await this.socketServer.broadcastOrderCreated(order);
      console.log(`📡 Broadcasted order created: ${order.id}`);
    } catch (error) {
      console.error('❌ Error broadcasting order created:', error);
    }
  }

  /**
   * Broadcast order updated event
   */
  public async broadcastOrderUpdated(order: any): Promise<void> {
    if (!this.socketServer) {
      console.warn('⚠️  WebSocket server not initialized');
      return;
    }

    try {
      await this.socketServer.broadcastOrderUpdated(order);
      console.log(`📡 Broadcasted order updated: ${order.id}`);
    } catch (error) {
      console.error('❌ Error broadcasting order updated:', error);
    }
  }

  /**
   * Broadcast order status changed event
   */
  public async broadcastOrderStatusChanged(order: any, oldStatus: OrderStatus): Promise<void> {
    if (!this.socketServer) {
      console.warn('⚠️  WebSocket server not initialized');
      return;
    }

    try {
      await this.socketServer.broadcastOrderStatusChanged(order, oldStatus);
      console.log(`📡 Broadcasted status change: ${order.id} from ${oldStatus} to ${order.status}`);
    } catch (error) {
      console.error('❌ Error broadcasting status change:', error);
    }
  }

  /**
   * Broadcast order deleted event
   */
  public async broadcastOrderDeleted(orderId: string): Promise<void> {
    if (!this.socketServer) {
      console.warn('⚠️  WebSocket server not initialized');
      return;
    }

    try {
      await this.socketServer.broadcastOrderDeleted(orderId);
      console.log(`📡 Broadcasted order deleted: ${orderId}`);
    } catch (error) {
      console.error('❌ Error broadcasting order deleted:', error);
    }
  }

  /**
   * Get connected clients count
   */
  public getConnectedClientsCount(): number {
    if (!this.socketServer) {
      return 0;
    }

    return this.socketServer.getConnectedClientsCount();
  }

  /**
   * Broadcast system notification
   */
  public async broadcastSystemNotification(message: string, type: string = 'info'): Promise<void> {
    if (!this.socketServer) {
      console.warn('⚠️  WebSocket server not initialized');
      return;
    }

    try {
      const io = this.socketServer.getIO();
      io.emit('system-notification', {
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
   * Broadcast admin message
   */
  public async broadcastAdminMessage(message: string, type: string = 'info'): Promise<void> {
    if (!this.socketServer) {
      console.warn('⚠️  WebSocket server not initialized');
      return;
    }

    try {
      const io = this.socketServer.getIO();
      io.to('admin-updates').emit('admin-message', {
        message,
        type,
        timestamp: new Date().toISOString(),
      });
      console.log(`📡 Admin message: ${message}`);
    } catch (error) {
      console.error('❌ Error broadcasting admin message:', error);
    }
  }

  /**
   * Broadcast statistics update
   */
  public async broadcastStatisticsUpdate(): Promise<void> {
    if (!this.socketServer) {
      console.warn('⚠️  WebSocket server not initialized');
      return;
    }

    try {
      const statistics = await OrderService.getOrderStatistics();
      const io = this.socketServer.getIO();
      
      io.to('admin-updates').emit('statistics-update', {
        success: true,
        data: statistics,
        timestamp: new Date().toISOString(),
      });
      
      console.log(`📡 Statistics update broadcasted`);
    } catch (error) {
      console.error('❌ Error broadcasting statistics update:', error);
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
