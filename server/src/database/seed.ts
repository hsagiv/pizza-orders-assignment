// Database seeding script using TypeORM
// This file populates the database with 300 realistic sample orders

import { AppDataSource } from '../config/typeorm.config';
import { Order } from '../models/Order.entity';
import { SubItem } from '../models/SubItem.entity';
import { OrderStatus } from '../types/Order';
import { SubItemType } from '../types/SubItem';

// Sample data for realistic pizza restaurant orders
const PIZZA_TYPES = [
  'Margherita', 'Pepperoni', 'Hawaiian', 'Supreme', 'Meat Lovers', 
  'Veggie', 'BBQ Chicken', 'Buffalo Chicken', 'Mushroom', 'Sausage'
];

const DRINK_TYPES = [
  'Coca Cola', 'Pepsi', 'Sprite', 'Water', 'Beer', 'Wine', 
  'Orange Juice', 'Apple Juice', 'Coffee', 'Tea'
];

const SALAD_TYPES = [
  'Caesar', 'Greek', 'Garden', 'Caprese', 'Chicken Caesar', 'Antipasto'
];

const DESSERT_TYPES = [
  'Tiramisu', 'Chocolate Cake', 'Ice Cream', 'Cannoli', 'Cheesecake', 'Brownie'
];

const APPETIZER_TYPES = [
  'Garlic Bread', 'Chicken Wings', 'Mozzarella Sticks', 'Bruschetta', 
  'Nachos', 'Onion Rings', 'Buffalo Wings'
];

const ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.RECEIVED, 
  OrderStatus.PREPARING, 
  OrderStatus.READY, 
  OrderStatus.EN_ROUTE, 
  OrderStatus.DELIVERED
];

// NYC area coordinates for realistic delivery locations
const NYC_LOCATIONS = [
  { lat: 40.7128, lng: -74.0060, name: 'Manhattan' },
  { lat: 40.7589, lng: -73.9851, name: 'Times Square' },
  { lat: 40.7505, lng: -73.9934, name: 'Chelsea' },
  { lat: 40.7614, lng: -73.9776, name: 'Upper East Side' },
  { lat: 40.7831, lng: -73.9712, name: 'Upper West Side' },
  { lat: 40.7282, lng: -73.7949, name: 'Queens' },
  { lat: 40.6892, lng: -73.9442, name: 'Brooklyn' },
  { lat: 40.6413, lng: -74.0776, name: 'Staten Island' },
];

// Order title templates
const ORDER_TITLES = [
  'Family Pizza Night', 'Office Lunch Order', 'Quick Dinner', 'Weekend Party',
  'Late Night Snack', 'Birthday Celebration', 'Game Night', 'Date Night',
  'Study Session', 'Movie Night', 'Sports Party', 'Holiday Gathering',
  'Team Meeting', 'Client Dinner', 'Anniversary Dinner', 'Graduation Party'
];

export class DatabaseSeeder {
  private orderRepository = AppDataSource.getRepository(Order);
  private subItemRepository = AppDataSource.getRepository(SubItem);

  /**
   * Generate random subitem data
   */
  private generateSubItem(): { title: string; amount: number; type: SubItemType } {
    const types: SubItemType[] = [
      SubItemType.PIZZA, 
      SubItemType.DRINK, 
      SubItemType.SALAD, 
      SubItemType.DESSERT, 
      SubItemType.APPETIZER
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let title: string;
    let amount: number;
    
    switch (type) {
      case 'pizza':
        title = `${PIZZA_TYPES[Math.floor(Math.random() * PIZZA_TYPES.length)]} Pizza`;
        amount = Math.floor(Math.random() * 3) + 1; // 1-3 pizzas
        break;
      case 'drink':
        title = DRINK_TYPES[Math.floor(Math.random() * DRINK_TYPES.length)] || 'Coca Cola';
        amount = Math.floor(Math.random() * 4) + 1; // 1-4 drinks
        break;
      case 'salad':
        title = `${SALAD_TYPES[Math.floor(Math.random() * SALAD_TYPES.length)]} Salad`;
        amount = Math.floor(Math.random() * 2) + 1; // 1-2 salads
        break;
      case 'dessert':
        title = DESSERT_TYPES[Math.floor(Math.random() * DESSERT_TYPES.length)] || 'Chocolate Cake';
        amount = Math.floor(Math.random() * 2) + 1; // 1-2 desserts
        break;
      case 'appetizer':
        title = APPETIZER_TYPES[Math.floor(Math.random() * APPETIZER_TYPES.length)] || 'Garlic Bread';
        amount = Math.floor(Math.random() * 3) + 1; // 1-3 appetizers
        break;
      default:
        title = 'Other Item';
        amount = 1;
    }
    
    return { title, amount, type: type as SubItemType };
  }

  /**
   * Generate random order data
   */
  private generateOrderData(): {
    title: string;
    latitude: number;
    longitude: number;
    status: OrderStatus;
    orderTime: Date;
    subItems: Array<{ title: string; amount: number; type: SubItemType }>;
  } {
    const location = NYC_LOCATIONS[Math.floor(Math.random() * NYC_LOCATIONS.length)];
    const title = ORDER_TITLES[Math.floor(Math.random() * ORDER_TITLES.length)] || 'Pizza Order';
    const status = ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)];
    
    // Generate random time within the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const orderTime = new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime()));
    
    // Add some random variation to coordinates
    const latitude = (location?.lat || 40.7128) + (Math.random() - 0.5) * 0.01;
    const longitude = (location?.lng || -74.0060) + (Math.random() - 0.5) * 0.01;
    
    // Generate 1-5 subitems per order
    const subItemCount = Math.floor(Math.random() * 5) + 1;
    const subItems = Array.from({ length: subItemCount }, () => this.generateSubItem());
    
    return {
      title: title || 'Pizza Order',
      latitude,
      longitude,
      status: status || OrderStatus.RECEIVED,
      orderTime,
      subItems,
    };
  }

  /**
   * Clear existing data
   */
  async clearDatabase(): Promise<void> {
    console.log('🧹 Clearing existing data...');
    
    // Delete in correct order (subitems first due to foreign key)
    await this.subItemRepository.delete({});
    await this.orderRepository.delete({});
    
    console.log('✅ Database cleared');
  }

  /**
   * Seed the database with sample data
   */
  async seedDatabase(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      
      // Clear existing data
      await this.clearDatabase();
      
      const orders: Order[] = [];
      const allSubItems: SubItem[] = [];
      
      // Generate 300 orders
      for (let i = 0; i < 300; i++) {
        const orderData = this.generateOrderData();
        
        // Create order entity
        const order = new Order();
        order.title = orderData.title;
        order.latitude = orderData.latitude;
        order.longitude = orderData.longitude;
        order.status = orderData.status;
        order.orderTime = orderData.orderTime;
        
        orders.push(order);
        
        // Create subitems for this order
        const subItems = orderData.subItems.map(itemData => {
          const subItem = new SubItem();
          subItem.title = itemData.title;
          subItem.amount = itemData.amount;
          subItem.type = itemData.type;
          return subItem;
        });
        
        allSubItems.push(...subItems);
      }
      
      // Save orders first
      console.log('💾 Saving orders...');
      const savedOrders = await this.orderRepository.save(orders);
      console.log(`✅ Saved ${savedOrders.length} orders`);
      
      // Assign order IDs to subitems and save them
      console.log('💾 Saving subitems...');
      let subItemIndex = 0;
      for (let i = 0; i < savedOrders.length; i++) {
        const order = savedOrders[i];
        const orderSubItemCount = orders[i]?.subItems?.length || 0;
        
        for (let j = 0; j < orderSubItemCount; j++) {
          if (allSubItems[subItemIndex] && order) {
            allSubItems[subItemIndex]!.orderId = order.id;
            subItemIndex++;
          }
        }
      }
      
      const savedSubItems = await this.subItemRepository.save(allSubItems);
      console.log(`✅ Saved ${savedSubItems.length} subitems`);
      
      // Update orders with their subitems
      for (let i = 0; i < savedOrders.length; i++) {
        const order = savedOrders[i];
        const startIndex = allSubItems.findIndex(item => item.orderId === order?.id);
        const orderSubItemCount = orders[i]?.subItems?.length || 0;
        
        if (startIndex !== -1 && order) {
          order.subItems = allSubItems.slice(startIndex, startIndex + orderSubItemCount);
        }
      }
      
      console.log('🎉 Database seeding completed successfully!');
      
      // Print statistics
      await this.printStatistics();
      
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Print seeding statistics
   */
  async printStatistics(): Promise<void> {
    try {
      const orderCount = await this.orderRepository.count();
      const subItemCount = await this.subItemRepository.count();
      
      // Count by status
      const statusCounts = await this.orderRepository
        .createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('order.status')
        .getRawMany();
      
      // Count by subitem type
      const typeCounts = await this.subItemRepository
        .createQueryBuilder('subItem')
        .select('subItem.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('subItem.type')
        .getRawMany();
      
      console.log('\n📊 Seeding Statistics:');
      console.log(`📦 Total Orders: ${orderCount}`);
      console.log(`🍕 Total SubItems: ${subItemCount}`);
      console.log(`📈 Average Items per Order: ${Math.round(subItemCount / orderCount)}`);
      
      console.log('\n📋 Orders by Status:');
      statusCounts.forEach(({ status, count }) => {
        console.log(`  ${status}: ${count}`);
      });
      
      console.log('\n🍽️  SubItems by Type:');
      typeCounts.forEach(({ type, count }) => {
        console.log(`  ${type}: ${count}`);
      });
      
    } catch (error) {
      console.error('❌ Failed to print statistics:', error);
    }
  }
}

// Main seeding function
export async function seedDatabase(): Promise<void> {
  const seeder = new DatabaseSeeder();
  await seeder.seedDatabase();
}

// Run seeding if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await AppDataSource.initialize();
      await seedDatabase();
      await AppDataSource.destroy();
      process.exit(0);
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    }
  })();
}
