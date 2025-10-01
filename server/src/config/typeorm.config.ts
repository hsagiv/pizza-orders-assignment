// TypeORM configuration for the pizza order management system
// This file configures TypeORM with our entities and database settings

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './environment';
import { Order } from '@/models/Order.entity';
import { SubItem } from '@/models/SubItem.entity';

// TypeORM configuration options
export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  
  // Entity configuration
  entities: [Order, SubItem],
  
  // Migration configuration
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
  
  // Synchronization (only for development)
  synchronize: config.isDevelopment,
  logging: config.isDevelopment,
  
  // Connection pool settings
  extra: {
    max: config.database.pool.max,
    min: config.database.pool.min,
    idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
    acquireTimeoutMillis: config.database.pool.acquireTimeoutMillis,
  },
  
  // SSL configuration for production
  ssl: config.isProduction ? { rejectUnauthorized: false } : false,
  
  // Cache configuration
  cache: {
    type: 'redis',
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    duration: 30000, // 30 seconds
  },
  
  // Query optimization
  maxQueryExecutionTime: 1000, // Log slow queries (1 second)
  
  // Naming strategy
  // Use default naming strategy
};

// Create DataSource instance
export const AppDataSource = new DataSource(typeOrmConfig);

// Initialize TypeORM connection
export async function initializeTypeORM(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ TypeORM DataSource initialized successfully');
      
      // Log entity information
      console.log(`📊 Loaded entities: ${AppDataSource.entityMetadatas.length}`);
      console.log(`🗃️  DataSource initialized successfully`);
      
      return AppDataSource;
    } else {
      console.log('✅ TypeORM DataSource already initialized');
      return AppDataSource;
    }
  } catch (error) {
    console.error('❌ TypeORM initialization failed:', error);
    throw error;
  }
}

// Close TypeORM connection
export async function closeTypeORM(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ TypeORM DataSource closed successfully');
    }
  } catch (error) {
    console.error('❌ Error closing TypeORM DataSource:', error);
    throw error;
  }
}

// Get repository for an entity
export function getRepository<T>(entity: new () => T) {
  if (!AppDataSource.isInitialized) {
    throw new Error('TypeORM DataSource not initialized');
  }
  return AppDataSource.getRepository(entity);
}

// Get manager for custom queries
export function getManager() {
  if (!AppDataSource.isInitialized) {
    throw new Error('TypeORM DataSource not initialized');
  }
  return AppDataSource.manager;
}

// Health check for TypeORM
export async function checkTypeORMHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  isInitialized: boolean;
  entityCount: number;
  repositoryCount: number;
}> {
  try {
    const isInitialized = AppDataSource.isInitialized;
    const entityCount = AppDataSource.entityMetadatas.length;
    const repositoryCount = AppDataSource.entityMetadatas.length;
    
    return {
      status: isInitialized ? 'healthy' : 'unhealthy',
      isInitialized,
      entityCount,
      repositoryCount,
    };
  } catch (error) {
    console.error('❌ TypeORM health check failed:', error);
    return {
      status: 'unhealthy',
      isInitialized: false,
      entityCount: 0,
      repositoryCount: 0,
    };
  }
}
