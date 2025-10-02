// Database module exports
// This file provides a clean interface for all database operations

// Connection management
export {
  initializeDatabase,
  getDatabaseClient,
  executeQuery,
  executeTransaction,
  testConnection,
  getPoolStats,
  checkDatabaseHealth,
  closeDatabase,
  gracefulShutdown,
} from './connection';

// Database service layer
export { DatabaseService } from './database.service';

// Health monitoring
export { HealthService } from './health.service';
export type { HealthStatus } from './health.service';

// Database setup utilities
export { DatabaseSetup, setupDatabase } from './setup';

// Schema and migrations (SQL files are not TypeScript modules)
// export * from './schema';
// export * from './migrations/001_initial_schema';
// export * from './seed';

// Re-export types for convenience
export type { Order, OrderStatus, CreateOrderRequest, UpdateOrderRequest } from '../types/Order';
export type { SubItem, SubItemType, CreateSubItemRequest } from '../types/SubItem';
