"use client";

import { cn } from "@/lib/utils";

type ProductSizeSelectorProps = {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  onOpenSizeGuide: () => void;
};

export function ProductSizeSelector({
  sizes,
  selectedSize,
  onSelect,
  onOpenSizeGuide,
}: ProductSizeSelectorProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-ui text-neutral-500">Size</p>
        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="link-underline text-body-medium text-ink"
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
              "min-h-[40px] min-w-[40px] border px-3 py-2 text-ui transition-colors",
              selectedSize === size
                ? "border-ink bg-ink text-paper"
                : "border-neutral-300 bg-paper text-ink hover:border-ink",
            )}
          >
            {size}
          </button>
        ))}
      </div>

    </div>
  );
}
