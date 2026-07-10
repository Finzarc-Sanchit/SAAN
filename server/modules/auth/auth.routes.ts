import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
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

router.post('/register', authRateLimiter, validate(registerDto), authController.register);
router.post('/verify-otp', authRateLimiter, validate(verifyOtpDto), authController.verifyOtp);
router.post(
  '/resend-otp',
  sensitiveAuthIpRateLimiter,
  sensitiveAuthEmailRateLimiter,
  validate(resendOtpDto),
  authController.resendOtp,
);
router.post('/login', authRateLimiter, validate(loginDto), authController.login);
router.post('/refresh', authRateLimiter, authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
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
  validate(resetPasswordDto),
  authController.resetPassword,
);

export const authRoutes = router;
