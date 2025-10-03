// TypeORM Order Entity
// This file defines the Order entity that maps to the orders table in PostgreSQL

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { IsString, IsNumber, IsEnum, IsOptional, Min, Max, Length } from 'class-validator';
import { SubItem } from './SubItem.entity';
import { OrderStatus } from '../types/Order';

@Entity('orders')
@Index(['status']) // Index for fast status filtering
@Index(['orderTime']) // Index for time-based sorting
@Index(['latitude', 'longitude']) // Composite index for location queries
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude!: number;

  @Column({ type: 'timestamp with time zone', default: () => 'NOW()', name: 'order_time' })
  @IsOptional()
  orderTime!: Date;

  @Column({
    type: 'enum',
    enum: ['Received', 'Preparing', 'Ready', 'En-Route', 'Delivered'],
    default: 'Received',
  })
  @IsEnum(['Received', 'Preparing', 'Ready', 'En-Route', 'Delivered'], {
    message: 'Status must be one of: Received, Preparing, Ready, En-Route, Delivered',
  })
  status!: OrderStatus;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // One-to-many relationship with SubItem (temporarily disabled)
  // @OneToMany(() => SubItem, (subItem) => subItem.order, {
  //   cascade: true, // Automatically save/update/delete subitems when order is saved
  //   eager: false, // Don't automatically load subitems (use relations when needed)
  // })
  subItems?: any[]; // Temporarily disabled relation

  // Virtual properties for computed values
  get location(): { latitude: number; longitude: number } {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }

  get isActive(): boolean {
    return this.status !== 'Delivered';
  }

  get canBeUpdated(): boolean {
    return this.status !== 'Delivered';
  }

  // Helper methods
  updateStatus(newStatus: OrderStatus): void {
    if (this.canBeUpdated) {
      this.status = newStatus;
    } else {
      throw new Error('Cannot update status of delivered order');
    }
  }

  addSubItem(subItem: Partial<SubItem>): void {
    if (!this.subItems) {
      this.subItems = [];
    }
    // The actual SubItem creation will be handled by TypeORM
    // This is just a helper method for the entity
  }

  // Static factory method for creating new orders
  static create(data: {
    title: string;
    latitude: number;
    longitude: number;
    status?: OrderStatus;
    subItems?: Partial<SubItem>[];
  }): Order {
    const order = new Order();
    order.title = data.title;
    order.latitude = data.latitude;
    order.longitude = data.longitude;
    order.status = data.status || OrderStatus.RECEIVED;
    order.orderTime = new Date();
    
    if (data.subItems) {
      order.subItems = data.subItems.map(item => {
        const subItem = new SubItem();
        Object.assign(subItem, item);
        return subItem;
      });
    }
    
    return order;
  }

  // Method to get order summary
  getSummary(): {
    id: string;
    title: string;
    status: OrderStatus;
    itemCount: number;
    location: { latitude: number; longitude: number };
    orderTime: Date;
  } {
    return {
      id: this.id,
      title: this.title,
      status: this.status,
      itemCount: this.subItems?.length || 0,
      location: this.location,
      orderTime: this.orderTime,
    };
  }
}
