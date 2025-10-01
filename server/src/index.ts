// Main server entry point
// This file initializes the Express server with all middleware and routes

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/config/environment';
import { initializeTypeORM } from '@/config/typeorm.config';
import { initializeConfig } from '@/utils/config.util';
import { errorHandler } from '@/middleware/error.middleware';
import { requestLogger } from '@/middleware/logger.middleware';
import { rateLimiter } from '@/middleware/rate-limit.middleware';
import { ordersRouter } from '@/routes/orders.routes';
import { healthRouter } from '@/routes/health.routes';
import { SocketServer } from '@/websocket';

// Initialize Express app
const app = express();

// Initialize configuration
initializeConfig();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Health check endpoint (before other routes)
app.use('/health', healthRouter);

// API routes
app.use('/api', ordersRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🍕 Pizza Order Management System API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      orders: '/api/orders',
      documentation: '/api/docs',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting Pizza Order Management System...');
    
    // Initialize TypeORM
    await initializeTypeORM();
    console.log('✅ Database connection established');
    
    // Start HTTP server
    const server = app.listen(config.server.port, config.server.host, () => {
      console.log(`🌐 Server running on http://${config.server.host}:${config.server.port}`);
      console.log(`📊 Health check: http://${config.server.host}:${config.server.port}/health`);
      console.log(`📋 Orders API: http://${config.server.host}:${config.server.port}/api/orders`);
      console.log(`🔧 Environment: ${config.app.environment}`);
    });
    
    // Initialize WebSocket server
    const socketServer = new SocketServer(server);
    console.log('✅ WebSocket server initialized');
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();