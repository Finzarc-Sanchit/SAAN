'use client';

import { useEffect, useId, useState } from 'react';
import { ModalShell } from '@/components/ui/ModalShell';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import {
  AdminFormField,
  adminInputClassName,
} from '@/components/admin/ui/AdminFormField';
import { categoryFormSchema, type Category } from '@/lib/types/category';

type CategoryFormModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initial?: Category | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string }) => void | Promise<void>;
};

export function CategoryFormModal({
  isOpen,
  mode,
  initial,
  isSubmitting = false,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const nameId = useId();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!isOpen) return;
    setName(initial?.name ?? '');
    setError(undefined);
  }, [isOpen, initial]);

  const title = mode === 'create' ? 'Add Category' : 'Edit Category';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = categoryFormSchema.safeParse({ name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid name');
      return;
    }

    setError(undefined);
    await onSubmit({ name: parsed.data.name });
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={title} panelClassName="dark:bg-[#161916]">
      <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
        <AdminFormField label="Name" htmlFor={nameId} error={error}>
          <input
            id={nameId}
            name="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(undefined);
            }}
            className={adminInputClassName}
            autoComplete="off"
            maxLength={200}
            required
            disabled={isSubmitting}
          />
        </AdminFormField>

        <div className="flex justify-end gap-2 pt-2">
          <AdminButton type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" isLoading={isSubmitting}>
            {mode === 'create' ? 'Create' : 'Save changes'}
          </AdminButton>
        </div>
      </form>
    </ModalShell>
  );
}
