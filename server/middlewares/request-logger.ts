import type { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
});

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: Request, res: Response) => {
    const existingId = req.headers['x-request-id'];
    const requestId = typeof existingId === 'string' ? existingId : randomUUID();
    res.setHeader('x-request-id', requestId);
    return requestId;
  },
  customProps: (req: Request) => ({
    userId: req.user?.id ?? null,
  }),
  serializers: {
    req: (req: Request) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode,
    }),
  },
});

export function notFoundHandler(_req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      details: [],
    },
  });
}
