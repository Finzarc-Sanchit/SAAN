import { Schema, model } from 'mongoose';
import { USER_ROLES } from '../../../../shared/constants';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    otpHash: {
      type: String,
      default: null,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.refreshTokenHash;
        delete ret.otpHash;
        delete ret.otpExpiresAt;
        delete ret.otpAttempts;
        delete ret.passwordResetTokenHash;
        delete ret.passwordResetExpiresAt;
        return ret;
      },
    },
  },
);

export const UserModel = model('User', userSchema);

export type UserDocument = {
  _id: { toString(): string };
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  otpHash: string | null;
  otpExpiresAt: Date | null;
  otpAttempts: number;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: Date | null;
  refreshTokenHash: string | null;
  refreshTokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
};
