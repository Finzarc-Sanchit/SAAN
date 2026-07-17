'use client';

import { FormEvent, useState } from 'react';
import { CtaButton } from '@/components/ui/CtaButton';
import { Spinner } from '@/components/ui/Spinner';
import { CONTACT_COPY } from '@/lib/site-content';
import { submitContact } from '@/lib/api/contacts';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';
import {
  contactFormSchema,
  type ContactFormValues,
} from '@/lib/types/contact.schemas';
import { cn } from '@/lib/utils';

const fieldClassName =
  'w-full border-b border-neutral-500 bg-transparent py-3 text-body text-ink placeholder:text-neutral-500 focus:border-ink focus:outline-none';

const initialValues: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField<K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSuccess(false);
    setSubmitError(null);

    const parsed = contactFormSchema.safeParse(values);
    if (!parsed.success) {
      const errors: Partial<Record<keyof ContactFormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          errors[field as keyof ContactFormValues] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await submitContact(parsed.data);
      setIsSuccess(true);
      setValues(initialValues);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const serverFieldErrors = getFieldErrors(error);
        setFieldErrors(serverFieldErrors as Partial<Record<keyof ContactFormValues, string>>);
        setSubmitError(getApiErrorMessage(error));
      } else {
        setSubmitError('We could not send your message. Please try again shortly.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <FormField
          id="contact-name"
          label="Name"
          value={values.name}
          onChange={(value) => updateField('name', value)}
          error={fieldErrors.name}
          autoComplete="name"
          disabled={isSubmitting}
          maxLength={120}
        />
        <FormField
          id="contact-email"
          label="Email"
          type="email"
          value={values.email}
          onChange={(value) => updateField('email', value)}
          error={fieldErrors.email}
          autoComplete="email"
          disabled={isSubmitting}
          maxLength={254}
        />
        <FormField
          id="contact-phone"
          label="Phone Number"
          type="tel"
          value={values.phone}
          onChange={(value) => updateField('phone', value)}
          error={fieldErrors.phone}
          autoComplete="tel"
          disabled={isSubmitting}
          maxLength={20}
        />
        <FormField
          id="contact-subject"
          label="Subject"
          value={values.subject}
          onChange={(value) => updateField('subject', value)}
          error={fieldErrors.subject}
          disabled={isSubmitting}
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-ui mb-2 block text-ink">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={values.message}
          onChange={(event) => updateField('message', event.target.value)}
          disabled={isSubmitting}
          maxLength={5000}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
          className={cn(fieldClassName, 'resize-y', fieldErrors.message && 'border-error')}
        />
        {fieldErrors.message && (
          <p id="contact-message-error" className="text-caption mt-2 text-error" role="alert">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {isSuccess && (
        <p className="text-body text-neutral-700" role="status">
          {CONTACT_COPY.form.successMessage}
        </p>
      )}
      {submitError && (
        <p className="text-body text-error" role="alert">
          {submitError}
        </p>
      )}

      <CtaButton type="submit" disabled={isSubmitting} className="min-w-[12rem] gap-2">
        {isSubmitting ? (
          <>
            <Spinner />
            Sending
          </>
        ) : (
          CONTACT_COPY.form.submitLabel
        )}
      </CtaButton>
    </form>
  );
}

function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  autoComplete,
  disabled,
  maxLength,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-ui mb-2 block text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(fieldClassName, error && 'border-error')}
      />
      {error && (
        <p id={`${id}-error`} className="text-caption mt-2 text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
