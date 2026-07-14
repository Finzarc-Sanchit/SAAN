import type {
  CreateUserInput,
  OtpUpdateInput,
  PasswordResetUpdateInput,
  UpdateProfileInput,
  UpdateUnverifiedUserInput,
  User,
  UserWithCredentials,
} from './auth.types';

export interface IAuthRepository {
  findByEmail(email: string): Promise<UserWithCredentials | null>;
  findById(id: string): Promise<UserWithCredentials | null>;
  findByRefreshTokenHash(tokenHash: string): Promise<UserWithCredentials | null>;
  create(data: CreateUserInput): Promise<User>;
  updateUnverifiedUser(email: string, data: UpdateUnverifiedUserInput): Promise<User>;
  updateOtp(email: string, data: OtpUpdateInput): Promise<void>;
  incrementOtpAttempts(userId: string): Promise<number>;
  invalidateOtp(userId: string): Promise<void>;
  markVerifiedAndClearOtp(userId: string): Promise<User>;
  setPasswordResetToken(userId: string, data: PasswordResetUpdateInput): Promise<void>;
  clearPasswordResetToken(userId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  updateProfile(userId: string, data: UpdateProfileInput): Promise<User>;
  updateRefreshTokenHash(userId: string, tokenHash: string | null): Promise<void>;
  incrementRefreshTokenVersion(userId: string): Promise<number>;
}
