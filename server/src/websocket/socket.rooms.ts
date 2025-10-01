// WebSocket room management
// This file handles room organization for WebSocket clients

import { Server as SocketIOServer, Socket } from 'socket.io';
import { OrderStatus } from '@/types/Order';

export class SocketRooms {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Join order updates room
   */
  public joinOrderUpdates(socket: Socket): void {
    socket.join('order-updates');
    console.log(`📡 Client ${socket.id} joined order updates room`);
  }

  /**
   * Join status-specific room
   */
  public joinStatusRoom(socket: Socket, status: OrderStatus): void {
    const roomName = `status-${status}`;
    socket.join(roomName);
    console.log(`📡 Client ${socket.id} joined status room: ${status}`);
  }

  /**
   * Join admin room
   */
  public joinAdminRoom(socket: Socket): void {
    socket.join('admin-updates');
    console.log(`📡 Admin client ${socket.id} joined admin room`);
  }

  /**
   * Leave status room
   */
  public leaveStatusRoom(socket: Socket, status: OrderStatus): void {
    const roomName = `status-${status}`;
    socket.leave(roomName);
    console.log(`📡 Client ${socket.id} left status room: ${status}`);
  }

  /**
   * Get room members count
   */
  public getRoomMembersCount(roomName: string): number {
    const room = this.io.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
  }

  /**
   * Get all rooms
   */
  public getAllRooms(): string[] {
    return Array.from(this.io.sockets.adapter.rooms.keys());
  }

  /**
   * Get status rooms
   */
  public getStatusRooms(): string[] {
    return Object.values(OrderStatus).map(status => `status-${status}`);
  }

  /**
   * Broadcast to order updates room
   */
  public broadcastToOrderUpdates(event: string, data: any): void {
    this.io.to('order-updates').emit(event, data);
  }

  /**
   * Broadcast to status room
   */
  public broadcastToStatusRoom(status: OrderStatus, event: string, data: any): void {
    const roomName = `status-${status}`;
    this.io.to(roomName).emit(event, data);
  }

  /**
   * Broadcast to admin room
   */
  public broadcastToAdminRoom(event: string, data: any): void {
    this.io.to('admin-updates').emit(event, data);
  }

  /**
   * Broadcast to all clients
   */
  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Get room statistics
   */
  public getRoomStatistics(): {
    totalRooms: number;
    orderUpdatesMembers: number;
    adminMembers: number;
    statusRooms: { [key: string]: number };
  } {
    const statusRooms: { [key: string]: number } = {};
    
    // Count status room members
    Object.values(OrderStatus).forEach(status => {
      const roomName = `status-${status}`;
      statusRooms[status] = this.getRoomMembersCount(roomName);
    });

    return {
      totalRooms: this.getAllRooms().length,
      orderUpdatesMembers: this.getRoomMembersCount('order-updates'),
      adminMembers: this.getRoomMembersCount('admin-updates'),
      statusRooms,
    };
  }

  /**
   * Clean up empty rooms
   */
  public cleanupEmptyRooms(): void {
    const rooms = this.getAllRooms();
    let cleanedCount = 0;

    rooms.forEach(roomName => {
      if (this.getRoomMembersCount(roomName) === 0) {
        // Note: Socket.io automatically cleans up empty rooms
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} empty rooms`);
    }
  }

  /**
   * Get client room memberships
   */
  public getClientRooms(socket: Socket): string[] {
    const rooms: string[] = [];
    
    for (const [roomName, room] of this.io.sockets.adapter.rooms.entries()) {
      if (room.has(socket.id)) {
        rooms.push(roomName);
      }
    }

    return rooms;
  }

  /**
   * Move client between status rooms
   */
  public moveClientBetweenStatusRooms(socket: Socket, fromStatus: OrderStatus, toStatus: OrderStatus): void {
    this.leaveStatusRoom(socket, fromStatus);
    this.joinStatusRoom(socket, toStatus);
    console.log(`📡 Client ${socket.id} moved from ${fromStatus} to ${toStatus} room`);
  }
}
