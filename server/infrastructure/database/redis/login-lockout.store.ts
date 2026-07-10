import type { ILoginLockoutStore } from '../../../modules/auth/login-lockout.interface';
import { getRedisClient } from './connection';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 15 * 60;

function attemptsKey(email: string): string {
  return `login:attempts:${email.toLowerCase()}`;
}

function lockoutKey(email: string): string {
  return `login:lockout:${email.toLowerCase()}`;
}

export class RedisLoginLockoutStore implements ILoginLockoutStore {
  async isLocked(email: string): Promise<boolean> {
    const locked = await getRedisClient().get(lockoutKey(email));
    return locked !== null;
  }

  async recordFailure(email: string): Promise<number> {
    const client = getRedisClient();
    const key = attemptsKey(email);
    const attempts = await client.incr(key);

    if (attempts === 1) {
      await client.expire(key, LOCKOUT_SECONDS);
    }

    if (attempts >= MAX_ATTEMPTS) {
      await client.set(lockoutKey(email), '1', 'EX', LOCKOUT_SECONDS);
      await client.del(key);
      return MAX_ATTEMPTS;
    }

    return attempts;
  }

  async clearFailures(email: string): Promise<void> {
    const client = getRedisClient();
    await client.del(attemptsKey(email), lockoutKey(email));
  }

  getMaxAttempts(): number {
    return MAX_ATTEMPTS;
  }

  getLockoutSeconds(): number {
    return LOCKOUT_SECONDS;
  }
}
