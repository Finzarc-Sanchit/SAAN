import type {
  AuthSession,
  GenericMessageResponse,
  LogoutResponse,
  RegisterResponse,
} from '@/lib/types/auth';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendOtpInput,
  ResetPasswordInput,
  VerifyOtpInput,
} from '@/lib/types/auth.schemas';
import { apiRequest } from '@/lib/api/client';

const AUTH_BASE = '/api/v1/auth';

export async function register(input: RegisterInput): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>(`${AUTH_BASE}/register`, {
    method: 'POST',
    body: input,
    skipAuthRefresh: true,
  });
}

export async function verifyOtp(input: VerifyOtpInput): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${AUTH_BASE}/verify-otp`, {
    method: 'POST',
    body: input,
    skipAuthRefresh: true,
  });
}

export async function resendOtp(input: ResendOtpInput): Promise<GenericMessageResponse> {
  return apiRequest<GenericMessageResponse>(`${AUTH_BASE}/resend-otp`, {
    method: 'POST',
    body: input,
    skipAuthRefresh: true,
  });
}

export async function login(input: LoginInput): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${AUTH_BASE}/login`, {
    method: 'POST',
    body: input,
    skipAuthRefresh: true,
  });
}

export async function refresh(): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${AUTH_BASE}/refresh`, {
    method: 'POST',
    skipAuthRefresh: true,
  });
}

export async function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>(`${AUTH_BASE}/logout`, {
    method: 'POST',
  });
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<GenericMessageResponse> {
  return apiRequest<GenericMessageResponse>(`${AUTH_BASE}/forgot-password`, {
    method: 'POST',
    body: input,
    skipAuthRefresh: true,
  });
}

export async function resetPassword(input: ResetPasswordInput): Promise<GenericMessageResponse> {
  return apiRequest<GenericMessageResponse>(`${AUTH_BASE}/reset-password`, {
    method: 'POST',
    body: input,
    skipAuthRefresh: true,
  });
}

export async function getCurrentUser(): Promise<AuthSession> {
  return refresh();
}
