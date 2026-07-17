import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/app-error';
import { errorResponse } from '../shared/utils/response';
import { env } from '../config/env';
import { logger } from './request-logger';

function isInfrastructureConnectivityError(err: Error): boolean {
  const name = err.name || '';
  const message = err.message || '';
  const code = 'code' in err && typeof (err as { code?: unknown }).code === 'string'
    ? (err as { code: string }).code
    : '';

  return (
    name === 'MongoServerSelectionError' ||
    name === 'MongoNetworkError' ||
    name === 'MongoNetworkTimeoutError' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    /redis connection/i.test(message) ||
    /getaddrinfo ENOTFOUND/i.test(message) ||
    /connect ETIMEDOUT/i.test(message)
  );
}

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

  if (isInfrastructureConnectivityError(err)) {
    logger.error(
      {
        err,
        requestId: req.id,
      },
      'Infrastructure connectivity error',
    );

    res.status(503).json(
      errorResponse(
        'SERVICE_UNAVAILABLE',
        'Checkout is temporarily unavailable. Please try again in a moment.',
      ),
    );
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
