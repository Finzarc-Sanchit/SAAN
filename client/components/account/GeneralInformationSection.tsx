'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import { formatAccountDate } from '@/lib/account-format';
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/lib/types/auth.schemas';
import type { User } from '@/lib/types/auth';
import { ACCOUNT_CONTENT_PADDING } from '@/lib/account-ui';

type GeneralInformationSectionProps = {
  user: User;
  updateProfile: (input: UpdateProfileInput) => Promise<User>;
};

const inputClassName =
  'mt-2 h-12 w-full border border-neutral-200 bg-paper px-4 text-body text-ink outline-none transition-colors placeholder:text-neutral-500 focus:border-[#2874f0] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500';

function createProfileForm(user: User): UpdateProfileInput {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    mobileNumber: user.mobileNumber ?? '',
    dateOfBirth: user.dateOfBirth?.slice(0, 10) ?? '',
  };
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-neutral-200 py-6 first:pt-0 last:border-b-0 last:pb-0 sm:py-7">
      <dt className="text-ui text-neutral-500">{label}</dt>
      <dd className="mt-3 break-words text-body-medium text-ink">{value}</dd>
    </div>
  );
}

export function GeneralInformationSection({
  user,
  updateProfile,
}: GeneralInformationSectionProps) {
  const [form, setForm] = useState<UpdateProfileInput>(() => createProfileForm(user));
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdateProfileInput, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setForm(createProfileForm(user));
  }, [
    user.dateOfBirth,
    user.firstName,
    user.lastName,
    user.mobileNumber,
  ]);

  function updateField(field: keyof UpdateProfileInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
    setIsSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = updateProfileSchema.safeParse(form);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof UpdateProfileInput, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (
          field === 'firstName' ||
          field === 'lastName' ||
          field === 'mobileNumber' ||
          field === 'dateOfBirth'
        ) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSaving(true);
    setIsSaved(false);

    try {
      await updateProfile(parsed.data);
      setIsSaved(true);
      setIsEditing(false);
    } catch (error: unknown) {
      setSubmitError(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : 'We could not update your details. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  function cancelEditing() {
    setForm(createProfileForm(user));
    setErrors({});
    setSubmitError(null);
    setIsEditing(false);
  }

  return (
    <section
      id="general-information"
      aria-labelledby="general-information-heading"
      className={`scroll-mt-28 ${ACCOUNT_CONTENT_PADDING}`}
    >
      <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:items-start lg:gap-16 xl:gap-20">
        <div className="lg:pt-2">
          <h2
            id="general-information-heading"
            className="text-[clamp(1.35rem,4vw,1.75rem)] font-medium leading-tight text-ink sm:text-[1.5rem]"
          >
            General information
          </h2>
          <p className="mt-4 max-w-md text-body leading-relaxed text-neutral-700">
            Keep your personal details current for a smoother checkout experience.
          </p>
          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                cancelEditing();
              } else {
                setIsSaved(false);
                setIsEditing(true);
              }
            }}
            className="mt-8 inline-flex min-h-11 w-full items-center justify-center border border-ink px-6 text-ui uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:mt-10 lg:w-auto"
          >
            {isEditing ? 'Cancel editing' : 'Edit information'}
          </button>
        </div>

        <div className="min-w-0">
          {isEditing ? (
            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-ui text-neutral-700">First name</span>
                  <input
                    value={form.firstName}
                    onChange={(event) => updateField('firstName', event.target.value)}
                    autoComplete="given-name"
                    className={inputClassName}
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={
                      errors.firstName ? 'profile-first-name-error' : undefined
                    }
                  />
                  {errors.firstName && (
                    <span
                      id="profile-first-name-error"
                      className="mt-1.5 block text-caption text-red-700"
                    >
                      {errors.firstName}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="text-ui text-neutral-700">Last name</span>
                  <input
                    value={form.lastName}
                    onChange={(event) => updateField('lastName', event.target.value)}
                    autoComplete="family-name"
                    className={inputClassName}
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={
                      errors.lastName ? 'profile-last-name-error' : undefined
                    }
                  />
                  {errors.lastName && (
                    <span
                      id="profile-last-name-error"
                      className="mt-1.5 block text-caption text-red-700"
                    >
                      {errors.lastName}
                    </span>
                  )}
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-ui text-neutral-700">Email address</span>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="text-ui text-neutral-700">Mobile number</span>
                  <input
                    type="tel"
                    value={form.mobileNumber ?? ''}
                    onChange={(event) =>
                      updateField('mobileNumber', event.target.value)
                    }
                    autoComplete="tel"
                    placeholder="+91 00000 00000"
                    className={inputClassName}
                    aria-invalid={Boolean(errors.mobileNumber)}
                    aria-describedby={
                      errors.mobileNumber
                        ? 'profile-mobile-number-error'
                        : undefined
                    }
                  />
                  {errors.mobileNumber && (
                    <span
                      id="profile-mobile-number-error"
                      className="mt-1.5 block text-caption text-red-700"
                    >
                      {errors.mobileNumber}
                    </span>
                  )}
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-ui text-neutral-700">Date of birth</span>
                  <input
                    type="date"
                    value={form.dateOfBirth ?? ''}
                    onChange={(event) =>
                      updateField('dateOfBirth', event.target.value)
                    }
                    max={new Date().toISOString().slice(0, 10)}
                    autoComplete="bday"
                    className={inputClassName}
                    aria-invalid={Boolean(errors.dateOfBirth)}
                    aria-describedby={
                      errors.dateOfBirth
                        ? 'profile-date-of-birth-error'
                        : undefined
                    }
                  />
                  {errors.dateOfBirth && (
                    <span
                      id="profile-date-of-birth-error"
                      className="mt-1.5 block text-caption text-red-700"
                    >
                      {errors.dateOfBirth}
                    </span>
                  )}
                </label>
              </div>

              {submitError && (
                <p role="alert" className="text-body text-red-700">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-11 w-full items-center justify-center bg-[#2874f0] px-6 text-ui text-paper transition-colors hover:bg-[#1f63d3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2874f0] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          ) : (
            <div>
              {isSaved && (
                <p
                  role="status"
                  className="mb-6 flex items-center gap-2 text-body text-neutral-700"
                >
                  <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  Details updated
                </p>
              )}
              <dl className="grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:gap-x-12">
                <ProfileField label="First name" value={user.firstName} />
                <ProfileField label="Last name" value={user.lastName} />
                <ProfileField label="Email address" value={user.email} />
                <ProfileField
                  label="Mobile number"
                  value={user.mobileNumber || 'Not provided'}
                />
                <ProfileField
                  label="Date of birth"
                  value={
                    user.dateOfBirth
                      ? formatAccountDate(user.dateOfBirth)
                      : 'Not provided'
                  }
                />
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
