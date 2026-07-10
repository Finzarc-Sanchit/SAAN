'use client';

import { useState } from 'react';
import { loginSchema } from '@/lib/types/auth.schemas';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { AuthPasswordField } from '@/components/auth/AuthPasswordField';
import { useAuth } from '@/components/providers/AuthProvider';
import { CtaButton } from '@/components/ui/CtaButton';
import { Spinner } from '@/components/ui/Spinner';
import * as authApi from '@/lib/api/auth';
import { ApiError, getApiErrorMessage, isUnverifiedLoginError } from '@/lib/api/errors';

type LoginStepProps = {
  onSwitchRegister: () => void;
  onForgotPassword: () => void;
  idPrefix?: string;
  onSuccess?: () => void;
  onResendVerification?: (email: string) => void;
  showModeSwitch?: boolean;
};

export function LoginStep({
  onSwitchRegister,
  onForgotPassword,
  idPrefix = 'login',
  onSuccess,
  onResendVerification,
  showModeSwitch = true,
}: LoginStepProps) {
  const { login, setDialogStep } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setShowResend(false);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString() ?? '_form';
        errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await login(parsed.data);
      onSuccess?.();
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(getApiErrorMessage(error));
        setShowResend(isUnverifiedLoginError(error));
      } else {
        setFormError('Unable to sign in right now. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setFormError(null);

    try {
      await authApi.resendOtp({ email });

      if (onResendVerification) {
        onResendVerification(email);
      } else {
        setDialogStep('verify-otp');
      }
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : 'Unable to resend verification code.',
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AuthFormField
        id={`${idPrefix}-email`}
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={fieldErrors.email}
        placeholder="your@email.com"
        autoComplete="email"
        disabled={isSubmitting}
      />

      <div>
        <AuthPasswordField
          id={`${idPrefix}-password`}
          label="Password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="current-password"
          disabled={isSubmitting}
        />
        <button
          type="button"
          onClick={onForgotPassword}
          className="mt-3 font-body text-xs text-saan-ink/60 underline-offset-2 hover:text-saan-maroon hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {formError && (
        <div className="rounded-sm border border-saan-maroon/20 bg-saan-maroon/5 px-4 py-3" role="alert">
          <p className="font-body text-sm text-saan-maroon">{formError}</p>
          {showResend && (
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={isResending}
              className="text-label-caps mt-3 text-saan-maroon underline-offset-2 hover:underline disabled:opacity-50"
            >
              {isResending ? 'Sending…' : 'Resend verification code'}
            </button>
          )}
        </div>
      )}

      <CtaButton type="submit" className="w-full gap-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner className="text-white" />
            Signing in
          </>
        ) : (
          'Sign In'
        )}
      </CtaButton>

      {showModeSwitch && (
        <p className="text-center font-body text-sm text-saan-ink/60">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchRegister}
            className="text-saan-maroon underline-offset-2 hover:underline"
          >
            Register
          </button>
        </p>
      )}
    </form>
  );
}
