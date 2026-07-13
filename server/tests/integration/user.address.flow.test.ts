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

describe('User address flow integration', () => {
  let app: Application;
  let mongod: MongoMemoryServer;
  let accessToken = '';
  let sentOtps: string[] = [];

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
    accessToken = '';

    jest.spyOn(emailService, 'sendOtpEmail').mockImplementation(async (_to, otp) => {
      sentOtps.push(otp);
    });
    jest.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
    jest.spyOn(emailService, 'sendPasswordChangedEmail').mockResolvedValue(undefined);

    const email = 'addresses@example.com';
    const password = 'Password1';

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password,
        firstName: 'Address',
        lastName: 'Tester',
      })
      .expect(201);

    const otp = sentOtps[0]!;

    const verifyResponse = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ email, otp })
      .expect(200);

    accessToken = verifyResponse.body.data.accessToken;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds two addresses, sets one default, and auto-promotes after deleting the default', async () => {
    const firstResponse = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'Address',
        lastName: 'Tester',
        phone: '+1 555 111 2222',
        address: '10 First Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
      })
      .expect(201);

    const secondResponse = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'Address',
        lastName: 'Tester',
        phone: '+1 555 333 4444',
        address: '20 Second Ave',
        city: 'Brooklyn',
        state: 'NY',
        postalCode: '11201',
      })
      .expect(201);

    const firstAddressId = firstResponse.body.data.addressId as string;
    const secondAddressId = secondResponse.body.data.addressId as string;

    expect(firstResponse.body.data.isDefault).toBe(true);
    expect(secondResponse.body.data.isDefault).toBe(false);

    await request(app)
      .patch(`/api/v1/users/me/addresses/${secondAddressId}/default`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const listAfterDefault = await request(app)
      .get('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const addressesAfterDefault = listAfterDefault.body.data as Array<{
      addressId: string;
      isDefault: boolean;
    }>;

    expect(addressesAfterDefault).toHaveLength(2);
    expect(addressesAfterDefault.find((entry) => entry.addressId === firstAddressId)?.isDefault).toBe(
      false,
    );
    expect(addressesAfterDefault.find((entry) => entry.addressId === secondAddressId)?.isDefault).toBe(
      true,
    );

    await request(app)
      .delete(`/api/v1/users/me/addresses/${secondAddressId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const listAfterDelete = await request(app)
      .get('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const addressesAfterDelete = listAfterDelete.body.data as Array<{
      addressId: string;
      isDefault: boolean;
    }>;

    expect(addressesAfterDelete).toHaveLength(1);
    expect(addressesAfterDelete[0]?.addressId).toBe(firstAddressId);
    expect(addressesAfterDelete[0]?.isDefault).toBe(true);
  });
});
