import { getRedisClient } from './connection';

const DEFAULT_TTL_SECONDS = 60;

/**
 * Lightweight JSON cache for hot admin-dashboard reads.
 * Failures are swallowed so Redis outages never break analytics endpoints.
 */
export class RedisAnalyticsCache {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await getRedisClient().get(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    try {
      await getRedisClient().set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // ignore cache write failures
    }
  }
}
