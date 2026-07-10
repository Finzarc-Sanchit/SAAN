import { createServer } from 'http';
import { createApp } from './http/express-app';
import { ensureConnections } from './middlewares/ensure-connections.middleware';
import { env } from './config/env';
import { disconnectMongo } from './infrastructure/database/mongodb/connection';
import { disconnectRedis } from './infrastructure/database/redis/connection';
import { logger } from './middlewares/request-logger';

async function bootstrap(): Promise<void> {
  await ensureConnections();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'SAAN server started');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully');

    server.close(async () => {
      try {
        await disconnectMongo();
        await disconnectRedis();
        logger.info('Shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error({ err: error }, 'Error during shutdown');
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
}

bootstrap().catch((error: unknown) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
