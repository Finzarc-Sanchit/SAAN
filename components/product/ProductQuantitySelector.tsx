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
      <p className="text-label-caps text-[10px] text-saan-ink/50">Quantity</p>
      <div className="mt-2 inline-flex items-center border border-saan-champagne/60 bg-saan-bone/80">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={quantity <= min}
          onClick={() => onChange(Math.max(min, quantity - 1))}
          className="flex h-9 w-9 items-center justify-center text-saan-ink transition-colors hover:bg-saan-champagne/25 disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={1.25} />
        </button>
        <span className="min-w-[2rem] text-center font-body text-sm tabular-nums text-saan-charcoal">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={quantity >= max}
          onClick={() => onChange(Math.min(max, quantity + 1))}
          className="flex h-9 w-9 items-center justify-center text-saan-ink transition-colors hover:bg-saan-champagne/25 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.25} />
        </button>
      </div>
    </div>
  );
}
