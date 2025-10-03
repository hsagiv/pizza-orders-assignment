// TypeORM SubItem Entity
// This file defines the SubItem entity that maps to the sub_items table in PostgreSQL

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IsString, IsNumber, IsEnum, IsOptional, Min, Length } from 'class-validator';
import { Order } from './Order.entity';
import { SubItemType } from '../types/SubItem';

@Entity('sub_items')
@Index(['orderId']) // Index for fast order lookups
@Index(['type']) // Index for type-based filtering
export class SubItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId!: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title!: string;

  @Column({ type: 'integer' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be at least 1' })
  amount!: number;

  @Column({
    type: 'enum',
    enum: ['pizza', 'drink', 'salad', 'dessert', 'appetizer', 'other'],
    default: 'other',
  })
  @IsEnum(['pizza', 'drink', 'salad', 'dessert', 'appetizer', 'other'], {
    message: 'Type must be one of: pizza, drink, salad, dessert, appetizer, other',
  })
  type!: SubItemType;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Many-to-one relationship with Order
  @ManyToOne(() => Order, (order) => order.subItems, {
    onDelete: 'CASCADE', // Delete subitem if order is deleted
    nullable: false,
  })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  // Virtual properties for computed values
  get isPizza(): boolean {
    return this.type === 'pizza';
  }

  get isDrink(): boolean {
    return this.type === 'drink';
  }

  get isFood(): boolean {
    return ['pizza', 'salad', 'dessert', 'appetizer'].includes(this.type);
  }

  get totalPrice(): number {
    // This would be calculated based on item type and amount
    // For now, return a placeholder
    const basePrice = this.getBasePrice();
    return basePrice * this.amount;
  }

  private getBasePrice(): number {
    // Base prices for different item types (in cents)
    const prices: Record<SubItemType, number> = {
      pizza: 1500, // $15.00
      drink: 300,  // $3.00
      salad: 800, // $8.00
      dessert: 600, // $6.00
      appetizer: 700, // $7.00
      other: 500, // $5.00
    };
    return prices[this.type] || 500;
  }

  // Helper methods
  updateAmount(newAmount: number): void {
    if (newAmount < 1) {
      throw new Error('Amount must be at least 1');
    }
    this.amount = newAmount;
  }

  updateType(newType: SubItemType): void {
    this.type = newType;
  }

  // Static factory method for creating new subitems
  static create(data: {
    title: string;
    amount: number;
    type: SubItemType;
    orderId?: string;
  }): SubItem {
    const subItem = new SubItem();
    subItem.title = data.title;
    subItem.amount = data.amount;
    subItem.type = data.type;
    if (data.orderId) {
      subItem.orderId = data.orderId;
    }
    return subItem;
  }

  // Method to get subitem summary
  getSummary(): {
    id: string;
    title: string;
    amount: number;
    type: SubItemType;
    totalPrice: number;
    isFood: boolean;
  } {
    return {
      id: this.id,
      title: this.title,
      amount: this.amount,
      type: this.type,
      totalPrice: this.totalPrice,
      isFood: this.isFood,
    };
  }

  // Method to check if subitem can be modified
  canBeModified(): boolean {
    // Subitems can be modified if the order is not delivered
    return this.order?.status !== 'Delivered';
  }
}
