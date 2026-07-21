'use client';

import { type ShopFilterState } from '@/lib/shop-filters';
import { ShopFiltersBody } from '@/components/shop/ShopFiltersBody';

type ShopStickyFiltersProps = {
  filters: ShopFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ShopFilterState>>;
  maxPriceLimit: number;
  resultCount: number;
  availableCategories?: Set<string>;
};

export function ShopStickyFilters({
  filters,
  setFilters,
  maxPriceLimit,
  resultCount,
  availableCategories,
}: ShopStickyFiltersProps) {
  return (
    <aside
      aria-label="Product filters"
      data-lenis-prevent
      className="scrollbar-panel sticky top-[calc(4rem+1px)] max-h-[calc(100svh-5rem)] overflow-y-auto overscroll-contain border border-neutral-300 bg-paper p-6 md:top-[calc(4.5rem+1px)]"
    >
      <ShopFiltersBody
        filters={filters}
        setFilters={setFilters}
        maxPriceLimit={maxPriceLimit}
        resultCount={resultCount}
        availableCategories={availableCategories}
      />
    </aside>
  );
}
