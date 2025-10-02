// SubItem Repository using TypeORM
// This file provides high-level database operations for SubItem entities

import { Repository, FindOptionsWhere, FindManyOptions, In } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { SubItem } from '../models/SubItem.entity';
import { SubItemType } from '../types/SubItem';
import { getRepository } from '../config/typeorm.config';

export class SubItemRepository {
  private subItemRepository: Repository<SubItem>;

  constructor() {
    this.subItemRepository = AppDataSource.getRepository(SubItem);
  }

  /**
   * Find all subitems with optional filtering
   */
  async findAll(options: {
    orderId?: string;
    type?: SubItemType;
    limit?: number;
    offset?: number;
  } = {}): Promise<SubItem[]> {
    const {
      orderId,
      type,
      limit = 100,
      offset = 0,
    } = options;

    const findOptions: FindManyOptions<SubItem> = {
      take: limit,
      skip: offset,
      order: { createdAt: 'ASC' },
    };

    const whereConditions: FindOptionsWhere<SubItem> = {};
    if (orderId) whereConditions.orderId = orderId;
    if (type) whereConditions.type = type;

    if (Object.keys(whereConditions).length > 0) {
      findOptions.where = whereConditions;
    }

    return await this.subItemRepository.find(findOptions);
  }

  /**
   * Find subitem by ID
   */
  async findById(id: string): Promise<SubItem | null> {
    return await this.subItemRepository.findOne({
      where: { id } as FindOptionsWhere<SubItem>,
      relations: ['order'],
    });
  }

  /**
   * Find subitems by order ID
   */
  async findByOrderId(orderId: string): Promise<SubItem[]> {
    return await this.subItemRepository.find({
      where: { orderId } as FindOptionsWhere<SubItem>,
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Create a new subitem
   */
  async create(subItemData: {
    title: string;
    amount: number;
    type: SubItemType;
    orderId: string;
  }): Promise<SubItem> {
    const subItem = SubItem.create({
      title: subItemData.title,
      amount: subItemData.amount,
      type: subItemData.type,
      orderId: subItemData.orderId,
    });

    return await this.subItemRepository.save(subItem);
  }

  /**
   * Update subitem
   */
  async update(id: string, updateData: {
    title?: string;
    amount?: number;
    type?: SubItemType;
  }): Promise<SubItem | null> {
    const subItem = await this.findById(id);
    if (!subItem) {
      return null;
    }

    // Update fields
    if (updateData.title !== undefined) subItem.title = updateData.title;
    if (updateData.amount !== undefined) subItem.updateAmount(updateData.amount);
    if (updateData.type !== undefined) subItem.updateType(updateData.type);

    return await this.subItemRepository.save(subItem);
  }

  /**
   * Delete subitem
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.subItemRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  /**
   * Find subitems by type
   */
  async findByType(type: SubItemType, limit: number = 100, offset: number = 0): Promise<SubItem[]> {
    return await this.findAll({ type, limit, offset });
  }

  /**
   * Find subitems by multiple order IDs
   */
  async findByOrderIds(orderIds: string[]): Promise<SubItem[]> {
    return await this.subItemRepository.find({
      where: { orderId: In(orderIds) } as FindOptionsWhere<SubItem>,
      order: { orderId: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * Get subitems count by type
   */
  async getCountByType(): Promise<Array<{ type: string; count: number }>> {
    const result = await this.subItemRepository
      .createQueryBuilder('subItem')
      .select('subItem.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('subItem.type')
      .orderBy('subItem.type', 'ASC')
      .getRawMany();

    return result.map(row => ({
      type: row.type,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * Get subitems count by order
   */
  async getCountByOrder(): Promise<Array<{ orderId: string; count: number }>> {
    const result = await this.subItemRepository
      .createQueryBuilder('subItem')
      .select('subItem.orderId', 'orderId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('subItem.orderId')
      .orderBy('count', 'DESC')
      .getRawMany();

    return result.map(row => ({
      orderId: row.orderId,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * Get most popular subitems
   */
  async getMostPopular(limit: number = 10): Promise<Array<{ title: string; totalAmount: number; orderCount: number }>> {
    const result = await this.subItemRepository
      .createQueryBuilder('subItem')
      .select('subItem.title', 'title')
      .addSelect('SUM(subItem.amount)', 'totalAmount')
      .addSelect('COUNT(DISTINCT subItem.orderId)', 'orderCount')
      .groupBy('subItem.title')
      .orderBy('totalAmount', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(row => ({
      title: row.title,
      totalAmount: parseInt(row.totalAmount, 10),
      orderCount: parseInt(row.orderCount, 10),
    }));
  }

  /**
   * Get subitems by date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 100,
    offset: number = 0
  ): Promise<SubItem[]> {
    return await this.subItemRepository
      .createQueryBuilder('subItem')
      .leftJoinAndSelect('subItem.order', 'order')
      .where('subItem.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('subItem.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  /**
   * Get subitem statistics
   */
  async getStatistics(): Promise<{
    totalSubItems: number;
    totalAmount: number;
    averageAmount: number;
    typeDistribution: Array<{ type: string; count: number; percentage: number }>;
  }> {
    const totalSubItems = await this.subItemRepository.count();
    const totalAmount = await this.subItemRepository
      .createQueryBuilder('subItem')
      .select('SUM(subItem.amount)', 'total')
      .getRawOne();
    
    const typeDistribution = await this.getCountByType();
    const totalCount = typeDistribution.reduce((sum, item) => sum + item.count, 0);
    
    const typeDistributionWithPercentage = typeDistribution.map(item => ({
      type: item.type,
      count: item.count,
      percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
    }));

    return {
      totalSubItems,
      totalAmount: parseInt(totalAmount.total || '0', 10),
      averageAmount: totalSubItems > 0 ? Math.round(parseInt(totalAmount.total || '0', 10) / totalSubItems) : 0,
      typeDistribution: typeDistributionWithPercentage,
    };
  }

  /**
   * Delete all subitems for an order
   */
  async deleteByOrderId(orderId: string): Promise<number> {
    const result = await this.subItemRepository.delete({ orderId });
    return result.affected || 0;
  }

  /**
   * Update subitems for an order (replace all)
   */
  async updateForOrder(orderId: string, subItems: Array<{
    title: string;
    amount: number;
    type: SubItemType;
  }>): Promise<SubItem[]> {
    // Delete existing subitems
    await this.deleteByOrderId(orderId);

    // Create new subitems
    const newSubItems = subItems.map(item => 
      SubItem.create({
        title: item.title,
        amount: item.amount,
        type: item.type,
        orderId,
      })
    );

    return await this.subItemRepository.save(newSubItems);
  }
}
