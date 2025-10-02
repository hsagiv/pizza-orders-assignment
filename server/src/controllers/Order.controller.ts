// Order controller
// This file handles all order-related API requests

import { Request, Response } from 'express';
import { OrderService } from '../services/Order.service';
import { AppError } from '../middleware/error.middleware';
import { OrderStatus } from '../types/Order';
import { getApiConfig } from '../config/app.config';

export class OrderController {
  /**
   * GET /api/orders - Get all orders with filtering and pagination
   */
  static async getOrders(req: Request, res: Response): Promise<void> {
    try {
      // Parse query parameters
      const {
        status,
        limit = getApiConfig().pagination.defaultLimit.toString(),
        offset = getApiConfig().pagination.defaultOffset.toString(),
        includeSubItems = 'true',
        sortBy = 'orderTime',
        sortOrder = 'desc',
      } = req.query;

      // Validate and parse parameters
      const parsedLimit = Math.min(
        parseInt(limit as string, 10),
        getApiConfig().pagination.maxLimit
      );
      const parsedOffset = Math.max(parseInt(offset as string, 10), 0);
      const parsedIncludeSubItems = includeSubItems === 'true';

      // Validate status if provided
      if (status && !Object.values(OrderStatus).includes(status as OrderStatus)) {
        throw new AppError('Invalid order status', 400);
      }

      // Get orders using raw SQL query to test database connection
      const { AppDataSource } = await import('../config/typeorm.config');
      const orders = await AppDataSource.query('SELECT * FROM orders LIMIT $1 OFFSET $2', [parsedLimit, parsedOffset]);

      // Get total count for pagination (temporarily disabled)
      const totalCount = { totalOrders: orders.length };

      // Prepare response
      const response = {
        success: true,
        data: orders,
        pagination: {
          limit: parsedLimit,
          offset: parsedOffset,
          total: totalCount.totalOrders,
          hasMore: parsedOffset + parsedLimit < totalCount.totalOrders,
        },
        filters: {
          status: status || null,
          sortBy,
          sortOrder,
        },
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/orders/:id - Get order by ID
   */
  static async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { includeSubItems = 'true' } = req.query;

      if (!id) {
        throw new AppError('Order ID is required', 400);
      }

      const parsedIncludeSubItems = includeSubItems === 'true';
      const order = await OrderService.getOrderById(id, parsedIncludeSubItems);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const response = {
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/orders - Create new order
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData = req.body;

      // Validate required fields
      if (!orderData.title || !orderData.latitude || !orderData.longitude) {
        throw new AppError('Title, latitude, and longitude are required', 400);
      }

      // Validate coordinates
      if (orderData.latitude < -90 || orderData.latitude > 90) {
        throw new AppError('Latitude must be between -90 and 90', 400);
      }
      if (orderData.longitude < -180 || orderData.longitude > 180) {
        throw new AppError('Longitude must be between -180 and 180', 400);
      }

      const order = await OrderService.createOrder(orderData);

      const response = {
        success: true,
        data: order,
        message: 'Order created successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT /api/orders/:id - Update order
   */
  static async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        throw new AppError('Order ID is required', 400);
      }

      const order = await OrderService.updateOrder(id, updateData);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const response = {
        success: true,
        data: order,
        message: 'Order updated successfully',
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT /api/orders/:id/status - Update order status
   */
  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        throw new AppError('Order ID is required', 400);
      }

      if (!status || !Object.values(OrderStatus).includes(status)) {
        throw new AppError('Valid order status is required', 400);
      }

      const order = await OrderService.updateOrderStatus(id, status);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const response = {
        success: true,
        data: order,
        message: 'Order status updated successfully',
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/orders/:id - Delete order
   */
  static async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Order ID is required', 400);
      }

      const deleted = await OrderService.deleteOrder(id);

      if (!deleted) {
        throw new AppError('Order not found', 404);
      }

      const response = {
        success: true,
        message: 'Order deleted successfully',
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/orders/status/:status - Get orders by status
   */
  static async getOrdersByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const { limit = getApiConfig().pagination.defaultLimit.toString(), offset = '0' } = req.query;

      if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
        throw new AppError('Valid order status is required', 400);
      }

      const parsedLimit = Math.min(
        parseInt(limit as string, 10),
        getApiConfig().pagination.maxLimit
      );
      const parsedOffset = Math.max(parseInt(offset as string, 10), 0);

      const orders = await OrderService.getOrdersByStatus(status as OrderStatus, parsedLimit, parsedOffset);

      const response = {
        success: true,
        data: orders,
        pagination: {
          limit: parsedLimit,
          offset: parsedOffset,
          total: orders.length,
        },
        filters: {
          status,
        },
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/orders/location - Get orders by location
   */
  static async getOrdersByLocation(req: Request, res: Response): Promise<void> {
    try {
      const {
        minLat,
        maxLat,
        minLng,
        maxLng,
        limit = getApiConfig().pagination.defaultLimit.toString(),
        offset = '0',
      } = req.query;

      if (!minLat || !maxLat || !minLng || !maxLng) {
        throw new AppError('minLat, maxLat, minLng, and maxLng are required', 400);
      }

      const parsedLimit = Math.min(
        parseInt(limit as string, 10),
        getApiConfig().pagination.maxLimit
      );
      const parsedOffset = Math.max(parseInt(offset as string, 10), 0);

      const orders = await OrderService.getOrdersByLocation(
        parseFloat(minLat as string),
        parseFloat(maxLat as string),
        parseFloat(minLng as string),
        parseFloat(maxLng as string),
        parsedLimit,
        parsedOffset
      );

      const response = {
        success: true,
        data: orders,
        pagination: {
          limit: parsedLimit,
          offset: parsedOffset,
          total: orders.length,
        },
        filters: {
          minLat: parseFloat(minLat as string),
          maxLat: parseFloat(maxLat as string),
          minLng: parseFloat(minLng as string),
          maxLng: parseFloat(maxLng as string),
        },
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/orders/statistics - Get order statistics
   */
  static async getOrderStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await OrderService.getOrderStatistics();

      const response = {
        success: true,
        data: statistics,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }
}
