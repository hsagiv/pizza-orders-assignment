// Database connection management for PostgreSQL
// This file handles connection pooling, health checks, and error handling

import { Pool, PoolClient, PoolConfig } from 'pg';
import { databaseConfig } from '@/config/environment';

// Database connection pool instance
let pool: Pool | null = null;

// Connection pool configuration
const poolConfig: PoolConfig = {
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
  user: databaseConfig.username,
  password: databaseConfig.password,
  // Connection pool settings
  min: databaseConfig.pool.min,
  max: databaseConfig.pool.max,
  idleTimeoutMillis: databaseConfig.pool.idleTimeoutMillis,
  acquireTimeoutMillis: databaseConfig.pool.acquireTimeoutMillis,
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection timeout
  connectionTimeoutMillis: 10000,
  // Query timeout
  query_timeout: 30000,
};

/**
 * Initialize the database connection pool
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔄 Initializing database connection...');
    
    // Create new pool if it doesn't exist
    if (!pool) {
      pool = new Pool(poolConfig);
      
      // Handle pool errors
      pool.on('error', (err) => {
        console.error('❌ Database pool error:', err);
        // Don't exit the process, just log the error
      });
      
      // Handle pool connect events
      pool.on('connect', () => {
        console.log('✅ Database connection established');
      });
      
      // Handle pool acquire events
      pool.on('acquire', () => {
        console.log('🔗 Database connection acquired from pool');
      });
      
      // Handle pool remove events
      pool.on('remove', () => {
        console.log('🔌 Database connection removed from pool');
      });
    }
    
    // Test the connection
    await testConnection();
    console.log('✅ Database connection pool initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error);
    throw error;
  }
}

/**
 * Get a client from the connection pool
 */
export async function getDatabaseClient(): Promise<PoolClient> {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('❌ Failed to get database client:', error);
    throw error;
  }
}

/**
 * Execute a query with automatic client management
 */
export async function executeQuery<T = any>(
  query: string, 
  params?: any[]
): Promise<T[]> {
  const client = await getDatabaseClient();
  
  try {
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('❌ Query execution failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a query with a transaction
 */
export async function executeTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getDatabaseClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await executeQuery('SELECT NOW() as current_time');
    console.log('✅ Database connection test successful:', result[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

/**
 * Get database connection pool statistics
 */
export function getPoolStats() {
  if (!pool) {
    return null;
  }
  
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  connection: boolean;
  poolStats: any;
  responseTime: number;
}> {
  const startTime = Date.now();
  
  try {
    const connection = await testConnection();
    const poolStats = getPoolStats();
    const responseTime = Date.now() - startTime;
    
    return {
      status: connection ? 'healthy' : 'unhealthy',
      connection,
      poolStats,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Database health check failed:', error);
    
    return {
      status: 'unhealthy',
      connection: false,
      poolStats: null,
      responseTime,
    };
  }
}

/**
 * Close database connection pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    console.log('🔄 Closing database connection pool...');
    await pool.end();
    pool = null;
    console.log('✅ Database connection pool closed');
  }
}

/**
 * Graceful shutdown handler
 */
export async function gracefulShutdown(): Promise<void> {
  console.log('🔄 Gracefully shutting down database connections...');
  await closeDatabase();
  console.log('✅ Database shutdown complete');
}

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  gracefulShutdown().then(() => process.exit(1));
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  gracefulShutdown().then(() => process.exit(1));
});
