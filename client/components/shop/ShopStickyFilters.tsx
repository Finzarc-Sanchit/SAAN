'use client';

import { type ShopFilterState } from '@/lib/shop-filters';
import {
  SHOP_CATEGORY_FILTERS,
  SHOP_OCCASION_FILTERS,
  formatPrice,
} from '@/lib/site-content';
import { cn } from '@/lib/utils';

type ShopStickyFiltersProps = {
  filters: ShopFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ShopFilterState>>;
  maxPriceLimit: number;
  resultCount: number;
  availableCategories?: Set<string>;
};

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-ui text-neutral-500">{title}</legend>
      {children}
    </fieldset>
  );
}

function RadioOption({
  name,
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  name: string;
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2.5',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className={cn(
          'flex h-3.5 w-3.5 items-center justify-center border border-neutral-500',
          checked && 'border-ink bg-ink',
        )}
        aria-hidden
      >
        {checked && <span className="h-1 w-1 bg-paper" />}
      </span>
      <span className={cn('text-body text-neutral-700', checked && 'text-ink')}>
        {label}
      </span>
    </label>
  );
}

export function ShopStickyFilters({
  filters,
  setFilters,
  maxPriceLimit,
  resultCount,
  availableCategories,
}: ShopStickyFiltersProps) {
  const handleReset = () => {
    setFilters({
      category: 'all',
      occasion: 'all',
      maxPrice: maxPriceLimit,
    });
  };

  return (
    <aside
      aria-label="Product filters"
      className="sticky top-[calc(4rem+1px)] max-h-[calc(100svh-5rem)] overflow-y-auto border border-neutral-300 bg-paper p-6 md:top-[calc(4.5rem+1px)]"
    >
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <p className="text-ui text-ink">Filter</p>
        <p className="text-caption text-neutral-500">
          {resultCount} {resultCount === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      <div className="space-y-8">
        <FilterGroup title="Category">
          <div className="space-y-2">
            {SHOP_CATEGORY_FILTERS.map((item) => {
              const isAvailable =
                item.id === 'all' ||
                !availableCategories ||
                availableCategories.size === 0 ||
                availableCategories.has(item.id);

              return (
                <RadioOption
                  key={item.id}
                  name="category"
                  id={item.id}
                  label={item.label}
                  checked={filters.category === item.id}
                  disabled={!isAvailable}
                  onChange={() =>
                    setFilters((prev) => ({ ...prev, category: item.id }))
                  }
                />
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup title="Occasion">
          <div className="flex flex-wrap gap-2">
            {SHOP_OCCASION_FILTERS.map((item) => {
              const active = filters.occasion === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, occasion: item.id }))
                  }
                  aria-pressed={active}
                  className={cn(
                    'border px-2.5 py-1.5 text-ui transition-colors',
                    active
                      ? 'border-ink bg-ink text-paper'
                      : 'border-neutral-300 text-neutral-700 hover:border-ink',
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup title="Price">
          <div className="space-y-2">
            <div className="flex justify-between text-caption text-neutral-700">
              <span>Up to</span>
              <span className="text-body-medium text-ink">
                {formatPrice(filters.maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={maxPriceLimit}
              step={500}
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: parseInt(e.target.value, 10),
                }))
              }
              className="h-1 w-full cursor-pointer appearance-none bg-neutral-300 accent-ink"
              aria-label="Maximum price"
            />
          </div>
        </FilterGroup>
      </div>

      <button
        type="button"
        onClick={handleReset}
        className="text-ui mt-8 w-full border border-neutral-300 py-3 text-neutral-700 transition-colors hover:border-ink hover:text-ink"
      >
        Clear Filters
      </button>
    </aside>
  );
}
