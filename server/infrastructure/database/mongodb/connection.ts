import mongoose, { type ClientSession } from 'mongoose';
import { env } from '../../../config/env';
import { logger } from '../../../middlewares/request-logger';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

export async function connectMongo(): Promise<void> {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return;
  }

  if (!cache.promise) {
    mongoose.set('strictQuery', true);
    cache.promise = mongoose.connect(env.MONGO_URI);
  }

  cache.conn = await cache.promise;
  logger.info('MongoDB connected');
}

export async function disconnectMongo(): Promise<void> {
  if (!cache.conn) {
    return;
  }

  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
  logger.info('MongoDB disconnected');
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
