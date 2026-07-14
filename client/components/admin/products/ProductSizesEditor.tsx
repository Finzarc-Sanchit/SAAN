'use client';

import { Plus, Trash2 } from 'lucide-react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { adminInputClassName } from '@/components/admin/ui/AdminFormField';
import type { GarmentSize } from '@/lib/types/size';
import type { ProductSizeInput } from '@/lib/types/product';

type ProductSizesEditorProps = {
  catalogSizes: GarmentSize[];
  value: ProductSizeInput[];
  onChange: (value: ProductSizeInput[]) => void;
  error?: string;
  disabled?: boolean;
};

export function ProductSizesEditor({
  catalogSizes,
  value,
  onChange,
  error,
  disabled,
}: ProductSizesEditorProps) {
  const totalStock = value.reduce((sum, row) => sum + (Number.isFinite(row.quantity) ? row.quantity : 0), 0);
  const usedSizeIds = new Set(value.map((row) => row.sizeId).filter(Boolean));

  function updateRow(index: number, patch: Partial<ProductSizeInput>) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    const next = catalogSizes.find((size) => !usedSizeIds.has(size.sizeId));
    onChange([
      ...value,
      {
        sizeId: next?.sizeId ?? '',
        quantity: 0,
      },
    ]);
  }

  function removeRow(index: number) {
    if (value.length <= 1) return;
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-saan-charcoal dark:text-saan-bone">Sizes</h3>
          <p className="mt-1 font-body text-xs text-saan-ink/50 dark:text-saan-bone/50">
            Pick from the size catalog. Total stock (display only):{' '}
            <span className="tabular-nums font-medium text-saan-charcoal dark:text-saan-bone">
              {totalStock}
            </span>
          </p>
        </div>
        <AdminButton type="button" variant="secondary" onClick={addRow} disabled={disabled}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add size
        </AdminButton>
      </div>

      <div className="space-y-2">
        {value.map((row, index) => (
          <div
            key={`size-row-${index}`}
            className="grid grid-cols-[1fr_7rem_auto] items-end gap-2 sm:grid-cols-[1fr_8rem_auto]"
          >
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-saan-bone/55">
                Size
              </label>
              <select
                value={row.sizeId}
                onChange={(e) => updateRow(index, { sizeId: e.target.value })}
                className={adminInputClassName}
                disabled={disabled}
              >
                <option value="">Select size</option>
                {catalogSizes.map((size) => {
                  const taken =
                    usedSizeIds.has(size.sizeId) && size.sizeId !== row.sizeId;
                  return (
                    <option key={size.id} value={size.sizeId} disabled={taken}>
                      {size.label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-saan-bone/55">
                Qty
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={row.quantity}
                onChange={(e) =>
                  updateRow(index, { quantity: Math.max(0, Number(e.target.value) || 0) })
                }
                className={adminInputClassName}
                disabled={disabled}
              />
            </div>
            <AdminButton
              type="button"
              variant="danger"
              className="px-2.5 py-2.5"
              onClick={() => removeRow(index)}
              disabled={disabled || value.length <= 1}
              aria-label="Remove size row"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </AdminButton>
          </div>
        ))}
      </div>

      {error ? (
        <p className="font-body text-xs text-saan-maroon dark:text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
