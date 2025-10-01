// Environment configuration for the pizza order management system
// This file handles all environment variables with proper validation and defaults

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  url: string;
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
    acquireTimeoutMillis: number;
  };
}

// Server configuration interface
export interface ServerConfig {
  nodeEnv: string;
  port: number;
  host: string;
  apiPrefix: string;
  corsOrigin: string;
}

// WebSocket configuration interface
export interface WebSocketConfig {
  port: number;
  corsOrigin: string;
}

// Application configuration interface
export interface AppConfig {
  logLevel: string;
  logFormat: string;
  jwtSecret: string;
  bcryptRounds: number;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  polling: {
    intervalMs: number;
    maxRetries: number;
    timeoutMs: number;
  };
}

// Database configuration
export const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'pizza_orders',
  username: process.env.DB_USER || 'pizza_user',
  password: process.env.DB_PASSWORD || 'pizza_password',
  url: process.env.DB_URL || 'postgresql://pizza_user:pizza_password@localhost:5432/pizza_orders',
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
    acquireTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '60000', 10),
  },
};

// Server configuration
export const serverConfig: ServerConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || 'localhost',
  apiPrefix: process.env.API_PREFIX || '/api',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// WebSocket configuration
export const webSocketConfig: WebSocketConfig = {
  port: parseInt(process.env.WS_PORT || '3002', 10),
  corsOrigin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
};

// Application configuration
export const appConfig: AppConfig = {
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'combined',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  polling: {
    intervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '5000', 10),
    maxRetries: parseInt(process.env.MAX_POLLING_RETRIES || '3', 10),
    timeoutMs: parseInt(process.env.POLLING_TIMEOUT_MS || '10000', 10),
  },
};

// Validation function to check required environment variables
export function validateEnvironment(): void {
  const requiredVars = [
    'DB_HOST',
    'DB_PORT', 
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Using default values. Please set these variables in your .env file.');
  }
}

// Development environment check
export const isDevelopment = serverConfig.nodeEnv === 'development';
export const isProduction = serverConfig.nodeEnv === 'production';
export const isTest = serverConfig.nodeEnv === 'test';

// Export all configuration
export const config = {
  database: databaseConfig,
  server: serverConfig,
  webSocket: webSocketConfig,
  app: appConfig,
  isDevelopment,
  isProduction,
  isTest,
};
