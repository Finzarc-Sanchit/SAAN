import { MongoAuthRepository } from '../../infrastructure/database/mongodb/repositories/auth.repository';
import { RedisLoginLockoutStore } from '../../infrastructure/database/redis/login-lockout.store';
import { NodemailerEmailService } from '../../infrastructure/email/nodemailer-email.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const authRepository = new MongoAuthRepository();
const emailService = new NodemailerEmailService();
const loginLockout = new RedisLoginLockoutStore();
const authService = new AuthService(authRepository, emailService, loginLockout);
export const authController = new AuthController(authService);

export { authService, authRepository, emailService, loginLockout };
