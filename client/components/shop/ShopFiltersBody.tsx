'use client';

import { type ShopFilterState } from '@/lib/shop-filters';
import {
  ShopFilterPanels,
  ShopFilterResetButton,
} from '@/components/shop/ShopFilterPanels';

type ShopFiltersBodyProps = {
  filters: ShopFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ShopFilterState>>;
  maxPriceLimit: number;
  resultCount: number;
  availableCategories?: Set<string>;
  headerAction?: React.ReactNode;
};

export function ShopFiltersBody({
  filters,
  setFilters,
  maxPriceLimit,
  resultCount,
  availableCategories,
  headerAction,
}: ShopFiltersBodyProps) {
  const handleReset = () => {
    setFilters({
      category: 'all',
      occasion: 'all',
      maxPrice: maxPriceLimit,
    });
  };

  return (
    <>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <p className="text-ui text-ink">Filter</p>
        <div className="flex items-center gap-3">
          <p className="text-caption text-neutral-500">
            {resultCount} {resultCount === 1 ? 'piece' : 'pieces'}
          </p>
          {headerAction}
        </div>
      </div>

      <ShopFilterPanels
        filters={filters}
        setFilters={setFilters}
        maxPriceLimit={maxPriceLimit}
        availableCategories={availableCategories}
      />

      <ShopFilterResetButton onReset={handleReset} className="mt-8" />
    </>
  );
}
