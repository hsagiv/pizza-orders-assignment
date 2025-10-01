// Rate limiting middleware
// This file provides rate limiting functionality

import { Request, Response, NextFunction } from 'express';
import { getApiConfig } from '@/config/app.config';

// Simple in-memory rate limiter
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private windowMs: number;
  private maxRequests: number;
  private skipSuccessfulRequests: boolean;

  constructor(windowMs: number, maxRequests: number, skipSuccessfulRequests: boolean = false) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.skipSuccessfulRequests = skipSuccessfulRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired record
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return this.maxRequests;
    return Math.max(0, this.maxRequests - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    return record ? record.resetTime : Date.now() + this.windowMs;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Get client identifier
function getClientIdentifier(req: Request): string {
  // Use IP address as identifier
  return req.ip || req.connection.remoteAddress || 'unknown';
}

// Rate limiter instance
const rateLimiterInstance = new RateLimiter(
  getApiConfig().rateLimit.windowMs,
  getApiConfig().rateLimit.maxRequests,
  getApiConfig().rateLimit.skipSuccessfulRequests
);

// Cleanup expired records every 5 minutes
setInterval(() => {
  rateLimiterInstance.cleanup();
}, 5 * 60 * 1000);

// Rate limiting middleware
export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const identifier = getClientIdentifier(req);
  
  if (!rateLimiterInstance.isAllowed(identifier)) {
    const remainingRequests = rateLimiterInstance.getRemainingRequests(identifier);
    const resetTime = rateLimiterInstance.getResetTime(identifier);
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    
    res.set({
      'X-RateLimit-Limit': getApiConfig().rateLimit.maxRequests.toString(),
      'X-RateLimit-Remaining': remainingRequests.toString(),
      'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      'Retry-After': retryAfter.toString(),
    });
    
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
      retryAfter,
    });
    return;
  }
  
  // Add rate limit headers to response
  const remainingRequests = rateLimiterInstance.getRemainingRequests(identifier);
  const resetTime = rateLimiterInstance.getResetTime(identifier);
  
  res.set({
    'X-RateLimit-Limit': getApiConfig().rateLimit.maxRequests.toString(),
    'X-RateLimit-Remaining': remainingRequests.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  });
  
  next();
}

// Strict rate limiter for sensitive endpoints
export function strictRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const strictLimiter = new RateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 requests
    false
  );
  
  const identifier = getClientIdentifier(req);
  
  if (!strictLimiter.isAllowed(identifier)) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Strict rate limit exceeded. Please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
      retryAfter: 900, // 15 minutes
    });
    return;
  }
  
  next();
}

// API rate limiter
export function apiRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const apiLimiter = new RateLimiter(
    60 * 1000, // 1 minute
    60, // 60 requests per minute
    true
  );
  
  const identifier = getClientIdentifier(req);
  
  if (!apiLimiter.isAllowed(identifier)) {
    res.status(429).json({
      error: 'API Rate Limit Exceeded',
      message: 'API rate limit exceeded. Please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
      retryAfter: 60,
    });
    return;
  }
  
  next();
}
