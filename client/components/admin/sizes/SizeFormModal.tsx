'use client';

import { useEffect, useId, useState } from 'react';
import { ModalShell } from '@/components/ui/ModalShell';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import {
  AdminFormField,
  adminInputClassName,
} from '@/components/admin/ui/AdminFormField';
import { sizeFormSchema, type GarmentSize, type SizeFormValues } from '@/lib/types/size';

type SizeFormModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initial?: GarmentSize | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: SizeFormValues) => void | Promise<void>;
};

export function SizeFormModal({
  isOpen,
  mode,
  initial,
  isSubmitting = false,
  onClose,
  onSubmit,
}: SizeFormModalProps) {
  const labelId = useId();
  const sortOrderId = useId();
  const [label, setLabel] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [errors, setErrors] = useState<{ label?: string; sortOrder?: string }>({});

  useEffect(() => {
    if (!isOpen) return;
    setLabel(initial?.label ?? '');
    setSortOrder(
      initial?.sortOrder !== undefined && initial?.sortOrder !== null
        ? String(initial.sortOrder)
        : '',
    );
    setErrors({});
  }, [isOpen, initial]);

  const title = mode === 'create' ? 'Add Size' : 'Edit Size';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let parsedSortOrder: number | undefined;
    if (sortOrder.trim() !== '') {
      const n = Number(sortOrder);
      if (!Number.isInteger(n) || n < 0) {
        setErrors({ sortOrder: 'Sort order must be a whole number ≥ 0' });
        return;
      }
      parsedSortOrder = n;
    }

    const parsed = sizeFormSchema.safeParse({
      label,
      sortOrder: parsedSortOrder,
    });

    if (!parsed.success) {
      const next: { label?: string; sortOrder?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === 'label' || key === 'sortOrder') {
          next[key] = issue.message;
        }
      }
      setErrors(next);
      return;
    }

    setErrors({});
    await onSubmit(parsed.data);
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={title} panelClassName="dark:bg-[#161916]">
      <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
        <AdminFormField
          label="Label"
          htmlFor={labelId}
          error={errors.label}
          hint="Alphanumeric only (e.g. S, M, XL, 28). Stored uppercase."
        >
          <input
            id={labelId}
            name="label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              setErrors((prev) => ({ ...prev, label: undefined }));
            }}
            className={adminInputClassName}
            autoComplete="off"
            maxLength={32}
            required
            disabled={isSubmitting}
          />
        </AdminFormField>

        <AdminFormField
          label="Sort order"
          htmlFor={sortOrderId}
          error={errors.sortOrder}
          hint="Optional. Lower values appear first in pickers."
        >
          <input
            id={sortOrderId}
            name="sortOrder"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value);
              setErrors((prev) => ({ ...prev, sortOrder: undefined }));
            }}
            className={adminInputClassName}
            disabled={isSubmitting}
          />
        </AdminFormField>

        {mode === 'edit' && initial ? (
          <p className="font-body text-xs text-saan-ink/45 dark:text-saan-bone/45">
            Catalog ID: <code className="font-mono">{initial.sizeId}</code>
          </p>
        ) : null}

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
