import { Schema, model } from 'mongoose';
import { USER_ROLES } from '../../../../shared/constants';

const addressSchema = new Schema(
  {
    addressId: {
      type: String,
      required: true,
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
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    apartment: {
      type: String,
      default: null,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false },
);

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
    mobileNumber: {
      type: String,
      default: null,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
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
      select: false,
    },
    addresses: {
      type: [addressSchema],
      default: [],
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
        delete ret.refreshTokenVersion;
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

userSchema.index({ role: 1, createdAt: -1 });

export const UserModel = model('User', userSchema);

export type AddressDocument = {
  addressId: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export type UserDocument = {
  _id: { toString(): string };
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  mobileNumber: string | null;
  dateOfBirth: Date | null;
  role: string;
  isVerified: boolean;
  otpHash: string | null;
  otpExpiresAt: Date | null;
  otpAttempts: number;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: Date | null;
  refreshTokenHash: string | null;
  refreshTokenVersion: number;
  addresses: AddressDocument[];
  createdAt: Date;
  updatedAt: Date;
};
