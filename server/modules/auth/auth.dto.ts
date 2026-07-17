import { z } from 'zod';
import { passwordSchema } from '../../shared/validation/password.schema';

export const registerDto = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
});

export const loginDto = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpDto = z.object({
  email: z.string().email('Invalid email address'),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const resendOtpDto = z.object({
  email: z.string().email('Invalid email address'),
});

export const forgotPasswordDto = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordDto = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

const mobileNumberSchema = z
  .string()
  .trim()
  .min(7, 'Mobile number is too short')
  .max(20, 'Mobile number is too long')
  .regex(/^[+]?[\d\s()-]+$/, 'Invalid mobile number format');

const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must use YYYY-MM-DD format')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, 'Invalid date of birth')
  .refine(
    (value) => new Date(`${value}T00:00:00.000Z`) <= new Date(),
    'Date of birth cannot be in the future',
  );

export const updateProfileDto = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  mobileNumber: mobileNumberSchema.nullable(),
  dateOfBirth: dateOfBirthSchema.nullable(),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type VerifyOtpDto = z.infer<typeof verifyOtpDto>;
export type ResendOtpDto = z.infer<typeof resendOtpDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
