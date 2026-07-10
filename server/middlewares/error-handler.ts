import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/app-error';
import { errorResponse } from '../shared/utils/response';
import { env } from '../config/env';
import { logger } from './request-logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn(
      {
        err,
        requestId: req.id,
        code: err.code,
        statusCode: err.statusCode,
      },
      err.message,
    );

    res.status(err.statusCode).json(errorResponse(err.code, err.message, err.details));
    return;
  }

  logger.error(
    {
      err,
      requestId: req.id,
    },
    'Unhandled error',
  );

  const message =
    env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';

  res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', message));
}
