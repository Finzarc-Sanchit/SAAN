'use client';

import { FormEvent, useId, useState } from 'react';
import { CtaButton } from '@/components/ui/CtaButton';
import { Spinner } from '@/components/ui/Spinner';
import { subscribeToNewsletter } from '@/lib/api/newsletter';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import { NEWSLETTER_COPY } from '@/lib/site-content';
import {
  newsletterSubscribeSchema,
  type NewsletterSource,
} from '@/lib/types/newsletter.schemas';
import { cn } from '@/lib/utils';

type NewsletterFormProps = {
  variant?: 'light' | 'dark';
  className?: string;
  source?: NewsletterSource;
};

export function NewsletterForm({
  variant = 'light',
  className,
  source = 'other',
}: NewsletterFormProps) {
  const isDark = variant === 'dark';
  const emailId = useId();
  const feedbackId = useId();
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setFeedback(null);
    const parsed = newsletterSubscribeSchema.safeParse({ email, source });

    if (!parsed.success) {
      setFeedback({
        tone: 'error',
        message: parsed.error.issues[0]?.message ?? 'Please enter a valid email address',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await subscribeToNewsletter(parsed.data);
      setEmail('');
      setFeedback({
        tone: 'success',
        message: response.message,
      });
    } catch (error: unknown) {
      setFeedback({
        tone: 'error',
        message:
          error instanceof ApiError
            ? getApiErrorMessage(error)
            : 'We could not complete your subscription. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label htmlFor={emailId} className="sr-only">
          Email address
        </label>
        <input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (feedback) setFeedback(null);
          }}
          disabled={isSubmitting}
          aria-invalid={feedback?.tone === 'error'}
          aria-describedby={feedback ? feedbackId : undefined}
          placeholder={NEWSLETTER_COPY.placeholder}
          className={cn(
            'flex-grow border-0 border-b bg-transparent px-2 py-3 transition-colors duration-300 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
            isDark
              ? 'border-paper/30 text-paper placeholder:text-paper/40 hover:border-paper/70 focus:border-paper focus-visible:border-paper'
              : 'border-neutral-500 text-ink placeholder:text-neutral-500 focus:border-ink focus-visible:border-ink',
          )}
        />
        <CtaButton
          type="submit"
          variant={isDark ? 'secondary' : 'primary'}
          tone={isDark ? 'light' : 'dark'}
          disabled={isSubmitting}
          className={cn(
            'gap-2',
            isDark &&
              'transition-[transform,letter-spacing,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-white hover:text-white hover:tracking-[0.16em] hover:shadow-[0_8px_24px_rgba(255,255,255,0.08)] focus-visible:border-white focus-visible:text-white motion-reduce:hover:translate-y-0',
          )}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              Joining
            </>
          ) : (
            NEWSLETTER_COPY.submitLabel
          )}
        </CtaButton>
      </div>
      <p
        id={feedbackId}
        role={feedback?.tone === 'error' ? 'alert' : 'status'}
        aria-live="polite"
        className={cn(
          'mt-3 min-h-5 text-sm',
          feedback?.tone === 'error'
            ? isDark
              ? 'text-red-200'
              : 'text-error'
            : isDark
              ? 'text-paper/75'
              : 'text-neutral-700',
        )}
      >
        {feedback?.message}
      </p>
    </form>
  );
}
