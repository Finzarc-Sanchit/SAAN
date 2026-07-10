'use client';

import { FormEvent } from 'react';
import { CtaButton } from '@/components/ui/CtaButton';
import { NEWSLETTER_COPY } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type NewsletterFormProps = {
  variant?: 'light' | 'dark';
  className?: string;
};

export function NewsletterForm({ variant = 'light', className }: NewsletterFormProps) {
  const isDark = variant === 'dark';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end',
        className
      )}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder={NEWSLETTER_COPY.placeholder}
        className={cn(
          'flex-grow border-b bg-transparent px-2 py-3 focus:outline-none',
          isDark
            ? 'border-saan-bone/30 text-saan-bone placeholder:text-saan-bone/40 focus:border-saan-gold'
            : 'border-saan-gold text-saan-ink placeholder:text-saan-ink/40 focus:border-saan-maroon'
        )}
      />
      <CtaButton
        type="submit"
        variant={isDark ? 'secondary' : 'primary'}
        tone={isDark ? 'light' : 'dark'}
      >
        {NEWSLETTER_COPY.submitLabel}
      </CtaButton>
    </form>
  );
}
