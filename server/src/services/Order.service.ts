// Order Service - High-level business logic for order management
// This file combines Order and SubItem repositories to provide business operations

import { OrderRepository } from '@/repositories/Order.repository';
import { SubItemRepository } from '@/repositories/SubItem.repository';
import { Order, SubItem } from '@/models';
import { OrderStatus, CreateOrderRequest, UpdateOrderRequest } from '@/types/Order';
import { SubItemType, CreateSubItemRequest } from '@/types/SubItem';

export class OrderService {
  private orderRepository: OrderRepository;
  private subItemRepository: SubItemRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.subItemRepository = new SubItemRepository();
  }

  /**
   * Get all orders with optional filtering
   */
  async getOrders(options: {
    status?: OrderStatus;
    limit?: number;
    offset?: number;
    includeSubItems?: boolean;
  } = {}): Promise<Order[]> {
    return await this.orderRepository.findAll(options);
  }

  /**
   * Get order by ID with subitems
   */
  async getOrderById(id: string, includeSubItems: boolean = true): Promise<Order | null> {
    return await this.orderRepository.findById(id, includeSubItems);
  }

  /**
   * Create a new order with subitems
   */
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    // Create order
    const order = await this.orderRepository.create({
      title: orderData.title,
      latitude: orderData.latitude,
      longitude: orderData.longitude,
      status: 'Received',
      subItems: orderData.subItems,
    });

    return order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    return await this.orderRepository.updateStatus(id, status);
  }

  /**
   * Update order details
   */
  async updateOrder(id: string, updateData: UpdateOrderRequest): Promise<Order | null> {
    return await this.orderRepository.update(id, updateData);
  }

  /**
   * Delete order and all its subitems
   */
  async deleteOrder(id: string): Promise<boolean> {
    return await this.orderRepository.delete(id);
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: OrderStatus, limit: number = 50, offset: number = 0): Promise<Order[]> {
    return await this.orderRepository.findByStatus(status, limit, offset);
  }

  /**
   * Get orders within a geographic area
   */
  async getOrdersByLocation(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Order[]> {
    return await this.orderRepository.findByLocation(minLat, maxLat, minLng, maxLng, limit, offset);
  }

  /**
   * Get orders count by status
   */
  async getOrdersCountByStatus(): Promise<Array<{ status: string; count: number }>> {
    return await this.orderRepository.getCountByStatus();
  }

  /**
   * Get active orders (not delivered)
   */
  async getActiveOrders(limit: number = 50, offset: number = 0): Promise<Order[]> {
    return await this.orderRepository.findActive(limit, offset);
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(): Promise<{
    totalOrders: number;
    activeOrders: number;
    deliveredOrders: number;
    averageOrderTime: number;
  }> {
    return await this.orderRepository.getStatistics();
  }

  /**
   * Add subitem to existing order
   */
  async addSubItemToOrder(orderId: string, subItemData: CreateSubItemRequest): Promise<SubItem | null> {
    // Check if order exists
    const order = await this.getOrderById(orderId, false);
    if (!order) {
      return null;
    }

    // Check if order can be modified
    if (!order.canBeUpdated) {
      throw new Error('Cannot add items to delivered order');
    }

    // Create subitem
    return await this.subItemRepository.create({
      title: subItemData.title,
      amount: subItemData.amount,
      type: subItemData.type,
      orderId,
    });
  }

  /**
   * Update subitem
   */
  async updateSubItem(subItemId: string, updateData: {
    title?: string;
    amount?: number;
    type?: SubItemType;
  }): Promise<SubItem | null> {
    return await this.subItemRepository.update(subItemId, updateData);
  }

  /**
   * Delete subitem
   */
  async deleteSubItem(subItemId: string): Promise<boolean> {
    return await this.subItemRepository.delete(subItemId);
  }

  /**
   * Get subitems for an order
   */
  async getSubItemsForOrder(orderId: string): Promise<SubItem[]> {
    return await this.subItemRepository.findByOrderId(orderId);
  }

  /**
   * Get subitems by type
   */
  async getSubItemsByType(type: SubItemType, limit: number = 100, offset: number = 0): Promise<SubItem[]> {
    return await this.subItemRepository.findByType(type, limit, offset);
  }

  /**
   * Get subitem statistics
   */
  async getSubItemStatistics(): Promise<{
    totalSubItems: number;
    totalAmount: number;
    averageAmount: number;
    typeDistribution: Array<{ type: string; count: number; percentage: number }>;
  }> {
    return await this.subItemRepository.getStatistics();
  }

  /**
   * Get most popular subitems
   */
  async getMostPopularSubItems(limit: number = 10): Promise<Array<{ title: string; totalAmount: number; orderCount: number }>> {
    return await this.subItemRepository.getMostPopular(limit);
  }

  /**
   * Update all subitems for an order
   */
  async updateOrderSubItems(orderId: string, subItems: CreateSubItemRequest[]): Promise<SubItem[]> {
    // Check if order exists and can be modified
    const order = await this.getOrderById(orderId, false);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.canBeUpdated) {
      throw new Error('Cannot modify delivered order');
    }

    // Update subitems
    return await this.subItemRepository.updateForOrder(orderId, subItems);
  }

  /**
   * Get orders with subitems by date range
   */
  async getOrdersByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 50,
    offset: number = 0
  ): Promise<Order[]> {
    return await this.orderRepository.findByDateRange(startDate, endDate, limit, offset);
  }

  /**
   * Get comprehensive order data with all related information
   */
  async getOrderWithDetails(id: string): Promise<{
    order: Order;
    subItems: SubItem[];
    statistics: {
      totalItems: number;
      totalAmount: number;
      itemTypes: string[];
    };
  } | null> {
    const order = await this.getOrderById(id, true);
    if (!order) {
      return null;
    }

    const subItems = order.subItems || [];
    const totalItems = subItems.reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = subItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemTypes = [...new Set(subItems.map(item => item.type))];

    return {
      order,
      subItems,
      statistics: {
        totalItems,
        totalAmount,
        itemTypes,
      },
    };
  }
}
