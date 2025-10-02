// Health controller
// This file handles health check endpoints

import { Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm.config';
import { getConfigSummary } from '../utils/config.util';
import { config } from '../config/environment';

export class HealthController {
  /**
   * GET /health - Basic health check
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const response = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.server.nodeEnv,
        version: '1.0.0',
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  }

  /**
   * GET /health/detailed - Detailed health check
   */
  static async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      const dbStatus = await HealthController.checkDatabaseHealth();
      
      // Get system information
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
        uptime: process.uptime(),
        pid: process.pid,
      };

      // Get configuration summary
      const configSummary = getConfigSummary();

      const response = {
        status: dbStatus.healthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus,
          server: {
            status: 'healthy',
            port: config.server.port,
            host: config.server.host,
          },
        },
        system: systemInfo,
        configuration: configSummary,
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Detailed health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /health/database - Database health check
   */
  static async databaseHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      const dbStatus = await HealthController.checkDatabaseHealth();
      
      const response = {
        status: dbStatus.healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: dbStatus,
      };

      res.status(dbStatus.healthy ? 200 : 503).json(response);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          healthy: false,
          error: error instanceof Error ? error.message : 'Database connection failed',
        },
      });
    }
  }

  /**
   * GET /health/ready - Readiness probe
   */
  static async readinessCheck(req: Request, res: Response): Promise<void> {
    try {
      // Check if the application is ready to serve requests
      const dbStatus = await HealthController.checkDatabaseHealth();
      
      if (!dbStatus.healthy) {
        res.status(503).json({
          status: 'not ready',
          timestamp: new Date().toISOString(),
          reason: 'Database not available',
        });
        return;
      }

      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus,
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'Readiness check failed',
      });
    }
  }

  /**
   * GET /health/live - Liveness probe
   */
  static async livenessCheck(req: Request, res: Response): Promise<void> {
    try {
      // Simple liveness check - just verify the process is running
      res.json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        pid: process.pid,
      });
    } catch (error) {
      res.status(500).json({
        status: 'dead',
        timestamp: new Date().toISOString(),
        error: 'Liveness check failed',
      });
    }
  }

  /**
   * Check database health
   */
  private static async checkDatabaseHealth(): Promise<{
    healthy: boolean;
    message?: string;
    details?: any;
  }> {
    try {
      if (!AppDataSource.isInitialized) {
        return {
          healthy: false,
          message: 'Database not initialized',
        };
      }

      // Test database connection
      await AppDataSource.query('SELECT 1');
      
      // Get database statistics
      const entityCount = AppDataSource.entityMetadatas.length;
      const repositoryCount = AppDataSource.entityMetadatas.length;

      return {
        healthy: true,
        message: 'Database connection healthy',
        details: {
          initialized: AppDataSource.isInitialized,
          entityCount,
          repositoryCount,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'Database connection failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
