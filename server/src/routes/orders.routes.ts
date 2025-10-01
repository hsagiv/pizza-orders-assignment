// Orders API routes
// This file defines all order-related API endpoints

import { Router } from 'express';
import { asyncHandler } from '@/middleware/error.middleware';
import { apiRateLimiter } from '@/middleware/rate-limit.middleware';
import { OrderController } from '@/controllers/Order.controller';

const router = Router();

// Apply rate limiting to all order routes
router.use(apiRateLimiter);

// GET /api/orders - Get all orders with filtering and pagination
router.get('/', asyncHandler(OrderController.getOrders));

// GET /api/orders/:id - Get order by ID
router.get('/:id', asyncHandler(OrderController.getOrderById));

// POST /api/orders - Create new order
router.post('/', asyncHandler(OrderController.createOrder));

// PUT /api/orders/:id - Update order
router.put('/:id', asyncHandler(OrderController.updateOrder));

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', asyncHandler(OrderController.updateOrderStatus));

// DELETE /api/orders/:id - Delete order
router.delete('/:id', asyncHandler(OrderController.deleteOrder));

// GET /api/orders/status/:status - Get orders by status
router.get('/status/:status', asyncHandler(OrderController.getOrdersByStatus));

// GET /api/orders/location - Get orders by location
router.get('/location', asyncHandler(OrderController.getOrdersByLocation));

// GET /api/orders/statistics - Get order statistics
router.get('/statistics', asyncHandler(OrderController.getOrderStatistics));

export { router as ordersRouter };
