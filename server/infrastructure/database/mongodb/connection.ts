import mongoose, { type ClientSession } from 'mongoose';
import { env } from '../../../config/env';
import { logger } from '../../../middlewares/request-logger';

let isConnected = false;

export async function connectMongo(): Promise<void> {
  if (isConnected) {
    return;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGO_URI);
  isConnected = true;
  logger.info('MongoDB connected');
}

export async function disconnectMongo(): Promise<void> {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
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
