'use client';

import { useState } from 'react';
import { forgotPasswordSchema } from '@/lib/types/auth.schemas';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { CtaButton } from '@/components/ui/CtaButton';
import { Spinner } from '@/components/ui/Spinner';
import * as authApi from '@/lib/api/auth';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';

type ForgotPasswordStepProps = {
  onBack: () => void;
  onSent: () => void;
};

export function ForgotPasswordStep({ onBack, onSent }: ForgotPasswordStepProps) {
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
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
      await authApi.forgotPassword(parsed.data);
      onSent();
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(getFieldErrors(error));
        setFormError(getApiErrorMessage(error));
      } else {
        setFormError('Unable to process your request right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-center font-body text-sm leading-relaxed text-saan-ink/60">
        Enter your email and we&apos;ll send reset instructions if an account exists.
      </p>

      <AuthFormField
        id="forgot-email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={fieldErrors.email}
        placeholder="your@email.com"
        autoComplete="email"
        disabled={isSubmitting}
      />

      {formError && (
        <p className="font-body text-sm text-ink" role="alert">
          {formError}
        </p>
      )}

      <CtaButton type="submit" className="w-full gap-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner className="text-white" />
            Sending
          </>
        ) : (
          'Send reset link'
        )}
      </CtaButton>

      <button
        type="button"
        onClick={onBack}
        className="text-label-caps mx-auto block text-saan-ink/50 hover:text-ink"
      >
        Back to sign in
      </button>
    </form>
  );
}
