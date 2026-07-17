import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { createHash, randomBytes, randomInt } from 'crypto';
import { env } from '../../config/env';
import type { IEmailService } from '../../infrastructure/email/email.interface';
import { logger } from '../../middlewares/request-logger';
import { USER_ROLES } from '../../shared/constants';
import { ConflictError } from '../../shared/errors/conflict-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
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
import type { IAuthRepository } from './auth.repository.interface';
import type {
  AuthResult,
  AuthTokens,
  AuthenticatedUser,
  CreateUserInput,
  GenericMessageResult,
  RegisterResult,
  User,
  UserWithCredentials,
} from './auth.types';
import type {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendOtpDto,
  ResetPasswordDto,
  UpdateProfileDto,
  VerifyOtpDto,
} from './auth.dto';
import type { ILoginLockoutStore } from './login-lockout.interface';

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: User['role'];
};

type RefreshTokenPayload = {
  sub: string;
  ver: number;
};

export class AuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly emailService: IEmailService,
    private readonly loginLockout: ILoginLockoutStore,
  ) {}

  /** Register a new customer account and send a verification OTP. */
  async register(input: RegisterDto): Promise<RegisterResult> {
    const email = input.email.toLowerCase();
    const existing = await this.authRepository.findByEmail(email);

    if (existing?.isVerified) {
      throw new ConflictError('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
    const { otp, otpHash, otpExpiresAt } = this.generateOtpBundle();

    if (existing && !existing.isVerified) {
      await this.authRepository.updateUnverifiedUser(email, {
        passwordHash,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        otpHash,
        otpExpiresAt,
      });
    } else {
      const createInput: CreateUserInput = {
        email,
        passwordHash,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        role: USER_ROLES.CUSTOMER,
        otpHash,
        otpExpiresAt,
      };

      await this.authRepository.create(createInput);
    }

    await this.safeSendOtp(email, otp, 'registration');

    return {
      email,
      message: 'OTP sent',
    };
  }

  /** Verify a registration OTP and issue auth tokens. */
  async verifyOtp(input: VerifyOtpDto): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    const user = await this.authRepository.findByEmail(email);

    if (!this.isOtpValid(user, input.otp)) {
      if (user?.otpHash && user.otpExpiresAt && user.otpExpiresAt > new Date()) {
        const attempts = await this.authRepository.incrementOtpAttempts(user.id);

        if (attempts >= AUTH_CONSTANTS.MAX_OTP_ATTEMPTS) {
          await this.authRepository.invalidateOtp(user.id);
        }
      }

      throw new UnauthorizedError(GENERIC_OTP_ERROR);
    }

    const verifiedUser = await this.authRepository.markVerifiedAndClearOtp(user!.id);
    const tokens = await this.issueTokens(verifiedUser, user!.refreshTokenVersion);

    return { user: verifiedUser, tokens };
  }

  /** Resend a verification OTP without revealing account existence. */
  async resendOtp(input: ResendOtpDto): Promise<GenericMessageResult> {
    const email = input.email.toLowerCase();
    const user = await this.authRepository.findByEmail(email);

    if (user && !user.isVerified) {
      const { otp, otpHash, otpExpiresAt } = this.generateOtpBundle();
      await this.authRepository.updateOtp(email, { otpHash, otpExpiresAt });
      await this.safeSendOtp(email, otp, 'resend');
    }

    return { message: GENERIC_ACCOUNT_MESSAGE };
  }

  /** Authenticate a verified user with email and password. */
  async login(input: LoginDto): Promise<AuthResult> {
    const email = input.email.toLowerCase();

    if (await this.loginLockout.isLocked(email)) {
      throw new UnauthorizedError(
        `Too many failed login attempts. Try again in ${Math.ceil(this.loginLockout.getLockoutSeconds() / 60)} minutes.`,
      );
    }

    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      await this.loginLockout.recordFailure(email);
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValid) {
      await this.loginLockout.recordFailure(email);
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    if (!user.isVerified) {
      throw new UnauthorizedError(UNVERIFIED_LOGIN_MESSAGE);
    }

    await this.loginLockout.clearFailures(email);

    const tokens = await this.issueTokens(this.toPublicUser(user), user.refreshTokenVersion);

    return { user: this.toPublicUser(user), tokens };
  }

  /** Rotate refresh token and issue a new access token. */
  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload: RefreshTokenPayload;

    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = this.hashValue(refreshToken);
    const user = await this.authRepository.findByRefreshTokenHash(tokenHash);

    if (!user || user.id !== payload.sub || user.refreshTokenVersion !== payload.ver) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokens = await this.issueTokens(this.toPublicUser(user), user.refreshTokenVersion);

    return { user: this.toPublicUser(user), tokens };
  }

  /** Invalidate the stored refresh token for the user. */
  async logout(userId: string): Promise<void> {
    await this.authRepository.updateRefreshTokenHash(userId, null);
  }

  async updateProfile(userId: string, input: UpdateProfileDto): Promise<User> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.authRepository.updateProfile(userId, {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      mobileNumber: input.mobileNumber?.trim() || null,
      dateOfBirth: input.dateOfBirth
        ? new Date(`${input.dateOfBirth}T00:00:00.000Z`)
        : null,
    });
  }

  /** Send a password reset link without revealing account existence. */
  async forgotPassword(input: ForgotPasswordDto): Promise<GenericMessageResult> {
    const email = input.email.toLowerCase();
    const user = await this.authRepository.findByEmail(email);

    if (user?.isVerified) {
      const resetToken = this.generateResetToken();
      const passwordResetExpiresAt = this.getPasswordResetExpiry();

      await this.authRepository.setPasswordResetToken(user.id, {
        passwordResetTokenHash: this.hashValue(resetToken),
        passwordResetExpiresAt,
      });

      const resetLink = this.buildPasswordResetLink(email, resetToken);
      await this.safeSendPasswordReset(email, resetLink);
    }

    return { message: GENERIC_RESET_MESSAGE };
  }

  /** Reset password using a valid reset token. */
  async resetPassword(input: ResetPasswordDto): Promise<GenericMessageResult> {
    const email = input.email.toLowerCase();
    const user = await this.authRepository.findByEmail(email);
    const tokenHash = this.hashValue(input.token);

    if (
      !user ||
      !user.passwordResetTokenHash ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt <= new Date() ||
      user.passwordResetTokenHash !== tokenHash
    ) {
      throw new UnauthorizedError(GENERIC_RESET_ERROR);
    }

    const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_ROUNDS);

    await this.authRepository.updatePassword(user.id, passwordHash);
    await this.authRepository.clearPasswordResetToken(user.id);
    await this.authRepository.incrementRefreshTokenVersion(user.id);

    await this.safeSendPasswordChanged(email);

    return { message: 'Password reset successfully' };
  }

  private async issueTokens(user: User, refreshTokenVersion: number): Promise<AuthTokens> {
    const accessToken = this.signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = jwt.sign(
      { sub: user.id, ver: refreshTokenVersion },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions,
    );

    const refreshTokenHash = this.hashValue(refreshToken);
    await this.authRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    return { accessToken, refreshToken };
  }

  private signAccessToken(user: AuthenticatedUser): string {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as SignOptions);
  }

  private generateOtpBundle(): { otp: string; otpHash: string; otpExpiresAt: Date } {
    const otp = randomInt(0, 1_000_000).toString().padStart(AUTH_CONSTANTS.OTP_LENGTH, '0');
    const otpHash = this.hashValue(otp);
    const otpExpiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    return { otp, otpHash, otpExpiresAt };
  }

  private generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  private getPasswordResetExpiry(): Date {
    return new Date(Date.now() + env.PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);
  }

  private buildPasswordResetLink(email: string, token: string): string {
    const url = new URL('/reset-password', env.APP_URL);
    url.searchParams.set('email', email);
    url.searchParams.set('token', token);
    return url.toString();
  }

  private isOtpValid(user: UserWithCredentials | null, otp: string): boolean {
    if (!user?.otpHash || !user.otpExpiresAt) {
      return false;
    }

    if (user.otpExpiresAt <= new Date()) {
      return false;
    }

    if (user.otpAttempts >= AUTH_CONSTANTS.MAX_OTP_ATTEMPTS) {
      return false;
    }

    return this.hashValue(otp) === user.otpHash;
  }

  private hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private toPublicUser(user: UserWithCredentials): User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async safeSendOtp(
    email: string,
    otp: string,
    purpose: 'registration' | 'resend',
  ): Promise<void> {
    try {
      await this.emailService.sendOtpEmail(email, otp, purpose);
    } catch (error) {
      logger.error({ err: error, email }, 'Failed to send OTP email');
    }
  }

  private async safeSendPasswordReset(email: string, resetLink: string): Promise<void> {
    try {
      await this.emailService.sendPasswordResetEmail(email, resetLink);
    } catch (error) {
      logger.error({ err: error, email }, 'Failed to send password reset email');
    }
  }

  private async safeSendPasswordChanged(email: string): Promise<void> {
    try {
      await this.emailService.sendPasswordChangedEmail(email);
    } catch (error) {
      logger.error({ err: error, email }, 'Failed to send password changed email');
    }
  }
}
