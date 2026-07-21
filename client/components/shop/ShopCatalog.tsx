'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductInfiniteGrid } from '@/components/catalog/ProductInfiniteGrid';
import { ShopFilterDrawer } from '@/components/shop/ShopFilterDrawer';
import { ShopStickyFilters } from '@/components/shop/ShopStickyFilters';
import {
  mapShopSortToApiSort,
  useInfiniteStorefrontProducts,
} from '@/hooks/useInfiniteStorefrontProducts';
import {
  countActiveShopFilters,
  parseShopOccasionFilter,
  type ShopFilterState,
} from '@/lib/shop-filters';
import { SHOP_SORT_OPTIONS } from '@/lib/site-content';
import type { ProductOccasion } from '@/lib/product-occasion';
import { cn } from '@/lib/utils';

const MAX_PRICE_LIMIT = 50000;

function buildUrl(
  filters: ShopFilterState,
  sortBy: string,
  search: string,
): string {
  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.occasion && filters.occasion !== 'all') params.set('occasion', filters.occasion);
  if (filters.maxPrice < MAX_PRICE_LIMIT) params.set('maxPrice', String(filters.maxPrice));
  if (sortBy && sortBy !== 'featured') params.set('sort', sortBy);

  const qs = params.toString();
  return qs ? `/shop?${qs}` : '/shop';
}

export function ShopCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.trim() ?? '';
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [sortBy, setSortBy] = useState(() => {
    const s = searchParams.get('sort') ?? 'featured';
    return SHOP_SORT_OPTIONS.some((o) => o.id === s) ? s : 'featured';
  });

  const [filters, setFilters] = useState<ShopFilterState>(() => ({
    category: searchParams.get('category') ?? 'all',
    occasion: parseShopOccasionFilter(searchParams.get('occasion')),
    maxPrice: (() => {
      const v = searchParams.get('maxPrice');
      if (!v) return MAX_PRICE_LIMIT;
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? Math.min(n, MAX_PRICE_LIMIT) : MAX_PRICE_LIMIT;
    })(),
  }));

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const url = buildUrl(filters, sortBy, searchQuery);
    router.replace(url, { scroll: false });
  }, [filters, sortBy, searchQuery, router]);

  const {
    products,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    availableCategories,
  } = useInfiniteStorefrontProducts({
    search: searchQuery || undefined,
    sort: mapShopSortToApiSort(sortBy),
    maxPrice: filters.maxPrice < MAX_PRICE_LIMIT ? filters.maxPrice : undefined,
    occasion:
      filters.occasion !== 'all' ? (filters.occasion as ProductOccasion) : undefined,
    categoryName: filters.category,
  });

  const isSaleCollection =
    searchParams.get('collection') === 'sale' ||
    searchParams.get('sale') === 'true';

  const handleSetFilters: typeof setFilters = useCallback((action) => {
    setFilters(action);
  }, []);

  const activeFiltersCount = countActiveShopFilters(filters, MAX_PRICE_LIMIT);

  return (
    <section id="shop-catalog" className="section-py bg-paper">
      <Container>
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-h1 text-ink">
              {searchQuery ? `Results for "${searchQuery}"` : 'Shop'}
            </h1>
            <p className="text-caption mt-2 text-neutral-500">
              {searchQuery
                ? isLoading
                  ? 'Searching the collection…'
                  : `${total} ${total === 1 ? 'piece' : 'pieces'} found`
                : 'Luxury pret, formals, and everyday pieces — finished by hand.'}
            </p>
          </div>

          <label className="hidden items-center gap-2 md:flex">
            <span className="text-caption text-neutral-500">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-neutral-300 bg-paper px-2.5 py-1.5 text-caption text-ink focus:border-ink focus:outline-none"
              aria-label="Sort products"
            >
              {SHOP_SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <ShopStickyFilters
              filters={filters}
              setFilters={handleSetFilters}
              maxPriceLimit={MAX_PRICE_LIMIT}
              resultCount={total}
              availableCategories={availableCategories}
            />
          </div>

          <div>
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center border border-neutral-300 bg-paper text-ink transition-colors hover:border-ink',
                )}
                aria-haspopup="dialog"
                aria-expanded={isFilterDrawerOpen}
                aria-label={
                  activeFiltersCount > 0
                    ? `Filter products (${activeFiltersCount} active)`
                    : 'Filter products'
                }
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.25} />
                {activeFiltersCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-ink px-0.5 text-[9px] leading-none text-paper"
                    aria-hidden
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <label className="flex items-center gap-2">
                <span className="sr-only">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-neutral-300 bg-paper px-2 py-1.5 text-caption text-ink focus:border-ink focus:outline-none"
                  aria-label="Sort products"
                >
                  {SHOP_SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <ProductInfiniteGrid
              products={products}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              onLoadMore={() => {
                void fetchNextPage();
              }}
              showSaleBadge={isSaleCollection}
              emptyState={
                <div className="flex flex-col items-center justify-center border border-dashed border-neutral-300 bg-neutral-100 px-6 py-16 text-center">
                  <p className="text-h3 text-ink">No pieces match your selection</p>
                  <p className="text-body mt-2 max-w-sm text-neutral-700">
                    Try adjusting your filters to explore the full collection.
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </Container>

      <ShopFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        setFilters={handleSetFilters}
        maxPriceLimit={MAX_PRICE_LIMIT}
        resultCount={total}
        availableCategories={availableCategories}
      />
    </section>
  );
}
