import type { Application } from 'express';
import { createApp } from './http/express-app';
import { connectMongo } from './infrastructure/database/mongodb/connection';
import { connectRedis } from './infrastructure/database/redis/connection';

let appInstance: Application | null = null;
let readyPromise: Promise<Application> | null = null;

export async function getReadyApp(): Promise<Application> {
  if (appInstance) {
    return appInstance;
  }

  if (!readyPromise) {
    readyPromise = (async () => {
      await connectMongo();
      await connectRedis();
      appInstance = createApp();
      return appInstance;
    })();
  }

  return readyPromise;
}

export function resetAppForTests(): void {
  appInstance = null;
  readyPromise = null;
}
