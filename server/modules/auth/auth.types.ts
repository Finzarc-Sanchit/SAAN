import type { UserRole } from '../../shared/constants';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithCredentials extends User {
  passwordHash: string;
  refreshTokenHash: string | null;
  refreshTokenVersion: number;
  otpHash: string | null;
  otpExpiresAt: Date | null;
  otpAttempts: number;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: Date | null;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  otpHash: string;
  otpExpiresAt: Date;
}

export interface UpdateUnverifiedUserInput {
  passwordHash: string;
  firstName: string;
  lastName: string;
  otpHash: string;
  otpExpiresAt: Date;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
}

export interface OtpUpdateInput {
  otpHash: string;
  otpExpiresAt: Date;
}

export interface PasswordResetUpdateInput {
  passwordResetTokenHash: string;
  passwordResetExpiresAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResult {
  email: string;
  message: string;
}

export interface GenericMessageResult {
  message: string;
}
