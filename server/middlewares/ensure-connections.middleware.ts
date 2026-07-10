import type { NextFunction, Request, Response } from 'express';
import { connectMongo } from '../infrastructure/database/mongodb/connection';
import { connectRedis } from '../infrastructure/database/redis/connection';

let readyPromise: Promise<void> | null = null;

export async function ensureConnections(): Promise<void> {
  if (!readyPromise) {
    readyPromise = connectMongo().then(() => connectRedis());
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
