// Request logging middleware
// This file provides request logging functionality

import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/environment';

// Request logging interface
interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ip: string;
  contentLength: number;
}

// Request logger middleware
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    
    // Create log entry
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent') || 'Unknown',
      ip: req.ip || req.connection.remoteAddress || 'Unknown',
      contentLength: res.get('Content-Length') ? parseInt(res.get('Content-Length') || '0', 10) : 0,
    };
    
    // Log based on environment
    if (config.isDevelopment) {
      console.log(`📝 ${logEntry.method} ${logEntry.url} - ${logEntry.statusCode} (${logEntry.responseTime}ms)`);
    } else {
      // In production, you might want to use a proper logging library
      console.log(JSON.stringify(logEntry));
    }
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

// Error logger
export function errorLogger(error: Error, req: Request, res: Response, next: NextFunction): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress || 'Unknown',
    userAgent: req.get('User-Agent') || 'Unknown',
  };
  
  console.error('❌ Error logged:', logEntry);
  next(error);
}

// Performance logger
export function performanceLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests
    if (responseTime > 1000) { // More than 1 second
      console.warn(`⚠️  Slow request: ${req.method} ${req.url} - ${responseTime}ms`);
    }
  });
  
  next();
}
