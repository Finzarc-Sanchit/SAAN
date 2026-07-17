'use client';

import { useEffect, useId, useState } from 'react';
import { ModalShell } from '@/components/ui/ModalShell';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import {
  AdminFormField,
  adminInputClassName,
} from '@/components/admin/ui/AdminFormField';
import type { Product } from '@/lib/types/product';

type AdjustStockModalProps = {
  isOpen: boolean;
  product: Product | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onAdjust: (sizeId: string, quantityDelta: number) => void | Promise<void>;
};

export function AdjustStockModal({
  isOpen,
  product,
  isSubmitting = false,
  onClose,
  onAdjust,
}: AdjustStockModalProps) {
  const sizeIdField = useId();
  const deltaId = useId();
  const [sizeId, setSizeId] = useState('');
  const [delta, setDelta] = useState('1');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!isOpen || !product) return;
    setSizeId(product.sizes[0]?.sizeId ?? '');
    setDelta('1');
    setError(undefined);
  }, [isOpen, product]);

  const selected = product?.sizes.find((s) => s.sizeId === sizeId);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const quantityDelta = Number(delta);
    if (!sizeId) {
      setError('Select a size');
      return;
    }
    if (!Number.isInteger(quantityDelta) || quantityDelta === 0) {
      setError('Enter a non-zero whole number delta');
      return;
    }
    setError(undefined);
    await onAdjust(sizeId, quantityDelta);
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust stock"
      panelClassName="dark:bg-[#161916]"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
        <p className="font-body text-sm text-saan-ink/70 dark:text-paper/70">
          {product?.name}
        </p>

        <AdminFormField label="Size" htmlFor={sizeIdField}>
          <select
            id={sizeIdField}
            value={sizeId}
            onChange={(e) => setSizeId(e.target.value)}
            className={adminInputClassName}
            disabled={isSubmitting}
          >
            {product?.sizes.map((size) => (
              <option key={size.sizeId} value={size.sizeId}>
                {size.size} — qty {size.quantity}
              </option>
            ))}
          </select>
        </AdminFormField>

        <AdminFormField
          label="Quantity delta"
          htmlFor={deltaId}
          error={error}
          hint={
            selected
              ? `Current: ${selected.quantity}. Positive adds stock, negative removes.`
              : undefined
          }
        >
          <input
            id={deltaId}
            type="number"
            step={1}
            value={delta}
            onChange={(e) => {
              setDelta(e.target.value);
              setError(undefined);
            }}
            className={adminInputClassName}
            disabled={isSubmitting}
          />
        </AdminFormField>

        <div className="flex flex-wrap gap-2">
          <AdminButton
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => setDelta((d) => String((Number(d) || 0) - 1))}
          >
            −1
          </AdminButton>
          <AdminButton
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => setDelta((d) => String((Number(d) || 0) + 1))}
          >
            +1
          </AdminButton>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <AdminButton type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" isLoading={isSubmitting}>
            Apply
          </AdminButton>
        </div>
      </form>
    </ModalShell>
  );
}
