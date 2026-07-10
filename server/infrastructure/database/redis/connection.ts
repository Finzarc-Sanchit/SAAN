import Redis, { type RedisOptions } from 'ioredis';
import { env } from '../../../config/env';
import { logger } from '../../../middlewares/request-logger';

let redisClient: Redis | null = null;

function resolveRedisConfig(): { url: string; options: RedisOptions } {
  let url = env.REDIS_URL;
  const isUpstash = url.includes('.upstash.io');
  const usesTls = url.startsWith('rediss://') || isUpstash;

  if (isUpstash && url.startsWith('redis://')) {
    url = url.replace('redis://', 'rediss://');
  }

  return {
    url,
    options: {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      ...(usesTls ? { tls: {} } : {}),
    },
  };
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    const { url, options } = resolveRedisConfig();
    redisClient = new Redis(url, options);

    redisClient.on('error', (error: Error) => {
      logger.error({ err: error }, 'Redis connection error');
    });
  }

  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();

  if (client.status === 'ready') {
    return;
  }

  try {
    await client.connect();
    logger.info('Redis connected');
  } catch (error) {
    logger.error(
      { err: error },
      'Redis connection failed — Upstash requires rediss:// (TLS); local Redis uses redis://',
    );
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient) {
    return;
  }

  await redisClient.quit();
  redisClient = null;
  logger.info('Redis disconnected');
}

export function isRedisConnected(): boolean {
  return redisClient?.status === 'ready';
}
