'use client';

import { useState } from 'react';
import { registerFormSchema } from '@/lib/types/auth.schemas';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { AuthPasswordField } from '@/components/auth/AuthPasswordField';
import { useAuth } from '@/components/providers/AuthProvider';
import { CtaButton } from '@/components/ui/CtaButton';
import { Spinner } from '@/components/ui/Spinner';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';
import * as authApi from '@/lib/api/auth';

type RegisterStepProps = {
  onSwitchLogin: () => void;
  idPrefix?: string;
  onRegistered?: (email: string) => void;
  showModeSwitch?: boolean;
};

export function RegisterStep({
  onSwitchLogin,
  idPrefix = 'register',
  onRegistered,
  showModeSwitch = true,
}: RegisterStepProps) {
  const { register, setPendingEmail } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const parsed = registerFormSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

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
      const { confirmPassword: _unused, ...payload } = parsed.data;
      void _unused;

      if (onRegistered) {
        await authApi.register(payload);
        onRegistered(payload.email);
      } else {
        await register(payload);
        setPendingEmail(payload.email);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(getFieldErrors(error));
        setFormError(getApiErrorMessage(error));
      } else {
        setFormError('Unable to create your account right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <AuthFormField
          id={`${idPrefix}-first-name`}
          label="First name"
          value={firstName}
          onChange={setFirstName}
          error={fieldErrors.firstName}
          autoComplete="given-name"
          disabled={isSubmitting}
        />
        <AuthFormField
          id={`${idPrefix}-last-name`}
          label="Last name"
          value={lastName}
          onChange={setLastName}
          error={fieldErrors.lastName}
          autoComplete="family-name"
          disabled={isSubmitting}
        />
      </div>

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

      <AuthPasswordField
        id={`${idPrefix}-password`}
        label="Password"
        value={password}
        onChange={setPassword}
        error={fieldErrors.password}
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      <AuthPasswordField
        id={`${idPrefix}-confirm-password`}
        label="Confirm password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      {formError && (
        <p className="font-body text-sm text-saan-maroon" role="alert">
          {formError}
        </p>
      )}

      <CtaButton type="submit" className="w-full gap-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner className="text-white" />
            Creating account
          </>
        ) : (
          'Create Account'
        )}
      </CtaButton>

      {showModeSwitch && (
        <p className="text-center font-body text-sm text-saan-ink/60">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchLogin}
            className="text-saan-maroon underline-offset-2 hover:underline"
          >
            Sign in
          </button>
        </p>
      )}
    </form>
  );
}
