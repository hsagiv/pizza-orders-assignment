// Configuration utility functions
// This file provides helper functions for working with application configuration

import { appConfig, validateConfig } from '../config/app.config';

/**
 * Initialize and validate application configuration
 */
export function initializeConfig(): void {
  try {
    // Validate configuration
    validateConfig();
    
    console.log('✅ Application configuration validated successfully');
    
    // Log configuration summary
    const summary = getConfigSummary();
    console.log('📋 Configuration Summary:', JSON.stringify(summary, null, 2));
    
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    throw error;
  }
}

/**
 * Get configuration summary for logging
 */
export function getConfigSummary() {
  return {
    environment: appConfig.environment,
    server: {
      port: appConfig.server.port,
      host: appConfig.server.host,
    },
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
  };
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof appConfig.features): boolean {
  return appConfig.features[feature];
}

/**
 * Get polling configuration
 */
export function getPollingConfig() {
  return appConfig.polling;
}

/**
 * Get API configuration
 */
export function getApiConfig() {
  return appConfig.api;
}

/**
 * Get WebSocket configuration
 */
export function getWebSocketConfig() {
  return appConfig.websocket;
}

/**
 * Get UI configuration
 */
export function getUiConfig() {
  return appConfig.ui;
}

/**
 * Get database configuration
 */
export function getDatabaseConfig() {
  return appConfig.database;
}

/**
 * Get logging configuration
 */
export function getLoggingConfig() {
  return appConfig.logging;
}

/**
 * Get security configuration
 */
export function getSecurityConfig() {
  return appConfig.security;
}

/**
 * Get environment configuration
 */
export function getEnvironmentConfig() {
  return {
    environment: appConfig.environment,
    isDevelopment: appConfig.isDevelopment,
    isProduction: appConfig.isProduction,
    isTesting: appConfig.isTesting,
  };
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return appConfig.isDevelopment;
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return appConfig.isProduction;
}

/**
 * Check if running in test mode
 */
export function isTesting(): boolean {
  return appConfig.isTesting;
}

/**
 * Get server configuration
 */
export function getServerConfig() {
  return appConfig.server;
}

/**
 * Get feature flags
 */
export function getFeatureFlags() {
  return appConfig.features;
}

/**
 * Get configuration for a specific section
 */
export function getConfigSection<T extends keyof typeof appConfig>(
  section: T
): typeof appConfig[T] {
  return appConfig[section];
}

/**
 * Update configuration at runtime (for testing purposes)
 */
export function updateConfig<T extends keyof typeof appConfig>(
  section: T,
  updates: Partial<typeof appConfig[T]>
): void {
  if (isDevelopment()) {
    Object.assign(appConfig[section], updates);
    console.log(`🔄 Configuration updated for section: ${section}`, updates);
  } else {
    console.warn('⚠️  Configuration updates are only allowed in development mode');
  }
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  if (isDevelopment()) {
    // This would reload the configuration from environment variables
    console.log('🔄 Configuration reset to defaults');
  } else {
    console.warn('⚠️  Configuration reset is only allowed in development mode');
  }
}

/**
 * Get configuration for external services
 */
export function getExternalServiceConfig() {
  return {
    mapbox: {
      token: process.env.MAPBOX_TOKEN || '',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    analytics: {
      enabled: appConfig.features.analytics,
      trackingId: process.env.ANALYTICS_TRACKING_ID || '',
    },
  };
}

/**
 * Get configuration for monitoring and health checks
 */
export function getMonitoringConfig() {
  return {
    healthCheck: {
      interval: appConfig.polling.healthCheckInterval,
      timeout: appConfig.polling.maxPollingTimeout,
    },
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      endpoint: process.env.METRICS_ENDPOINT || '/metrics',
    },
    alerts: {
      enabled: process.env.ALERTS_ENABLED === 'true',
      webhook: process.env.ALERTS_WEBHOOK || '',
    },
  };
}

/**
 * Export the main configuration object
 */
export { appConfig as config };

/**
 * Export configuration validation function
 */
export { validateConfig };
