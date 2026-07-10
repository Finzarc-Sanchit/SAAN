import bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { AuthService } from './auth.service';
import type { IAuthRepository } from './auth.repository.interface';
import type { IEmailService } from '../../infrastructure/email/email.interface';
import type { ILoginLockoutStore } from './login-lockout.interface';
import { ConflictError } from '../../shared/errors/conflict-error';
import { UnauthorizedError } from '../../shared/errors/unauthorized-error';
import {
  AUTH_CONSTANTS,
  GENERIC_ACCOUNT_MESSAGE,
  GENERIC_OTP_ERROR,
  GENERIC_RESET_ERROR,
  GENERIC_RESET_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
  UNVERIFIED_LOGIN_MESSAGE,
} from './auth.constants';
import { USER_ROLES } from '../../shared/constants';

jest.mock('bcrypt');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn(() => ({ sub: 'user-1', ver: 0 })),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function createMockRepository(): jest.Mocked<IAuthRepository> {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByRefreshTokenHash: jest.fn(),
    create: jest.fn(),
    updateUnverifiedUser: jest.fn(),
    updateOtp: jest.fn(),
    incrementOtpAttempts: jest.fn(),
    invalidateOtp: jest.fn(),
    markVerifiedAndClearOtp: jest.fn(),
    setPasswordResetToken: jest.fn(),
    clearPasswordResetToken: jest.fn(),
    updatePassword: jest.fn(),
    updateRefreshTokenHash: jest.fn(),
    incrementRefreshTokenVersion: jest.fn(),
  };
}

function createMockEmailService(): jest.Mocked<IEmailService> {
  return {
    sendOtpEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendPasswordChangedEmail: jest.fn(),
  };
}

function createMockLoginLockout(): jest.Mocked<ILoginLockoutStore> {
  return {
    isLocked: jest.fn(),
    recordFailure: jest.fn(),
    clearFailures: jest.fn(),
    getMaxAttempts: jest.fn().mockReturnValue(5),
    getLockoutSeconds: jest.fn().mockReturnValue(900),
  };
}

describe('AuthService', () => {
  let repository: jest.Mocked<IAuthRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let loginLockout: jest.Mocked<ILoginLockoutStore>;
  let service: AuthService;

  const now = new Date();
  const otp = '123456';
  const otpHash = hashValue(otp);

  const verifiedUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: USER_ROLES.CUSTOMER,
    isVerified: true,
    passwordHash: 'hashed-password',
    refreshTokenHash: null,
    refreshTokenVersion: 0,
    otpHash: null,
    otpExpiresAt: null,
    otpAttempts: 0,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const unverifiedUser = {
    ...verifiedUser,
    isVerified: false,
    otpHash,
    otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    otpAttempts: 0,
  };

  beforeEach(() => {
    repository = createMockRepository();
    emailService = createMockEmailService();
    loginLockout = createMockLoginLockout();
    service = new AuthService(repository, emailService, loginLockout);
    jest.clearAllMocks();
    loginLockout.isLocked.mockResolvedValue(false);
  });

  describe('register', () => {
    it('throws ConflictError when a verified user already exists', async () => {
      repository.findByEmail.mockResolvedValue(verifiedUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'Password1',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictError);
    });

    it('creates an unverified user and sends OTP email', async () => {
      repository.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
      repository.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: USER_ROLES.CUSTOMER,
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'Password1',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result).toEqual({ email: 'test@example.com', message: 'OTP sent' });
      expect(repository.create).toHaveBeenCalled();
      expect(emailService.sendOtpEmail).toHaveBeenCalled();
    });

    it('re-registers an unverified user without creating a duplicate row', async () => {
      repository.findByEmail.mockResolvedValue(unverifiedUser);
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
      repository.updateUnverifiedUser.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: USER_ROLES.CUSTOMER,
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      });

      await service.register({
        email: 'test@example.com',
        password: 'Password1',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(repository.updateUnverifiedUser).toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('issues tokens when OTP is valid', async () => {
      repository.findByEmail.mockResolvedValue(unverifiedUser);
      repository.markVerifiedAndClearOtp.mockResolvedValue({
        ...verifiedUser,
        isVerified: true,
      });
      repository.updateRefreshTokenHash.mockResolvedValue();

      const result = await service.verifyOtp({ email: 'test@example.com', otp });

      expect(result.tokens.accessToken).toBe('mock-token');
      expect(repository.markVerifiedAndClearOtp).toHaveBeenCalledWith('user-1');
    });

    it('throws when OTP is expired', async () => {
      repository.findByEmail.mockResolvedValue({
        ...unverifiedUser,
        otpExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.verifyOtp({ email: 'test@example.com', otp }),
      ).rejects.toThrow(new UnauthorizedError(GENERIC_OTP_ERROR));
    });

    it('increments attempts and invalidates OTP after max failures', async () => {
      repository.findByEmail.mockResolvedValue({
        ...unverifiedUser,
        otpHash: hashValue('000000'),
      });
      repository.incrementOtpAttempts.mockResolvedValue(AUTH_CONSTANTS.MAX_OTP_ATTEMPTS);

      await expect(
        service.verifyOtp({ email: 'test@example.com', otp: '999999' }),
      ).rejects.toThrow(UnauthorizedError);

      expect(repository.incrementOtpAttempts).toHaveBeenCalledWith('user-1');
      expect(repository.invalidateOtp).toHaveBeenCalledWith('user-1');
    });
  });

  describe('resendOtp', () => {
    it('returns a generic success message even when user does not exist', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.resendOtp({ email: 'missing@example.com' });

      expect(result.message).toBe(GENERIC_ACCOUNT_MESSAGE);
      expect(emailService.sendOtpEmail).not.toHaveBeenCalled();
    });

    it('regenerates OTP for an unverified user', async () => {
      repository.findByEmail.mockResolvedValue(unverifiedUser);
      repository.updateOtp.mockResolvedValue();

      const result = await service.resendOtp({ email: 'test@example.com' });

      expect(result.message).toBe(GENERIC_ACCOUNT_MESSAGE);
      expect(repository.updateOtp).toHaveBeenCalled();
      expect(emailService.sendOtpEmail).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('throws for invalid credentials', async () => {
      repository.findByEmail.mockResolvedValue(null);
      loginLockout.recordFailure.mockResolvedValue(1);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE));
    });

    it('throws a clear error for unverified accounts with valid credentials', async () => {
      repository.findByEmail.mockResolvedValue(unverifiedUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await expect(
        service.login({ email: 'test@example.com', password: 'Password1' }),
      ).rejects.toThrow(new UnauthorizedError(UNVERIFIED_LOGIN_MESSAGE));

      expect(loginLockout.recordFailure).not.toHaveBeenCalled();
    });

    it('locks out after repeated failures', async () => {
      loginLockout.isLocked.mockResolvedValue(true);

      await expect(
        service.login({ email: 'test@example.com', password: 'Password1' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('returns tokens for verified users', async () => {
      repository.findByEmail.mockResolvedValue(verifiedUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      repository.updateRefreshTokenHash.mockResolvedValue();

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password1',
      });

      expect(result.tokens.accessToken).toBe('mock-token');
      expect(loginLockout.clearFailures).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('returns the same generic message when user does not exist', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'missing@example.com' });

      expect(result.message).toBe(GENERIC_RESET_MESSAGE);
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('sends reset email for verified users', async () => {
      repository.findByEmail.mockResolvedValue(verifiedUser);
      repository.setPasswordResetToken.mockResolvedValue();

      const result = await service.forgotPassword({ email: 'test@example.com' });

      expect(result.message).toBe(GENERIC_RESET_MESSAGE);
      expect(repository.setPasswordResetToken).toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const resetToken = 'reset-token-plain';
    const resetHash = hashValue(resetToken);

    it('throws for invalid or expired reset tokens', async () => {
      repository.findByEmail.mockResolvedValue({
        ...verifiedUser,
        passwordResetTokenHash: resetHash,
        passwordResetExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.resetPassword({
          email: 'test@example.com',
          token: resetToken,
          newPassword: 'NewPassword1',
        }),
      ).rejects.toThrow(new UnauthorizedError(GENERIC_RESET_ERROR));
    });

    it('resets password, invalidates sessions, and notifies the user', async () => {
      repository.findByEmail.mockResolvedValue({
        ...verifiedUser,
        passwordResetTokenHash: resetHash,
        passwordResetExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
      mockedBcrypt.hash.mockResolvedValue('new-hash' as never);
      repository.updatePassword.mockResolvedValue();
      repository.clearPasswordResetToken.mockResolvedValue();
      repository.incrementRefreshTokenVersion.mockResolvedValue(1);

      const result = await service.resetPassword({
        email: 'test@example.com',
        token: resetToken,
        newPassword: 'NewPassword1',
      });

      expect(result.message).toBe('Password reset successfully');
      expect(repository.incrementRefreshTokenVersion).toHaveBeenCalledWith('user-1');
      expect(emailService.sendPasswordChangedEmail).toHaveBeenCalled();
    });
  });
});
