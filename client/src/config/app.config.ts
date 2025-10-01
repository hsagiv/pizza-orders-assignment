// Frontend Application Configuration
// This file provides centralized configuration for the React frontend

// API configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// WebSocket configuration
export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
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
    autoRefresh: boolean;
    refreshInterval: number;
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
    mapboxToken: string;
  };
  
  // Theme settings
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    darkMode: boolean;
    rtl: boolean;
  };
  
  // Language settings
  language: {
    default: string;
    supported: string[];
    rtl: boolean;
  };
  
  // Animation settings
  animation: {
    duration: number;
    easing: string;
    enabled: boolean;
  };
}

// Redux configuration
export interface ReduxConfig {
  // DevTools
  devTools: boolean;
  
  // Middleware
  middleware: {
    thunk: boolean;
    logger: boolean;
  };
  
  // Persistence
  persistence: {
    enabled: boolean;
    key: string;
    whitelist: string[];
  };
}

// Feature flags
export interface FeatureFlags {
  realTimeUpdates: boolean;
  mapIntegration: boolean;
  rtlSupport: boolean;
  darkMode: boolean;
  analytics: boolean;
  offlineSupport: boolean;
  pushNotifications: boolean;
}

// Main frontend configuration
export interface FrontendConfig {
  // Environment
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
  
  // Configuration sections
  api: ApiConfig;
  websocket: WebSocketConfig;
  ui: UiConfig;
  redux: ReduxConfig;
  features: FeatureFlags;
}

// Default configuration values
const defaultConfig: FrontendConfig = {
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000', 10),
    retryAttempts: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.REACT_APP_API_RETRY_DELAY || '1000', 10),
  },
  
  websocket: {
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
    reconnectAttempts: parseInt(process.env.REACT_APP_WS_RECONNECT_ATTEMPTS || '5', 10),
    reconnectDelay: parseInt(process.env.REACT_APP_WS_RECONNECT_DELAY || '3000', 10),
    heartbeatInterval: parseInt(process.env.REACT_APP_WS_HEARTBEAT_INTERVAL || '30000', 10),
  },
  
  ui: {
    display: {
      defaultOrdersPerPage: parseInt(process.env.REACT_APP_UI_DEFAULT_ORDERS_PER_PAGE || '2', 10),
      maxOrdersPerPage: parseInt(process.env.REACT_APP_UI_MAX_ORDERS_PER_PAGE || '4', 10),
      minOrdersPerPage: parseInt(process.env.REACT_APP_UI_MIN_ORDERS_PER_PAGE || '1', 10),
      defaultSortBy: process.env.REACT_APP_UI_DEFAULT_SORT_BY || 'orderTime',
      defaultSortOrder: (process.env.REACT_APP_UI_DEFAULT_SORT_ORDER || 'desc') as 'asc' | 'desc',
      autoRefresh: process.env.REACT_APP_UI_AUTO_REFRESH !== 'false',
      refreshInterval: parseInt(process.env.REACT_APP_UI_REFRESH_INTERVAL || '5000', 10),
    },
    map: {
      defaultZoom: parseInt(process.env.REACT_APP_UI_MAP_DEFAULT_ZOOM || '12', 10),
      defaultCenter: {
        lat: parseFloat(process.env.REACT_APP_UI_MAP_DEFAULT_LAT || '40.7128'),
        lng: parseFloat(process.env.REACT_APP_UI_MAP_DEFAULT_LNG || '-74.0060'),
      },
      maxZoom: parseInt(process.env.REACT_APP_UI_MAP_MAX_ZOOM || '18', 10),
      minZoom: parseInt(process.env.REACT_APP_UI_MAP_MIN_ZOOM || '1', 10),
      mapboxToken: process.env.REACT_APP_MAPBOX_TOKEN || '',
    },
    theme: {
      primaryColor: process.env.REACT_APP_UI_THEME_PRIMARY || '#1976d2',
      secondaryColor: process.env.REACT_APP_UI_THEME_SECONDARY || '#dc004e',
      accentColor: process.env.REACT_APP_UI_THEME_ACCENT || '#ff4081',
      darkMode: process.env.REACT_APP_UI_THEME_DARK_MODE === 'true',
      rtl: process.env.REACT_APP_UI_THEME_RTL === 'true',
    },
    language: {
      default: process.env.REACT_APP_UI_LANGUAGE_DEFAULT || 'en',
      supported: (process.env.REACT_APP_UI_LANGUAGE_SUPPORTED || 'en,he,ar').split(','),
      rtl: process.env.REACT_APP_UI_LANGUAGE_RTL === 'true',
    },
    animation: {
      duration: parseInt(process.env.REACT_APP_UI_ANIMATION_DURATION || '300', 10),
      easing: process.env.REACT_APP_UI_ANIMATION_EASING || 'ease-in-out',
      enabled: process.env.REACT_APP_UI_ANIMATION_ENABLED !== 'false',
    },
  },
  
  redux: {
    devTools: process.env.REACT_APP_REDUX_DEVTOOLS !== 'false',
    middleware: {
      thunk: true,
      logger: process.env.REACT_APP_REDUX_LOGGER === 'true',
    },
    persistence: {
      enabled: process.env.REACT_APP_REDUX_PERSISTENCE !== 'false',
      key: process.env.REACT_APP_REDUX_PERSISTENCE_KEY || 'pizza-order-app',
      whitelist: (process.env.REACT_APP_REDUX_PERSISTENCE_WHITELIST || 'orders,settings').split(','),
    },
  },
  
  features: {
    realTimeUpdates: process.env.REACT_APP_FEATURE_REALTIME !== 'false',
    mapIntegration: process.env.REACT_APP_FEATURE_MAP !== 'false',
    rtlSupport: process.env.REACT_APP_FEATURE_RTL !== 'false',
    darkMode: process.env.REACT_APP_FEATURE_DARK_MODE !== 'false',
    analytics: process.env.REACT_APP_FEATURE_ANALYTICS === 'true',
    offlineSupport: process.env.REACT_APP_FEATURE_OFFLINE === 'true',
    pushNotifications: process.env.REACT_APP_FEATURE_PUSH_NOTIFICATIONS === 'true',
  },
};

// Export the configuration
export const frontendConfig: FrontendConfig = defaultConfig;

// Configuration validation
export function validateFrontendConfig(): void {
  const errors: string[] = [];
  
  // Validate API configuration
  if (frontendConfig.api.timeout < 1000) {
    errors.push('API timeout must be at least 1000ms');
  }
  
  // Validate UI configuration
  if (frontendConfig.ui.display.defaultOrdersPerPage > frontendConfig.ui.display.maxOrdersPerPage) {
    errors.push('Default orders per page cannot exceed maximum');
  }
  
  if (frontendConfig.ui.display.defaultOrdersPerPage < frontendConfig.ui.display.minOrdersPerPage) {
    errors.push('Default orders per page cannot be less than minimum');
  }
  
  // Validate map configuration
  if (frontendConfig.ui.map.defaultZoom > frontendConfig.ui.map.maxZoom) {
    errors.push('Default zoom cannot exceed maximum zoom');
  }
  
  if (frontendConfig.ui.map.defaultZoom < frontendConfig.ui.map.minZoom) {
    errors.push('Default zoom cannot be less than minimum zoom');
  }
  
  if (errors.length > 0) {
    throw new Error(`Frontend configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Configuration getters for easy access
export const getApiConfig = () => frontendConfig.api;
export const getWebSocketConfig = () => frontendConfig.websocket;
export const getUiConfig = () => frontendConfig.ui;
export const getReduxConfig = () => frontendConfig.redux;
export const getFeatureFlags = () => frontendConfig.features;

// Feature flag getters
export const isFeatureEnabled = (feature: keyof FeatureFlags) => {
  return frontendConfig.features[feature];
};

// Environment-specific configuration
export const getEnvironmentConfig = () => ({
  environment: frontendConfig.environment,
  isDevelopment: frontendConfig.isDevelopment,
  isProduction: frontendConfig.isProduction,
});

// Configuration summary for logging
export const getConfigSummary = () => ({
  environment: frontendConfig.environment,
  api: {
    baseUrl: frontendConfig.api.baseUrl,
    timeout: frontendConfig.api.timeout,
  },
  websocket: {
    url: frontendConfig.websocket.url,
  },
  ui: {
    defaultOrdersPerPage: frontendConfig.ui.display.defaultOrdersPerPage,
    maxOrdersPerPage: frontendConfig.ui.display.maxOrdersPerPage,
    rtl: frontendConfig.ui.language.rtl,
    darkMode: frontendConfig.ui.theme.darkMode,
  },
  features: frontendConfig.features,
});

// Export default configuration
export default frontendConfig;
