// WebSocket server using Socket.io
// This file provides real-time communication for order updates

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getWebSocketConfig } from '@/config/app.config';
import { OrderService } from '@/services/Order.service';
import { OrderStatus } from '@/types/Order';
import { SocketAuth } from './socket.auth';
import { SocketRooms } from './socket.rooms';
import { SocketEvents } from './socket.events';

export class SocketServer {
  private io: SocketIOServer;
  private auth: SocketAuth;
  private rooms: SocketRooms;
  private events: SocketEvents;

  constructor(httpServer: HTTPServer) {
    // Initialize Socket.io server
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: getWebSocketConfig().connection.origin || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: getWebSocketConfig().connection.pingTimeout,
      pingInterval: getWebSocketConfig().connection.pingInterval,
    });

    // Initialize components
    this.auth = new SocketAuth();
    this.rooms = new SocketRooms(this.io);
    this.events = new SocketEvents(this.io, this.rooms);

    // Setup middleware and event handlers
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup Socket.io middleware
   */
  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(this.auth.authenticate.bind(this.auth));

    // Connection logging
    this.io.use((socket, next) => {
      console.log(`🔌 WebSocket connection attempt from ${socket.handshake.address}`);
      next();
    });
  }

  /**
   * Setup Socket.io event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`✅ WebSocket client connected: ${socket.id}`);

      // Handle client joining rooms
      this.handleRoomJoining(socket);

      // Handle order events
      this.handleOrderEvents(socket);

      // Handle admin events
      this.handleAdminEvents(socket);

      // Handle disconnection
      this.handleDisconnection(socket);
    });
  }

  /**
   * Handle client joining rooms
   */
  private handleRoomJoining(socket: any): void {
    // Join order updates room
    socket.join(getWebSocketConfig().rooms.orderUpdates);
    console.log(`📡 Client ${socket.id} joined order updates room`);

    // Join status-specific rooms if client has preferences
    socket.on('join-status-room', (status: OrderStatus) => {
      if (Object.values(OrderStatus).includes(status)) {
        socket.join(`status-${status}`);
        console.log(`📡 Client ${socket.id} joined status room: ${status}`);
      }
    });

    // Join admin room if client is admin
    if (socket.user?.role === 'admin') {
      socket.join(getWebSocketConfig().rooms.adminUpdates);
      console.log(`📡 Admin client ${socket.id} joined admin room`);
    }
  }

  /**
   * Handle order-related events
   */
  private handleOrderEvents(socket: any): void {
    // Get orders
    socket.on('get-orders', async (data: any) => {
      try {
        const orders = await OrderService.getOrders({
          status: data.status,
          limit: data.limit || 20,
          offset: data.offset || 0,
          includeSubItems: data.includeSubItems || false,
        });

        socket.emit('orders-data', {
          success: true,
          data: orders,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        socket.emit('orders-error', {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Get order by ID
    socket.on('get-order', async (data: { id: string }) => {
      try {
        const order = await OrderService.getOrderById(data.id, true);
        
        if (order) {
          socket.emit('order-data', {
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
    });

    // Update order status
    socket.on('update-order-status', async (data: { id: string; status: OrderStatus }) => {
      try {
        const order = await OrderService.updateOrderStatus(data.id, data.status);
        
        if (order) {
          // Broadcast status update to all clients
          this.io.emit(getWebSocketConfig().events.orderStatusChanged, {
            success: true,
            data: order,
            timestamp: new Date().toISOString(),
          });

          // Notify specific status room
          this.io.to(`status-${data.status}`).emit('status-update', {
            success: true,
            data: order,
            timestamp: new Date().toISOString(),
          });

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
    });
  }

  /**
   * Handle admin events
   */
  private handleAdminEvents(socket: any): void {
    // Only allow admin users
    if (socket.user?.role !== 'admin') {
      return;
    }

    // Get order statistics
    socket.on('get-statistics', async () => {
      try {
        const statistics = await OrderService.getOrderStatistics();
        
        socket.emit('statistics-data', {
          success: true,
          data: statistics,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        socket.emit('statistics-error', {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Broadcast admin message
    socket.on('broadcast-message', (data: { message: string; type: string }) => {
      this.io.emit('admin-message', {
        message: data.message,
        type: data.type,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(socket: any): void {
    socket.on('disconnect', (reason: string) => {
      console.log(`❌ WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
    });
  }

  /**
   * Broadcast order created event
   */
  public async broadcastOrderCreated(order: any): Promise<void> {
    this.io.emit(getWebSocketConfig().events.orderCreated, {
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
    });

    // Notify status-specific room
    this.io.to(`status-${order.status}`).emit('new-order', {
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast order updated event
   */
  public async broadcastOrderUpdated(order: any): Promise<void> {
    this.io.emit(getWebSocketConfig().events.orderUpdated, {
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast order status changed event
   */
  public async broadcastOrderStatusChanged(order: any, oldStatus: OrderStatus): Promise<void> {
    this.io.emit(getWebSocketConfig().events.orderStatusChanged, {
      success: true,
      data: order,
      oldStatus,
      timestamp: new Date().toISOString(),
    });

    // Notify both old and new status rooms
    this.io.to(`status-${oldStatus}`).emit('order-left-status', {
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
    });

    this.io.to(`status-${order.status}`).emit('order-joined-status', {
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast order deleted event
   */
  public async broadcastOrderDeleted(orderId: string): Promise<void> {
    this.io.emit(getWebSocketConfig().events.orderDeleted, {
      success: true,
      data: { id: orderId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get connected clients count
   */
  public getConnectedClientsCount(): number {
    return this.io.engine.clientsCount;
  }

  /**
   * Get server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}
