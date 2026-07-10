import express from 'express';
import { createApp } from './server/http/express-app';

const app: express.Application = createApp();

export default app;
