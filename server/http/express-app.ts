import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '../config/env';
import { authRoutes } from '../modules/auth/auth.routes';
import { errorHandler } from '../middlewares/error-handler';
import { ensureConnectionsMiddleware } from '../middlewares/ensure-connections.middleware';
import { globalRateLimiter } from '../middlewares/rate-limit.middleware';
import { notFoundHandler, requestLogger } from '../middlewares/request-logger';
import { isMongoConnected } from '../infrastructure/database/mongodb/connection';
import { isRedisConnected } from '../infrastructure/database/redis/connection';
import { successResponse } from '../shared/utils/response';

export function createApp(): express.Application {
  const app = express();

  app.set('trust proxy', 1);
  app.use(ensureConnectionsMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Server-to-server requests (e.g. Next.js rewrite proxy) carry no Origin header.
        if (!origin) {
          callback(null, true);
          return;
        }

        if (env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(globalRateLimiter);
  app.use(requestLogger);

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json(successResponse({ status: 'ok' }));
  });

  app.get('/ready', (_req: Request, res: Response) => {
    const mongoReady = isMongoConnected();
    const redisReady = isRedisConnected();

    if (!mongoReady || !redisReady) {
      res.status(503).json(
        successResponse({
          status: 'not_ready',
          mongo: mongoReady,
          redis: redisReady,
        }),
      );
      return;
    }

    res.status(200).json(
      successResponse({
        status: 'ready',
        mongo: true,
        redis: true,
      }),
    );
  });

  app.use('/api/v1/auth', authRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
