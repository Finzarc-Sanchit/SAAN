'use client';

import { cn } from '@/lib/utils';

type ProductSizeSelectorProps = {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  fitNotes: string;
  sizeStock: Record<string, number>;
  onOpenSizeGuide: () => void;
};

export function ProductSizeSelector({
  sizes,
  selectedSize,
  onSelect,
  fitNotes,
  sizeStock,
  onOpenSizeGuide,
}: ProductSizeSelectorProps) {
  const stockForSelected =
    selectedSize && sizeStock[selectedSize] !== undefined
      ? sizeStock[selectedSize]
      : null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-label-caps text-[10px] text-saan-ink/50">
          Size — {selectedSize ?? 'Select'}
        </p>
        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="font-body text-[10px] uppercase tracking-widest text-saan-ink/50 underline underline-offset-2 transition-colors hover:text-saan-maroon"
        >
          Size Guide
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed={selectedSize === size}
            onClick={() => onSelect(size)}
            className={cn(
              'min-h-[40px] min-w-[40px] border px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors',
              selectedSize === size
                ? 'border-saan-charcoal bg-saan-charcoal text-saan-bone'
                : 'border-saan-champagne/80 bg-saan-bone text-saan-ink hover:border-saan-maroon'
            )}
          >
            {size}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-saan-ink/50">
        {stockForSelected !== null && selectedSize !== 'CUSTOM' && (
          <span>
            {stockForSelected} available in {selectedSize}
          </span>
        )}
        {selectedSize === 'CUSTOM' && (
          <span>Made-to-measure — tailored to your measurements</span>
        )}
        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="uppercase tracking-widest underline underline-offset-2 hover:text-saan-maroon"
        >
          Made-to-measure
        </button>
      </div>

      <p className="mt-4 rounded-sm bg-saan-champagne/25 px-4 py-3 font-body text-xs text-saan-maroon">
        <span className="font-medium">Fit Notes:</span> {fitNotes}
      </p>
    </div>
  );
}
