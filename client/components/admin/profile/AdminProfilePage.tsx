'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard, AdminInlineError } from '@/components/admin/ui/AdminCard';
import { AdminFormField, adminInputClassName } from '@/components/admin/ui/AdminFormField';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/types/auth.schemas';

export function AdminProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useAdminToast();
  const [form, setForm] = useState<UpdateProfileInput>({
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfileInput, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }, [user]);

  if (!user) {
    return (
      <AdminCard>
        <AdminInlineError message="Could not load your profile." />
      </AdminCard>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = updateProfileSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof UpdateProfileInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'firstName' || field === 'lastName') {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);
    try {
      await updateProfile(parsed.data);
      toast('Profile updated');
    } catch (error) {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not update profile',
        'error',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-saan-bone/45">
          Account
        </p>
        <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-saan-bone md:text-3xl">
          Edit profile
        </h1>
      </div>

      <AdminCard className="max-w-xl">
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
          <AdminFormField label="Email" htmlFor="profile-email" hint="Email cannot be changed here.">
            <input
              id="profile-email"
              type="email"
              value={user.email}
              disabled
              className={adminInputClassName}
            />
          </AdminFormField>

          <AdminFormField
            label="First name"
            htmlFor="profile-first-name"
            error={errors.firstName}
          >
            <input
              id="profile-first-name"
              value={form.firstName}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, firstName: event.target.value }));
                if (errors.firstName) {
                  setErrors((prev) => ({ ...prev, firstName: undefined }));
                }
              }}
              autoComplete="given-name"
              className={adminInputClassName}
            />
          </AdminFormField>

          <AdminFormField label="Last name" htmlFor="profile-last-name" error={errors.lastName}>
            <input
              id="profile-last-name"
              value={form.lastName}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, lastName: event.target.value }));
                if (errors.lastName) {
                  setErrors((prev) => ({ ...prev, lastName: undefined }));
                }
              }}
              autoComplete="family-name"
              className={adminInputClassName}
            />
          </AdminFormField>

          <div className="flex justify-end border-t border-saan-champagne/50 pt-5 dark:border-white/10">
            <AdminButton type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save changes'}
            </AdminButton>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}
