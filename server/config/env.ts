import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

/** Accept common alternate names (e.g. CLOUD_NAME) so server/.env typos still work. */
function normalizeCloudinaryEnv(): void {
  if (!process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUD_NAME) {
    process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUD_NAME;
  }
  if (!process.env.CLOUDINARY_API_KEY && process.env.CLOUD_API_KEY) {
    process.env.CLOUDINARY_API_KEY = process.env.CLOUD_API_KEY;
  }
  if (!process.env.CLOUDINARY_API_SECRET && process.env.CLOUD_API_SECRET) {
    process.env.CLOUDINARY_API_SECRET = process.env.CLOUD_API_SECRET;
  }
}

normalizeCloudinaryEnv();

function trimOptionalString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function isRazorpayTestMode(data: {
  RAZORPAY_TEST_MODE: boolean;
  RAZORPAY_KEY_ID?: string;
}): boolean {
  if (data.RAZORPAY_TEST_MODE) {
    return true;
  }
  return data.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ?? false;
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(4000),
    MONGO_URI: z.string().min(1),
    REDIS_URL: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:3000')
      .transform((value) => value.split(',').map((origin) => origin.trim())),
    BCRYPT_ROUNDS: z.coerce.number().min(12).default(12),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
    REFRESH_TOKEN_COOKIE_NAME: z.string().default('saan_refresh_token'),
    CSRF_TOKEN_COOKIE_NAME: z.string().default('saan_csrf_token'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    OTP_EXPIRY_MINUTES: z.coerce.number().min(1).default(10),
    PASSWORD_RESET_EXPIRY_MINUTES: z.coerce.number().min(1).default(30),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().min(1),
    SMTP_PASSWORD: z.string().min(1),
    EMAIL_FROM_NAME: z.string().min(1).default('SAAN'),
    EMAIL_FROM_ADDRESS: z.string().email().default('no-reply@saan.com'),
    ADMIN_EMAIL: z.preprocess(trimOptionalString, z.string().email().optional()),
    EMAIL_QUEUE_DRIVER: z.enum(['in-process', 'qstash']).default('in-process'),
    SERVER_PUBLIC_URL: z.preprocess(trimOptionalString, z.string().url().optional()),
    QSTASH_TOKEN: z.preprocess(trimOptionalString, z.string().min(1).optional()),
    QSTASH_CURRENT_SIGNING_KEY: z.preprocess(trimOptionalString, z.string().min(1).optional()),
    QSTASH_NEXT_SIGNING_KEY: z.preprocess(trimOptionalString, z.string().min(1).optional()),
    APP_URL: z.string().url().default('http://localhost:3000'),
    RAZORPAY_TEST_MODE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    RAZORPAY_KEY_ID: z.preprocess(trimOptionalString, z.string().min(1).optional()),
    RAZORPAY_KEY_SECRET: z.preprocess(trimOptionalString, z.string().min(1).optional()),
    RAZORPAY_WEBHOOK_SECRET: z.preprocess(trimOptionalString, z.string().min(1).optional()),
    CLOUDINARY_CLOUD_NAME: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().min(1).optional(),
    ),
    CLOUDINARY_API_KEY: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().min(1).optional(),
    ),
    CLOUDINARY_API_SECRET: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().min(1).optional(),
    ),
    CLOUDINARY_FOLDER: z.string().min(1).default('saan/products'),
  })
  .superRefine((data, ctx) => {
    if (data.EMAIL_QUEUE_DRIVER === 'qstash') {
      for (const key of [
        'SERVER_PUBLIC_URL',
        'QSTASH_TOKEN',
        'QSTASH_CURRENT_SIGNING_KEY',
        'QSTASH_NEXT_SIGNING_KEY',
      ] as const) {
        if (!data[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Required when EMAIL_QUEUE_DRIVER=qstash',
            path: [key],
          });
        }
      }
    }

    // A real key id with a missing secret silently became a placeholder pair and
    // produced Razorpay checkout AJAX 400s (order created under wrong credentials).
    if (data.RAZORPAY_KEY_ID && !data.RAZORPAY_KEY_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Required when RAZORPAY_KEY_ID is set',
        path: ['RAZORPAY_KEY_SECRET'],
      });
    }

    if (data.NODE_ENV !== 'production') {
      return;
    }

    if (!data.ADMIN_EMAIL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Required in production',
        path: ['ADMIN_EMAIL'],
      });
    }

    if (data.EMAIL_QUEUE_DRIVER !== 'qstash') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Production email delivery must use qstash',
        path: ['EMAIL_QUEUE_DRIVER'],
      });
    }

    const razorpayKeys = isRazorpayTestMode(data)
      ? (['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'] as const)
      : (['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'] as const);

    for (const key of razorpayKeys) {
      if (!data[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: isRazorpayTestMode(data)
            ? 'Required in production (test mode)'
            : 'Required in production',
          path: [key],
        });
      }
    }

    for (const key of [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ] as const) {
      if (!data[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required in production',
          path: [key],
        });
      }
    }
  })
  .transform((data) => ({
    ...data,
    ADMIN_EMAIL: data.ADMIN_EMAIL ?? data.EMAIL_FROM_ADDRESS,
    RAZORPAY_TEST_MODE: isRazorpayTestMode(data),
    RAZORPAY_KEY_ID: data.RAZORPAY_KEY_ID ?? 'rzp_test_dev_placeholder',
    RAZORPAY_KEY_SECRET: data.RAZORPAY_KEY_SECRET ?? 'dev_razorpay_secret_placeholder',
    RAZORPAY_WEBHOOK_SECRET: data.RAZORPAY_WEBHOOK_SECRET ?? 'whsec_dev_webhook_placeholder',
    CLOUDINARY_CLOUD_NAME: data.CLOUDINARY_CLOUD_NAME ?? 'dev_cloudinary_cloud',
    CLOUDINARY_API_KEY: data.CLOUDINARY_API_KEY ?? 'dev_cloudinary_key',
    CLOUDINARY_API_SECRET: data.CLOUDINARY_API_SECRET ?? 'dev_cloudinary_secret',
  }));

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
