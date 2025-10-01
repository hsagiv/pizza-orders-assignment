// Database service layer for pizza order management
// This file provides high-level database operations with proper error handling

import { 
  executeQuery, 
  executeTransaction, 
  getDatabaseClient,
  testConnection 
} from './connection';
import { Order, OrderStatus, CreateOrderRequest, UpdateOrderRequest } from '@/types/Order';
import { SubItem, SubItemType, CreateSubItemRequest } from '@/types/SubItem';

export class DatabaseService {
  /**
   * Initialize database service
   */
  static async initialize(): Promise<void> {
    try {
      await testConnection();
      console.log('✅ Database service initialized');
    } catch (error) {
      console.error('❌ Database service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get all orders with optional filtering and pagination
   */
  static async getOrders(
    status?: OrderStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<Order[]> {
    try {
      let query = `
        SELECT 
          o.id,
          o.title,
          o.latitude,
          o.longitude,
          o.order_time as "orderTime",
          o.status,
          o.created_at as "createdAt",
          o.updated_at as "updatedAt"
        FROM orders o
      `;
      
      const params: any[] = [];
      
      if (status) {
        query += ' WHERE o.status = $1';
        params.push(status);
      }
      
      query += ' ORDER BY o.order_time DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);
      
      const orders = await executeQuery<Order>(query, params);
      return orders;
    } catch (error) {
      console.error('❌ Failed to get orders:', error);
      throw error;
    }
  }

  /**
   * Get order by ID with subitems
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderQuery = `
        SELECT 
          o.id,
          o.title,
          o.latitude,
          o.longitude,
          o.order_time as "orderTime",
          o.status,
          o.created_at as "createdAt",
          o.updated_at as "updatedAt"
        FROM orders o
        WHERE o.id = $1
      `;
      
      const orders = await executeQuery<Order>(orderQuery, [orderId]);
      
      if (orders.length === 0) {
        return null;
      }
      
      const order = orders[0]!;
      
      // Get subitems for this order
      const subItemsQuery = `
        SELECT 
          s.id,
          s.order_id as "orderId",
          s.title,
          s.amount,
          s.type,
          s.created_at as "createdAt",
          s.updated_at as "updatedAt"
        FROM sub_items s
        WHERE s.order_id = $1
        ORDER BY s.created_at ASC
      `;
      
      const subItems = await executeQuery<SubItem>(subItemsQuery, [orderId]);
      order.subItems = subItems;
      
      return order;
    } catch (error) {
      console.error('❌ Failed to get order by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new order with subitems
   */
  static async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      return await executeTransaction(async (client) => {
        // Insert order
        const orderQuery = `
          INSERT INTO orders (title, latitude, longitude, order_time, status)
          VALUES ($1, $2, $3, NOW(), 'Received')
          RETURNING 
            id,
            title,
            latitude,
            longitude,
            order_time as "orderTime",
            status,
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;
        
        const orderResult = await client.query(orderQuery, [
          orderData.title,
          orderData.latitude,
          orderData.longitude
        ]);
        
        const order = orderResult.rows[0];
        
        // Insert subitems
        if (orderData.subItems && orderData.subItems.length > 0) {
          const subItemQuery = `
            INSERT INTO sub_items (order_id, title, amount, type)
            VALUES ($1, $2, $3, $4)
            RETURNING 
              id,
              order_id as "orderId",
              title,
              amount,
              type,
              created_at as "createdAt",
              updated_at as "updatedAt"
          `;
          
          const subItems: SubItem[] = [];
          
          for (const subItemData of orderData.subItems) {
            const subItemResult = await client.query(subItemQuery, [
              order.id,
              subItemData.title,
              subItemData.amount,
              subItemData.type
            ]);
            
            subItems.push(subItemResult.rows[0]);
          }
          
          order.subItems = subItems;
        }
        
        return order;
      });
    } catch (error) {
      console.error('❌ Failed to create order:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    try {
      const query = `
        UPDATE orders 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING 
          id,
          title,
          latitude,
          longitude,
          order_time as "orderTime",
          status,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      
      const result = await executeQuery<Order>(query, [status, orderId]);
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0]!;
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      throw error;
    }
  }

  /**
   * Update order details
   */
  static async updateOrder(orderId: string, updateData: UpdateOrderRequest): Promise<Order | null> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;
      
      if (updateData.title !== undefined) {
        updateFields.push(`title = $${paramIndex}`);
        params.push(updateData.title);
        paramIndex++;
      }
      
      if (updateData.latitude !== undefined) {
        updateFields.push(`latitude = $${paramIndex}`);
        params.push(updateData.latitude);
        paramIndex++;
      }
      
      if (updateData.longitude !== undefined) {
        updateFields.push(`longitude = $${paramIndex}`);
        params.push(updateData.longitude);
        paramIndex++;
      }
      
      if (updateData.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        params.push(updateData.status);
        paramIndex++;
      }
      
      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }
      
      updateFields.push(`updated_at = NOW()`);
      params.push(orderId);
      
      const query = `
        UPDATE orders 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING 
          id,
          title,
          latitude,
          longitude,
          order_time as "orderTime",
          status,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      
      const result = await executeQuery<Order>(query, params);
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0]!;
    } catch (error) {
      console.error('❌ Failed to update order:', error);
      throw error;
    }
  }

  /**
   * Delete order and all its subitems
   */
  static async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM orders WHERE id = $1';
      const result = await executeQuery(query, [orderId]);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete order:', error);
      throw error;
    }
  }

  /**
   * Get orders by status
   */
  static async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      return await this.getOrders(status);
    } catch (error) {
      console.error('❌ Failed to get orders by status:', error);
      throw error;
    }
  }

  /**
   * Get orders count by status
   */
  static async getOrdersCountByStatus(): Promise<{ status: string; count: number }[]> {
    try {
      const query = `
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
        ORDER BY status
      `;
      
      const result = await executeQuery<{ status: string; count: string }>(query);
      return result.map(row => ({
        status: row.status,
        count: parseInt(row.count, 10)
      }));
    } catch (error) {
      console.error('❌ Failed to get orders count by status:', error);
      throw error;
    }
  }

  /**
   * Get orders within a geographic area
   */
  static async getOrdersByLocation(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ): Promise<Order[]> {
    try {
      const query = `
        SELECT 
          o.id,
          o.title,
          o.latitude,
          o.longitude,
          o.order_time as "orderTime",
          o.status,
          o.created_at as "createdAt",
          o.updated_at as "updatedAt"
        FROM orders o
        WHERE o.latitude BETWEEN $1 AND $2
        AND o.longitude BETWEEN $3 AND $4
        ORDER BY o.order_time DESC
      `;
      
      const orders = await executeQuery<Order>(query, [minLat, maxLat, minLng, maxLng]);
      return orders;
    } catch (error) {
      console.error('❌ Failed to get orders by location:', error);
      throw error;
    }
  }
}
