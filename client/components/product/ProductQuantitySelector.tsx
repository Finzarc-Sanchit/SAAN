'use client';

import { Minus, Plus } from 'lucide-react';

type ProductQuantitySelectorProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
};

export function ProductQuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 10,
}: ProductQuantitySelectorProps) {
  return (
    <div className="mt-5">
      <p className="text-ui text-neutral-500">Quantity</p>
      <div className="mt-2 inline-flex items-center border border-neutral-300 bg-paper">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={quantity <= min}
          onClick={() => onChange(Math.max(min, quantity - 1))}
          className="flex size-10 items-center justify-center text-ink transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={1.25} />
        </button>
        <span className="min-w-10 text-center text-body tabular-nums text-ink" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={quantity >= max}
          onClick={() => onChange(Math.min(max, quantity + 1))}
          className="flex size-10 items-center justify-center text-ink transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.25} />
        </button>
      </div>
    </div>
  );
}
