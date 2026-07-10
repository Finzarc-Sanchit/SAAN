import rateLimit from 'express-rate-limit';
import { RedisStore, type RedisReply, type SendCommandFn } from 'rate-limit-redis';
import { getRedisClient } from '../infrastructure/database/redis/connection';

const WINDOW_MS = 15 * 60 * 1000;

function createRedisStore(prefix: string): RedisStore {
  const sendCommand: SendCommandFn = (command: string, ...args: string[]) =>
    getRedisClient().call(command, ...args) as Promise<RedisReply>;

  return new RedisStore({
    sendCommand,
    prefix,
  });
}

export const globalRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:global:'),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      details: [],
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:auth:'),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
      details: [],
    },
  },
});

const SENSITIVE_WINDOW_MS = 15 * 60 * 1000;
const SENSITIVE_MAX = 3;

export const sensitiveAuthEmailRateLimiter = rateLimit({
  windowMs: SENSITIVE_WINDOW_MS,
  max: SENSITIVE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:sensitive:email:'),
  validate: { singleCount: false },
  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : 'unknown';
    return `email:${email}`;
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests for this email, please try again later',
      details: [],
    },
  },
});

export const sensitiveAuthIpRateLimiter = rateLimit({
  windowMs: SENSITIVE_WINDOW_MS,
  max: SENSITIVE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:sensitive:ip:'),
  validate: { singleCount: false },
  keyGenerator: (req) => `ip:${req.ip ?? 'unknown'}`,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
      details: [],
    },
  },
});
