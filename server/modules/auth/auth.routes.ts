import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { verifyCsrfToken } from '../../middlewares/csrf.middleware';
import {
  authRateLimiter,
  sensitiveAuthEmailRateLimiter,
  sensitiveAuthIpRateLimiter,
} from '../../middlewares/rate-limit.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  forgotPasswordDto,
  loginDto,
  registerDto,
  resendOtpDto,
  resetPasswordDto,
  verifyOtpDto,
} from './auth.dto';
import { authController } from './auth.module';

const router = Router();

router.get('/csrf', authController.getCsrf);
router.post('/register', authRateLimiter, validate(registerDto), authController.register);
router.post('/verify-otp', authRateLimiter, validate(verifyOtpDto), authController.verifyOtp);
router.post(
  '/resend-otp',
  sensitiveAuthIpRateLimiter,
  sensitiveAuthEmailRateLimiter,
  validate(resendOtpDto),
  authController.resendOtp,
);
router.post('/login', authRateLimiter, verifyCsrfToken, validate(loginDto), authController.login);
router.post('/refresh', authRateLimiter, verifyCsrfToken, authController.refresh);
router.post('/logout', authMiddleware, verifyCsrfToken, authController.logout);
router.post(
  '/forgot-password',
  sensitiveAuthIpRateLimiter,
  sensitiveAuthEmailRateLimiter,
  validate(forgotPasswordDto),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  authRateLimiter,
  verifyCsrfToken,
  validate(resetPasswordDto),
  authController.resetPassword,
);

export const authRoutes = router;
