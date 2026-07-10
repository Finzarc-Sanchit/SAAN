import type { IAuthRepository } from '../../../../modules/auth/auth.repository.interface';
import type {
  CreateUserInput,
  OtpUpdateInput,
  PasswordResetUpdateInput,
  UpdateUnverifiedUserInput,
  User,
  UserWithCredentials,
} from '../../../../modules/auth/auth.types';
import type { UserRole } from '../../../../shared/constants';
import { UserModel, type UserDocument } from '../models/user.model';

const sensitiveSelect = '+passwordHash +refreshTokenHash +otpHash +otpExpiresAt +otpAttempts +passwordResetTokenHash +passwordResetExpiresAt';

function toDomainUser(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    firstName: doc.firstName,
    lastName: doc.lastName,
    role: doc.role as UserRole,
    isVerified: doc.isVerified,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toDomainUserWithCredentials(doc: UserDocument): UserWithCredentials {
  return {
    ...toDomainUser(doc),
    passwordHash: doc.passwordHash,
    refreshTokenHash: doc.refreshTokenHash,
    refreshTokenVersion: doc.refreshTokenVersion,
    otpHash: doc.otpHash,
    otpExpiresAt: doc.otpExpiresAt,
    otpAttempts: doc.otpAttempts,
    passwordResetTokenHash: doc.passwordResetTokenHash,
    passwordResetExpiresAt: doc.passwordResetExpiresAt,
  };
}

export class MongoAuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<UserWithCredentials | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() })
      .select(sensitiveSelect)
      .lean<UserDocument>()
      .exec();

    return doc ? toDomainUserWithCredentials(doc) : null;
  }

  async findById(id: string): Promise<UserWithCredentials | null> {
    const doc = await UserModel.findById(id)
      .select(sensitiveSelect)
      .lean<UserDocument>()
      .exec();

    return doc ? toDomainUserWithCredentials(doc) : null;
  }

  async findByRefreshTokenHash(tokenHash: string): Promise<UserWithCredentials | null> {
    const doc = await UserModel.findOne({ refreshTokenHash: tokenHash })
      .select(sensitiveSelect)
      .lean<UserDocument>()
      .exec();

    return doc ? toDomainUserWithCredentials(doc) : null;
  }

  async create(data: CreateUserInput): Promise<User> {
    const doc = await UserModel.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      isVerified: false,
      otpHash: data.otpHash,
      otpExpiresAt: data.otpExpiresAt,
      otpAttempts: 0,
    });

    return toDomainUser(doc.toObject() as UserDocument);
  }

  async updateUnverifiedUser(email: string, data: UpdateUnverifiedUserInput): Promise<User> {
    const doc = await UserModel.findOneAndUpdate(
      { email: email.toLowerCase(), isVerified: false },
      {
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        otpHash: data.otpHash,
        otpExpiresAt: data.otpExpiresAt,
        otpAttempts: 0,
      },
      { new: true },
    )
      .lean<UserDocument>()
      .exec();

    if (!doc) {
      throw new Error('Unverified user not found for update');
    }

    return toDomainUser(doc);
  }

  async updateOtp(email: string, data: OtpUpdateInput): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        otpHash: data.otpHash,
        otpExpiresAt: data.otpExpiresAt,
        otpAttempts: 0,
      },
    ).exec();
  }

  async incrementOtpAttempts(userId: string): Promise<number> {
    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { $inc: { otpAttempts: 1 } },
      { new: true },
    )
      .select('+otpAttempts')
      .lean<UserDocument>()
      .exec();

    return doc?.otpAttempts ?? 0;
  }

  async invalidateOtp(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      otpHash: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    }).exec();
  }

  async markVerifiedAndClearOtp(userId: string): Promise<User> {
    const doc = await UserModel.findByIdAndUpdate(
      userId,
      {
        isVerified: true,
        otpHash: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
      { new: true },
    )
      .lean<UserDocument>()
      .exec();

    if (!doc) {
      throw new Error('User not found');
    }

    return toDomainUser(doc);
  }

  async setPasswordResetToken(userId: string, data: PasswordResetUpdateInput): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      passwordResetTokenHash: data.passwordResetTokenHash,
      passwordResetExpiresAt: data.passwordResetExpiresAt,
    }).exec();
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    }).exec();
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { passwordHash }).exec();
  }

  async updateRefreshTokenHash(userId: string, tokenHash: string | null): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshTokenHash: tokenHash }).exec();
  }

  async incrementRefreshTokenVersion(userId: string): Promise<number> {
    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { $inc: { refreshTokenVersion: 1 }, refreshTokenHash: null },
      { new: true },
    )
      .lean<UserDocument>()
      .exec();

    return doc?.refreshTokenVersion ?? 0;
  }
}
