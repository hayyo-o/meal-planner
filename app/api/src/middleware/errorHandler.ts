import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const errorHandler = (
  err: AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    logger.error({ error: err.errors }, 'Validation error');
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: err.errors,
    });
  }

  const statusCode = (err as AppError).statusCode || 500;
  const code = (err as AppError).code || 'INTERNAL_ERROR';

  logger.error({ err, req: { method: req.method, url: req.url } }, 'Error handling request');

  res.status(statusCode).json({
    code,
    message: err.message,
    details: (err as AppError).details,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'Route not found',
  });
};


