'use client';

import { useEffect, useId, useState } from 'react';
import { ModalShell } from '@/components/ui/ModalShell';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import {
  AdminFormField,
  adminInputClassName,
} from '@/components/admin/ui/AdminFormField';
import { dateInputToIso, toDateInputValue } from '@/lib/admin/date-range-status';
import {
  discountFormSchema,
  type Discount,
  type DiscountFormValues,
  type DiscountType,
} from '@/lib/types/discount';

type DiscountFormModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initial?: Discount | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: DiscountFormValues) => void | Promise<void>;
};

type FieldErrors = Partial<Record<keyof DiscountFormValues, string>>;

function emptyForm(): {
  type: DiscountType;
  value: string;
  validFrom: string;
  validTo: string;
} {
  return {
    type: 'percentage',
    value: '',
    validFrom: '',
    validTo: '',
  };
}

export function DiscountFormModal({
  isOpen,
  mode,
  initial,
  isSubmitting = false,
  onClose,
  onSubmit,
}: DiscountFormModalProps) {
  const typeId = useId();
  const valueId = useId();
  const validFromId = useId();
  const validToId = useId();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      initial
        ? {
            type: initial.type,
            value: String(initial.value),
            validFrom: toDateInputValue(initial.validFrom),
            validTo: toDateInputValue(initial.validTo),
          }
        : emptyForm(),
    );
    setErrors({});
  }, [isOpen, initial]);

  const title = mode === 'create' ? 'Add Discount' : 'Edit Discount';
  const valueLabel = form.type === 'percentage' ? 'Value (%)' : 'Value (₹)';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValue = Number(form.value);
    const parsed = discountFormSchema.safeParse({
      type: form.type,
      value: parsedValue,
      validFrom: form.validFrom ? dateInputToIso(form.validFrom) : '',
      validTo: form.validTo ? dateInputToIso(form.validTo) : '',
    });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === 'type' || key === 'value' || key === 'validFrom' || key === 'validTo') {
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
        <AdminFormField label="Type" htmlFor={typeId} error={errors.type}>
          <select
            id={typeId}
            name="type"
            value={form.type}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, type: event.target.value as DiscountType }));
              setErrors((prev) => ({ ...prev, type: undefined }));
            }}
            className={adminInputClassName}
            disabled={isSubmitting}
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat amount</option>
          </select>
        </AdminFormField>

        <AdminFormField label={valueLabel} htmlFor={valueId} error={errors.value}>
          <input
            id={valueId}
            name="value"
            type="number"
            inputMode="decimal"
            min={0}
            step={form.type === 'percentage' ? 1 : 0.01}
            value={form.value}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, value: event.target.value }));
              setErrors((prev) => ({ ...prev, value: undefined }));
            }}
            className={adminInputClassName}
            required
            disabled={isSubmitting}
          />
        </AdminFormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminFormField label="Valid from" htmlFor={validFromId} error={errors.validFrom}>
            <input
              id={validFromId}
              name="validFrom"
              type="date"
              value={form.validFrom}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, validFrom: event.target.value }));
                setErrors((prev) => ({ ...prev, validFrom: undefined, validTo: undefined }));
              }}
              className={adminInputClassName}
              required
              disabled={isSubmitting}
            />
          </AdminFormField>

          <AdminFormField label="Valid to" htmlFor={validToId} error={errors.validTo}>
            <input
              id={validToId}
              name="validTo"
              type="date"
              value={form.validTo}
              min={form.validFrom || undefined}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, validTo: event.target.value }));
                setErrors((prev) => ({ ...prev, validTo: undefined }));
              }}
              className={adminInputClassName}
              required
              disabled={isSubmitting}
            />
          </AdminFormField>
        </div>

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
