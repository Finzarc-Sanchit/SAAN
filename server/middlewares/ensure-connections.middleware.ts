import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { connectMongo } from '../infrastructure/database/mongodb/connection';
import { connectRedis } from '../infrastructure/database/redis/connection';
import { logger } from './request-logger';

let readyPromise: Promise<void> | null = null;

export async function ensureConnections(): Promise<void> {
  if (!readyPromise) {
    readyPromise = connectMongo().then(async () => {
      try {
        await connectRedis();
      } catch (error) {
        if (env.NODE_ENV === 'development') {
          logger.warn({ err: error }, 'Redis unavailable in development — continuing without cache');
          return;
        }

        throw error;
      }
    });
  }

  await readyPromise;
}

export function ensureConnectionsMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  void ensureConnections().then(() => next()).catch(next);
}

export function resetConnectionsForTests(): void {
  readyPromise = null;
}
