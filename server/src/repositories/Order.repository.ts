// Order Repository using TypeORM
// This file provides high-level database operations for Order entities

import { Repository, FindOptionsWhere, FindManyOptions, In } from 'typeorm';
import { Order } from '@/models/Order.entity';
import { SubItem } from '@/models/SubItem.entity';
import { OrderStatus } from '@/types/Order';
import { getRepository } from '@/config/typeorm.config';

export class OrderRepository {
  private orderRepository: Repository<Order>;
  private subItemRepository: Repository<SubItem>;

  constructor() {
    this.orderRepository = getRepository(Order);
    this.subItemRepository = getRepository(SubItem);
  }

  /**
   * Find all orders with optional filtering and pagination
   */
  async findAll(options: {
    status?: OrderStatus;
    limit?: number;
    offset?: number;
    includeSubItems?: boolean;
  } = {}): Promise<Order[]> {
    const {
      status,
      limit = 50,
      offset = 0,
      includeSubItems = false,
    } = options;

    const findOptions: FindManyOptions<Order> = {
      take: limit,
      skip: offset,
      order: { orderTime: 'DESC' },
    };

    if (status) {
      findOptions.where = { status } as FindOptionsWhere<Order>;
    }

    if (includeSubItems) {
      findOptions.relations = ['subItems'];
    }

    return await this.orderRepository.find(findOptions);
  }

  /**
   * Find order by ID with optional subitems
   */
  async findById(id: string, includeSubItems: boolean = true): Promise<Order | null> {
    const findOptions: FindManyOptions<Order> = {
      where: { id } as FindOptionsWhere<Order>,
    };

    if (includeSubItems) {
      findOptions.relations = ['subItems'];
    }

    const orders = await this.orderRepository.find(findOptions);
    return orders.length > 0 ? orders[0] : null;
  }

  /**
   * Create a new order with subitems
   */
  async create(orderData: {
    title: string;
    latitude: number;
    longitude: number;
    status?: OrderStatus;
    subItems?: Array<{
      title: string;
      amount: number;
      type: string;
    }>;
  }): Promise<Order> {
    // Create order entity
    const order = Order.create({
      title: orderData.title,
      latitude: orderData.latitude,
      longitude: orderData.longitude,
      status: orderData.status || 'Received',
    });

    // Save order first
    const savedOrder = await this.orderRepository.save(order);

    // Create and save subitems if provided
    if (orderData.subItems && orderData.subItems.length > 0) {
      const subItems = orderData.subItems.map(item => 
        SubItem.create({
          title: item.title,
          amount: item.amount,
          type: item.type as any,
          orderId: savedOrder.id,
        })
      );

      savedOrder.subItems = await this.subItemRepository.save(subItems);
    }

    return savedOrder;
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.findById(id, false);
    if (!order) {
      return null;
    }

    order.updateStatus(status);
    return await this.orderRepository.save(order);
  }

  /**
   * Update order details
   */
  async update(id: string, updateData: {
    title?: string;
    latitude?: number;
    longitude?: number;
    status?: OrderStatus;
  }): Promise<Order | null> {
    const order = await this.findById(id, false);
    if (!order) {
      return null;
    }

    // Update fields
    if (updateData.title !== undefined) order.title = updateData.title;
    if (updateData.latitude !== undefined) order.latitude = updateData.latitude;
    if (updateData.longitude !== undefined) order.longitude = updateData.longitude;
    if (updateData.status !== undefined) order.updateStatus(updateData.status);

    return await this.orderRepository.save(order);
  }

  /**
   * Delete order and all its subitems
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.orderRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Find orders by status
   */
  async findByStatus(status: OrderStatus, limit: number = 50, offset: number = 0): Promise<Order[]> {
    return await this.findAll({ status, limit, offset });
  }

  /**
   * Find orders within a geographic area
   */
  async findByLocation(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Order[]> {
    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.latitude BETWEEN :minLat AND :maxLat', { minLat, maxLat })
      .andWhere('order.longitude BETWEEN :minLng AND :maxLng', { minLng, maxLng })
      .orderBy('order.orderTime', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  /**
   * Get orders count by status
   */
  async getCountByStatus(): Promise<Array<{ status: string; count: number }>> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .orderBy('order.status', 'ASC')
      .getRawMany();

    return result.map(row => ({
      status: row.status,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * Get orders with subitems by order IDs
   */
  async findByIds(ids: string[], includeSubItems: boolean = true): Promise<Order[]> {
    const findOptions: FindManyOptions<Order> = {
      where: { id: In(ids) } as FindOptionsWhere<Order>,
      order: { orderTime: 'DESC' },
    };

    if (includeSubItems) {
      findOptions.relations = ['subItems'];
    }

    return await this.orderRepository.find(findOptions);
  }

  /**
   * Get active orders (not delivered)
   */
  async findActive(limit: number = 50, offset: number = 0): Promise<Order[]> {
    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.status != :status', { status: 'Delivered' })
      .orderBy('order.orderTime', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  /**
   * Get orders by date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 50,
    offset: number = 0
  ): Promise<Order[]> {
    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.orderTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('order.orderTime', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  /**
   * Get order statistics
   */
  async getStatistics(): Promise<{
    totalOrders: number;
    activeOrders: number;
    deliveredOrders: number;
    averageOrderTime: number;
  }> {
    const totalOrders = await this.orderRepository.count();
    const activeOrders = await this.orderRepository.count({ where: { status: In(['Received', 'Preparing', 'Ready', 'En-Route']) } as FindOptionsWhere<Order> });
    const deliveredOrders = await this.orderRepository.count({ where: { status: 'Delivered' } as FindOptionsWhere<Order> });

    // Calculate average order time (placeholder - would need more complex logic)
    const averageOrderTime = 0; // This would be calculated based on business logic

    return {
      totalOrders,
      activeOrders,
      deliveredOrders,
      averageOrderTime,
    };
  }
}
