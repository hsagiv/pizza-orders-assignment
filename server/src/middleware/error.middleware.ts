// Error handling middleware
// This file provides centralized error handling for the Express application

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  stack?: string;
}

// Global error handler
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
    statusCode = 500;
    message = 'Database Error';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    statusCode = 400;
    message = 'Invalid JSON format';
  }

  // Log error
  console.error('❌ Error occurred:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Prepare error response
  const errorResponse: ErrorResponse = {
    error: error.name || 'Error',
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // Include stack trace in development
  if (config.isDevelopment && error.stack) {
    errorResponse.stack = error.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 handler
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}

// Validation error handler
export function validationErrorHandler(error: any, req: Request, res: Response, next: NextFunction): void {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));

    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      details: errors,
    });
  } else {
    next(error);
  }
}

// Database error handler
export function databaseErrorHandler(error: any, req: Request, res: Response, next: NextFunction): void {
  if (error.code === '23505') { // Unique constraint violation
    res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists',
      statusCode: 409,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } else if (error.code === '23503') { // Foreign key constraint violation
    res.status(400).json({
      error: 'Bad Request',
      message: 'Referenced resource does not exist',
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } else {
    next(error);
  }
}
