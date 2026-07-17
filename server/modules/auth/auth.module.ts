import { MongoAuthRepository } from '../../infrastructure/database/mongodb/repositories/auth.repository';
import { RedisLoginLockoutStore } from '../../infrastructure/database/redis/login-lockout.store';
import { emailQueue } from '../../infrastructure/email/email.module';
import { QueuedEmailService } from '../../infrastructure/email/queued-email.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const authRepository = new MongoAuthRepository();
const emailService = new QueuedEmailService(emailQueue);
const loginLockout = new RedisLoginLockoutStore();
const authService = new AuthService(authRepository, emailService, loginLockout);
export const authController = new AuthController(authService);

export { authService, authRepository, emailService, loginLockout };
