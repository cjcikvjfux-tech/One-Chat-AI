import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export interface ApiError extends Error {
  status?: number;
}

export function errorHandler(err: ApiError, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  logger.error(`[${status}] ${message}`);
  res.status(status).json({ error: message, status });
}