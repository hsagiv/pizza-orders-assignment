// Database health monitoring service
// This file provides comprehensive health checks and monitoring for the database

import { checkDatabaseHealth, getPoolStats } from './connection';
import { DatabaseService } from './database.service';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  database: {
    connection: boolean;
    responseTime: number;
    poolStats: {
      totalCount: number;
      idleCount: number;
      waitingCount: number;
    } | null;
  };
  services: {
    databaseService: boolean;
    queryExecution: boolean;
  };
  metrics: {
    uptime: number;
    lastCheck: string;
    checkCount: number;
  };
}

export class HealthService {
  private static startTime = Date.now();
  private static checkCount = 0;
  private static lastCheck = new Date().toISOString();

  /**
   * Perform comprehensive health check
   */
  static async performHealthCheck(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    this.checkCount++;
    this.lastCheck = timestamp;

    try {
      // Check database connection
      const dbHealth = await checkDatabaseHealth();
      
      // Test database service
      let databaseServiceHealthy = false;
      let queryExecutionHealthy = false;
      
      try {
        // Test basic query execution
        await DatabaseService.getOrdersCountByStatus();
        queryExecutionHealthy = true;
        databaseServiceHealthy = true;
      } catch (error) {
        console.error('❌ Database service health check failed:', error);
      }

      // Determine overall status
      let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      
      if (!dbHealth.connection || !databaseServiceHealthy || !queryExecutionHealthy) {
        overallStatus = 'unhealthy';
      } else if (dbHealth.responseTime > 1000 || (dbHealth.poolStats?.waitingCount || 0) > 5) {
        overallStatus = 'degraded';
      }

      const healthStatus: HealthStatus = {
        status: overallStatus,
        timestamp,
        database: {
          connection: dbHealth.connection,
          responseTime: dbHealth.responseTime,
          poolStats: dbHealth.poolStats,
        },
        services: {
          databaseService: databaseServiceHealthy,
          queryExecution: queryExecutionHealthy,
        },
        metrics: {
          uptime: Date.now() - this.startTime,
          lastCheck: this.lastCheck,
          checkCount: this.checkCount,
        },
      };

      return healthStatus;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      
      return {
        status: 'unhealthy',
        timestamp,
        database: {
          connection: false,
          responseTime: 0,
          poolStats: null,
        },
        services: {
          databaseService: false,
          queryExecution: false,
        },
        metrics: {
          uptime: Date.now() - this.startTime,
          lastCheck: this.lastCheck,
          checkCount: this.checkCount,
        },
      };
    }
  }

  /**
   * Get database pool statistics
   */
  static getPoolStatistics() {
    const poolStats = getPoolStats();
    
    if (!poolStats) {
      return {
        status: 'unavailable',
        message: 'Database pool not initialized',
      };
    }

    return {
      status: 'available',
      totalConnections: poolStats.totalCount,
      idleConnections: poolStats.idleCount,
      waitingClients: poolStats.waitingCount,
      utilizationPercentage: Math.round((poolStats.totalCount - poolStats.idleCount) / poolStats.totalCount * 100),
    };
  }

  /**
   * Get system metrics
   */
  static getSystemMetrics() {
    return {
      uptime: Date.now() - this.startTime,
      uptimeFormatted: this.formatUptime(Date.now() - this.startTime),
      checkCount: this.checkCount,
      lastCheck: this.lastCheck,
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    };
  }

  /**
   * Format uptime in human-readable format
   */
  private static formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Check if database is ready for operations
   */
  static async isReady(): Promise<boolean> {
    try {
      const health = await this.performHealthCheck();
      return health.status === 'healthy' || health.status === 'degraded';
    } catch (error) {
      console.error('❌ Database readiness check failed:', error);
      return false;
    }
  }

  /**
   * Get detailed health report
   */
  static async getDetailedHealthReport(): Promise<{
    health: HealthStatus;
    poolStats: any;
    systemMetrics: any;
  }> {
    const health = await this.performHealthCheck();
    const poolStats = this.getPoolStatistics();
    const systemMetrics = this.getSystemMetrics();

    return {
      health,
      poolStats,
      systemMetrics,
    };
  }
}
