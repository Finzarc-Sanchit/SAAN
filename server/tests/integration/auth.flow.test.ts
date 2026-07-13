import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import type { Application } from 'express';

jest.mock('rate-limit-redis', () => {
  const { jest: jestGlobals } = require('@jest/globals');
  return {
    RedisStore: jestGlobals.fn().mockImplementation(() => ({
      init: jestGlobals.fn(),
      increment: jestGlobals.fn().mockResolvedValue({ totalHits: 1, resetTime: new Date() }),
      decrement: jestGlobals.fn(),
      resetKey: jestGlobals.fn(),
    })),
  };
});

jest.mock('../../infrastructure/database/redis/connection', () => {
  const { jest: jestGlobals } = require('@jest/globals');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RedisMock = require('ioredis-mock');
  const client = new RedisMock();

  return {
    getRedisClient: () => client,
    connectRedis: jestGlobals.fn().mockResolvedValue(undefined),
    disconnectRedis: jestGlobals.fn().mockResolvedValue(undefined),
    isRedisConnected: () => true,
  };
});

import { createApp } from '../../http/express-app';
import { connectMongo, disconnectMongo } from '../../infrastructure/database/mongodb/connection';
import { UserModel } from '../../infrastructure/database/mongodb/models/user.model';
import { resetConnectionsForTests } from '../../middlewares/ensure-connections.middleware';
import { emailService } from '../../modules/auth/auth.module';

describe('Auth flow integration', () => {
  let app: Application;
  let mongod: MongoMemoryServer;
  let sentOtps: string[] = [];
  let sentResetLinks: string[] = [];

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    resetConnectionsForTests();
    await connectMongo();
    app = createApp();
  });

  afterAll(async () => {
    resetConnectionsForTests();
    await disconnectMongo();
    await mongod.stop();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    sentOtps = [];
    sentResetLinks = [];

    jest.spyOn(emailService, 'sendOtpEmail').mockImplementation(async (_to, otp) => {
      sentOtps.push(otp);
    });
    jest.spyOn(emailService, 'sendPasswordResetEmail').mockImplementation(async (_to, link) => {
      sentResetLinks.push(link);
    });
    jest.spyOn(emailService, 'sendPasswordChangedEmail').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('completes register → verify-otp → login → forgot-password → reset-password → login', async () => {
    const email = 'flow@example.com';
    const password = 'Password1';
    const newPassword = 'NewPassword2';

    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password,
        firstName: 'Flow',
        lastName: 'Test',
      })
      .expect(201);

    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.message).toBe('OTP sent');
    expect(sentOtps).toHaveLength(1);

    const otp = sentOtps[0]!;

    const verifyResponse = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ email, otp })
      .expect(200);

    expect(verifyResponse.body.data.accessToken).toBeDefined();
    expect(verifyResponse.headers['set-cookie']).toBeDefined();

    await request(app).post('/api/v1/auth/login').send({ email, password }).expect(200);

    const forgotResponse = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email })
      .expect(200);

    expect(forgotResponse.body.data.message).toContain('If an account exists');
    expect(sentResetLinks).toHaveLength(1);

    const resetUrl = new URL(sentResetLinks[0]!);
    const resetToken = resetUrl.searchParams.get('token');
    expect(resetToken).toBeTruthy();

    await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        email,
        token: resetToken,
        newPassword,
      })
      .expect(200);

    const userAfterReset = await UserModel.findOne({ email }).select('+refreshTokenVersion').lean();
    expect(userAfterReset?.refreshTokenVersion).toBeGreaterThan(0);

    await request(app).post('/api/v1/auth/login').send({ email, password }).expect(401);
    await request(app).post('/api/v1/auth/login').send({ email, password: newPassword }).expect(200);
  });
});
