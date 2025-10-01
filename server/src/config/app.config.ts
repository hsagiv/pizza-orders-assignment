// Application Configuration
// This file provides centralized configuration for the entire application

import { config } from './environment';

// Data polling configuration
export interface PollingConfig {
  // Order list polling interval (in milliseconds)
  orderListInterval: number;
  
  // Order status polling interval (in milliseconds)
  orderStatusInterval: number;
  
  // Health check polling interval (in milliseconds)
  healthCheckInterval: number;
  
  // Maximum polling timeout (in milliseconds)
  maxPollingTimeout: number;
  
  // Retry configuration
  retryAttempts: number;
  retryDelay: number;
  
  // Enable/disable polling
  enabled: boolean;
}

// API configuration
export interface ApiConfig {
  // Rate limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  
  // Pagination
  pagination: {
    defaultLimit: number;
    maxLimit: number;
    defaultOffset: number;
  };
  
  // Response settings
  response: {
    timeout: number;
    compression: boolean;
    cors: {
      origin: string | string[];
      credentials: boolean;
    };
  };
  
  // API versioning
  version: string;
  prefix: string;
}

// WebSocket configuration
export interface WebSocketConfig {
  // Connection settings
  connection: {
    timeout: number;
    pingInterval: number;
    pingTimeout: number;
  };
  
  // Room management
  rooms: {
    orderUpdates: string;
    statusUpdates: string;
    adminUpdates: string;
  };
  
  // Event settings
  events: {
    orderCreated: string;
    orderUpdated: string;
    orderStatusChanged: string;
    orderDeleted: string;
  };
  
  // Enable/disable WebSocket
  enabled: boolean;
}

// UI configuration
export interface UiConfig {
  // Display settings
  display: {
    defaultOrdersPerPage: number;
    maxOrdersPerPage: number;
    minOrdersPerPage: number;
    defaultSortBy: string;
    defaultSortOrder: 'asc' | 'desc';
  };
  
  // Map settings
  map: {
    defaultZoom: number;
    defaultCenter: {
      lat: number;
      lng: number;
    };
    maxZoom: number;
    minZoom: number;
  };
  
  // Theme settings
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    darkMode: boolean;
  };
  
  // Language settings
  language: {
    default: string;
    supported: string[];
    rtl: boolean;
  };
}

// Database configuration
export interface DatabaseConfig {
  // Connection settings
  connection: {
    maxConnections: number;
    minConnections: number;
    acquireTimeoutMillis: number;
    idleTimeoutMillis: number;
  };
  
  // Query settings
  query: {
    timeout: number;
    maxQueryExecutionTime: number;
    slowQueryThreshold: number;
  };
  
  // Caching
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  
  // Backup settings
  backup: {
    enabled: boolean;
    interval: number;
    retention: number;
  };
}

// Logging configuration
export interface LoggingConfig {
  // Log levels
  level: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  
  // Log formats
  format: 'json' | 'simple' | 'combined';
  
  // File logging
  file: {
    enabled: boolean;
    filename: string;
    maxSize: string;
    maxFiles: number;
  };
  
  // Console logging
  console: {
    enabled: boolean;
    colorize: boolean;
  };
  
  // External logging
  external: {
    enabled: boolean;
    endpoint: string;
    apiKey: string;
  };
}

// Security configuration
export interface SecurityConfig {
  // Authentication
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenExpiresIn: string;
  };
  
  // Encryption
  encryption: {
    algorithm: string;
    keyLength: number;
  };
  
  // Headers
  headers: {
    helmet: boolean;
    cors: boolean;
    rateLimit: boolean;
  };
  
  // Input validation
  validation: {
    strict: boolean;
    sanitize: boolean;
  };
}

// Main application configuration
export interface AppConfig {
  // Environment
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTesting: boolean;
  
  // Server settings
  server: {
    port: number;
    host: string;
    timeout: number;
  };
  
  // Feature flags
  features: {
    realTimeUpdates: boolean;
    mapIntegration: boolean;
    rtlSupport: boolean;
    darkMode: boolean;
    analytics: boolean;
  };
  
  // Configuration sections
  polling: PollingConfig;
  api: ApiConfig;
  websocket: WebSocketConfig;
  ui: UiConfig;
  database: DatabaseConfig;
  logging: LoggingConfig;
  security: SecurityConfig;
}

// Default configuration values
const defaultConfig: AppConfig = {
  environment: config.environment,
  isDevelopment: config.isDevelopment,
  isProduction: config.isProduction,
  isTesting: config.environment === 'test',
  
  server: {
    port: config.server.port,
    host: config.server.host,
    timeout: 30000,
  },
  
  features: {
    realTimeUpdates: true,
    mapIntegration: true,
    rtlSupport: true,
    darkMode: true,
    analytics: false,
  },
  
  polling: {
    orderListInterval: parseInt(process.env.POLLING_ORDER_LIST_INTERVAL || '5000', 10),
    orderStatusInterval: parseInt(process.env.POLLING_ORDER_STATUS_INTERVAL || '3000', 10),
    healthCheckInterval: parseInt(process.env.POLLING_HEALTH_CHECK_INTERVAL || '10000', 10),
    maxPollingTimeout: parseInt(process.env.POLLING_MAX_TIMEOUT || '30000', 10),
    retryAttempts: parseInt(process.env.POLLING_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.POLLING_RETRY_DELAY || '1000', 10),
    enabled: process.env.POLLING_ENABLED !== 'false',
  },
  
  api: {
    rateLimit: {
      windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
      maxRequests: parseInt(process.env.API_RATE_LIMIT_MAX || '100', 10),
      skipSuccessfulRequests: process.env.API_RATE_LIMIT_SKIP_SUCCESS !== 'false',
    },
    pagination: {
      defaultLimit: parseInt(process.env.API_PAGINATION_DEFAULT || '20', 10),
      maxLimit: parseInt(process.env.API_PAGINATION_MAX || '100', 10),
      defaultOffset: parseInt(process.env.API_PAGINATION_OFFSET || '0', 10),
    },
    response: {
      timeout: parseInt(process.env.API_RESPONSE_TIMEOUT || '10000', 10),
      compression: process.env.API_COMPRESSION !== 'false',
      cors: {
        origin: process.env.API_CORS_ORIGIN || '*',
        credentials: process.env.API_CORS_CREDENTIALS === 'true',
      },
    },
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
  },
  
  websocket: {
    connection: {
      timeout: parseInt(process.env.WS_CONNECTION_TIMEOUT || '5000', 10),
      pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000', 10),
      pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000', 10),
    },
    rooms: {
      orderUpdates: 'order-updates',
      statusUpdates: 'status-updates',
      adminUpdates: 'admin-updates',
    },
    events: {
      orderCreated: 'order:created',
      orderUpdated: 'order:updated',
      orderStatusChanged: 'order:status-changed',
      orderDeleted: 'order:deleted',
    },
    enabled: process.env.WEBSOCKET_ENABLED !== 'false',
  },
  
  ui: {
    display: {
      defaultOrdersPerPage: parseInt(process.env.UI_DEFAULT_ORDERS_PER_PAGE || '2', 10),
      maxOrdersPerPage: parseInt(process.env.UI_MAX_ORDERS_PER_PAGE || '4', 10),
      minOrdersPerPage: parseInt(process.env.UI_MIN_ORDERS_PER_PAGE || '1', 10),
      defaultSortBy: process.env.UI_DEFAULT_SORT_BY || 'orderTime',
      defaultSortOrder: (process.env.UI_DEFAULT_SORT_ORDER || 'desc') as 'asc' | 'desc',
    },
    map: {
      defaultZoom: parseInt(process.env.UI_MAP_DEFAULT_ZOOM || '12', 10),
      defaultCenter: {
        lat: parseFloat(process.env.UI_MAP_DEFAULT_LAT || '40.7128'),
        lng: parseFloat(process.env.UI_MAP_DEFAULT_LNG || '-74.0060'),
      },
      maxZoom: parseInt(process.env.UI_MAP_MAX_ZOOM || '18', 10),
      minZoom: parseInt(process.env.UI_MAP_MIN_ZOOM || '1', 10),
    },
    theme: {
      primaryColor: process.env.UI_THEME_PRIMARY || '#1976d2',
      secondaryColor: process.env.UI_THEME_SECONDARY || '#dc004e',
      accentColor: process.env.UI_THEME_ACCENT || '#ff4081',
      darkMode: process.env.UI_THEME_DARK_MODE === 'true',
    },
    language: {
      default: process.env.UI_LANGUAGE_DEFAULT || 'en',
      supported: (process.env.UI_LANGUAGE_SUPPORTED || 'en,he,ar').split(','),
      rtl: process.env.UI_LANGUAGE_RTL === 'true',
    },
  },
  
  database: {
    connection: {
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
      minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '5', 10),
      acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    },
    query: {
      timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10),
      maxQueryExecutionTime: parseInt(process.env.DB_MAX_QUERY_TIME || '1000', 10),
      slowQueryThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '1000', 10),
    },
    cache: {
      enabled: process.env.DB_CACHE_ENABLED === 'true',
      ttl: parseInt(process.env.DB_CACHE_TTL || '300', 10),
      maxSize: parseInt(process.env.DB_CACHE_MAX_SIZE || '1000', 10),
    },
    backup: {
      enabled: process.env.DB_BACKUP_ENABLED === 'true',
      interval: parseInt(process.env.DB_BACKUP_INTERVAL || '86400000', 10), // 24 hours
      retention: parseInt(process.env.DB_BACKUP_RETENTION || '7', 10),
    },
  },
  
  logging: {
    level: (process.env.LOG_LEVEL || 'info') as 'error' | 'warn' | 'info' | 'debug' | 'verbose',
    format: (process.env.LOG_FORMAT || 'combined') as 'json' | 'simple' | 'combined',
    file: {
      enabled: process.env.LOG_FILE_ENABLED === 'true',
      filename: process.env.LOG_FILE_FILENAME || 'logs/app.log',
      maxSize: process.env.LOG_FILE_MAX_SIZE || '10m',
      maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES || '5', 10),
    },
    console: {
      enabled: process.env.LOG_CONSOLE_ENABLED !== 'false',
      colorize: process.env.LOG_CONSOLE_COLORIZE !== 'false',
    },
    external: {
      enabled: process.env.LOG_EXTERNAL_ENABLED === 'true',
      endpoint: process.env.LOG_EXTERNAL_ENDPOINT || '',
      apiKey: process.env.LOG_EXTERNAL_API_KEY || '',
    },
  },
  
  security: {
    auth: {
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    },
    encryption: {
      algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
      keyLength: parseInt(process.env.ENCRYPTION_KEY_LENGTH || '32', 10),
    },
    headers: {
      helmet: process.env.SECURITY_HELMET !== 'false',
      cors: process.env.SECURITY_CORS !== 'false',
      rateLimit: process.env.SECURITY_RATE_LIMIT !== 'false',
    },
    validation: {
      strict: process.env.VALIDATION_STRICT !== 'false',
      sanitize: process.env.VALIDATION_SANITIZE !== 'false',
    },
  },
};

// Export the configuration
export const appConfig: AppConfig = defaultConfig;

// Configuration validation
export function validateConfig(): void {
  const errors: string[] = [];
  
  // Validate polling configuration
  if (appConfig.polling.orderListInterval < 1000) {
    errors.push('Order list polling interval must be at least 1000ms');
  }
  
  if (appConfig.polling.orderStatusInterval < 1000) {
    errors.push('Order status polling interval must be at least 1000ms');
  }
  
  // Validate API configuration
  if (appConfig.api.pagination.defaultLimit > appConfig.api.pagination.maxLimit) {
    errors.push('Default pagination limit cannot exceed maximum limit');
  }
  
  // Validate UI configuration
  if (appConfig.ui.display.defaultOrdersPerPage > appConfig.ui.display.maxOrdersPerPage) {
    errors.push('Default orders per page cannot exceed maximum');
  }
  
  if (appConfig.ui.display.defaultOrdersPerPage < appConfig.ui.display.minOrdersPerPage) {
    errors.push('Default orders per page cannot be less than minimum');
  }
  
  // Validate database configuration
  if (appConfig.database.connection.maxConnections < appConfig.database.connection.minConnections) {
    errors.push('Maximum connections cannot be less than minimum connections');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Configuration getters for easy access
export const getPollingConfig = () => appConfig.polling;
export const getApiConfig = () => appConfig.api;
export const getWebSocketConfig = () => appConfig.websocket;
export const getUiConfig = () => appConfig.ui;
export const getDatabaseConfig = () => appConfig.database;
export const getLoggingConfig = () => appConfig.logging;
export const getSecurityConfig = () => appConfig.security;

// Feature flag getters
export const isFeatureEnabled = (feature: keyof AppConfig['features']) => {
  return appConfig.features[feature];
};

// Environment-specific configuration
export const getEnvironmentConfig = () => ({
  environment: appConfig.environment,
  isDevelopment: appConfig.isDevelopment,
  isProduction: appConfig.isProduction,
  isTesting: appConfig.isTesting,
});

// Configuration summary for logging
export const getConfigSummary = () => ({
  environment: appConfig.environment,
  server: appConfig.server,
  features: appConfig.features,
  polling: {
    enabled: appConfig.polling.enabled,
    orderListInterval: appConfig.polling.orderListInterval,
    orderStatusInterval: appConfig.polling.orderStatusInterval,
  },
  api: {
    version: appConfig.api.version,
    prefix: appConfig.api.prefix,
    rateLimit: appConfig.api.rateLimit.maxRequests,
  },
  websocket: {
    enabled: appConfig.websocket.enabled,
  },
  ui: {
    defaultOrdersPerPage: appConfig.ui.display.defaultOrdersPerPage,
    maxOrdersPerPage: appConfig.ui.display.maxOrdersPerPage,
    rtl: appConfig.ui.language.rtl,
  },
});
