import type { IIdempotencyStore, IdempotencyClaimResult } from '../../../shared/idempotency/idempotency-store.interface';
import { getRedisClient } from './connection';

const PENDING_MARKER = '__pending__';

function buildKey(scope: string, userId: string, idempotencyKey: string): string {
  return `idempotency:${scope}:${userId}:${idempotencyKey}`;
}

export class RedisIdempotencyStore implements IIdempotencyStore {
  async claimOrGetExisting(
    scope: string,
    userId: string,
    idempotencyKey: string,
    ttlSeconds: number,
  ): Promise<IdempotencyClaimResult> {
    const key = buildKey(scope, userId, idempotencyKey);
    const client = getRedisClient();
    const current = await client.get(key);

    if (current && current !== PENDING_MARKER) {
      return { type: 'existing', resourceId: current };
    }

    const claimed = await client.set(key, PENDING_MARKER, 'EX', ttlSeconds, 'NX');
    if (claimed) {
      return { type: 'claimed' };
    }

    return { type: 'in_progress' };
  }

  async markComplete(
    scope: string,
    userId: string,
    idempotencyKey: string,
    resourceId: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = buildKey(scope, userId, idempotencyKey);
    await getRedisClient().set(key, resourceId, 'EX', ttlSeconds);
  }

  async markFailed(scope: string, userId: string, idempotencyKey: string): Promise<void> {
    const key = buildKey(scope, userId, idempotencyKey);
    const client = getRedisClient();

    const current = await client.get(key);
    if (current === PENDING_MARKER) {
      await client.del(key);
    }
  }
}
