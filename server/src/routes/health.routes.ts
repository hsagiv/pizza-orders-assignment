// Health check routes
// This file provides health monitoring endpoints

import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { HealthController } from '../controllers/Health.controller';

const router = Router();

// GET /health - Basic health check
router.get('/', asyncHandler(HealthController.healthCheck));

// GET /health/detailed - Detailed health check
router.get('/detailed', asyncHandler(HealthController.detailedHealthCheck));

// GET /health/database - Database health check
router.get('/database', asyncHandler(HealthController.databaseHealthCheck));

// GET /health/ready - Readiness probe
router.get('/ready', asyncHandler(HealthController.readinessCheck));

// GET /health/live - Liveness probe
router.get('/live', asyncHandler(HealthController.livenessCheck));

export { router as healthRouter };
