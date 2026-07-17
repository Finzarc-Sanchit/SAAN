'use client';

import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { SHOP_SORT_OPTIONS } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type ShopToolbarProps = {
  onOpenFilters: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  activeFiltersCount: number;
};

export function ShopToolbar({
  onOpenFilters,
  sortBy,
  onSortChange,
  activeFiltersCount,
}: ShopToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-saan-champagne/40 pb-5 pt-2">
      {/* Filter Button */}
      <button
        type="button"
        onClick={onOpenFilters}
        className={cn(
          'flex items-center gap-2.5 border border-saan-champagne bg-white px-5 py-3 text-label-caps text-xs tracking-[0.15em] transition-all duration-300 hover:border-saan-maroon hover:text-ink'
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span>Filter</span>
        {activeFiltersCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-saan-maroon text-[10px] font-bold text-white leading-none">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Sort Dropdown */}
      <div className="relative flex items-center">
        <label htmlFor="sort-by" className="sr-only">
          Sort by
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className={cn(
            'appearance-none rounded-none border border-saan-champagne bg-white py-3 pl-5 pr-10 text-label-caps text-xs tracking-[0.15em] text-saan-ink focus:border-saan-maroon focus:outline-none transition-colors cursor-pointer'
          )}
        >
          {SHOP_SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 h-3.5 w-3.5 text-saan-ink/50"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
}
