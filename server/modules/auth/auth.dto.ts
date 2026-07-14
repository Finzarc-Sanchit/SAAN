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

export const updateProfileDto = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type VerifyOtpDto = z.infer<typeof verifyOtpDto>;
export type ResendOtpDto = z.infer<typeof resendOtpDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
