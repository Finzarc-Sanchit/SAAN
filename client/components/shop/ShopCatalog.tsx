'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/ui/ProductCard';
import { ShopStickyFilters } from '@/components/shop/ShopStickyFilters';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStorefrontProducts } from '@/hooks/useStorefrontProducts';
import { getProductHref } from '@/lib/product-url';
import { type ShopFilterState } from '@/lib/shop-filters';
import { SHOP_CATEGORY_FILTERS, SHOP_SORT_OPTIONS } from '@/lib/site-content';

const MAX_PRICE_LIMIT = 50000;

type CategoryFilterOption = { id: string; label: string };

function buildCategoryOptions(
  products: { category: string }[],
): CategoryFilterOption[] {
  const seen = new Map<string, string>();
  for (const product of products) {
    if (product.category && !seen.has(product.category)) {
      seen.set(product.category, product.category);
    }
  }

  if (seen.size === 0) {
    return [...SHOP_CATEGORY_FILTERS];
  }

  return [
    { id: 'all', label: 'All' },
    ...[...seen.keys()].map((category) => ({ id: category, label: category })),
  ];
}

export function ShopCatalog() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') ?? 'all';
  const initialSort = searchParams.get('sort') ?? 'featured';

  const [sortBy, setSortBy] = useState(
    SHOP_SORT_OPTIONS.some((option) => option.id === initialSort)
      ? initialSort
      : 'featured',
  );
  const [filters, setFilters] = useState<ShopFilterState>({
    category: initialCategory,
    occasion: 'all',
    maxPrice: MAX_PRICE_LIMIT,
  });

  const { products: catalogProducts, isLoading } = useStorefrontProducts();

  const categoryOptions = useMemo(
    () => buildCategoryOptions(catalogProducts),
    [catalogProducts],
  );

  const filteredProducts = useMemo(() => {
    let result = [...catalogProducts];

    if (filters.category !== 'all') {
      result = result.filter((product) => product.category === filters.category);
    }

    if (filters.occasion !== 'all') {
      result = result.filter((product) =>
        product.occasion.includes(filters.occasion as (typeof product.occasion)[number]),
      );
    }

    result = result.filter((product) => product.price <= filters.maxPrice);

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }

    return result;
  }, [catalogProducts, filters, sortBy]);

  const isSaleCollection =
    searchParams.get('collection') === 'sale' ||
    searchParams.get('sale') === 'true';

  return (
    <section id="shop-catalog" className="section-py bg-paper">
      <Container>
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-h1 text-ink">Shop</h1>
            <p className="text-caption mt-2 text-neutral-500">
              Luxury pret, formals, and everyday pieces — finished by hand.
            </p>
          </div>

          <label className="flex items-center gap-3">
            <span className="text-ui text-neutral-500">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-neutral-300 bg-paper px-3 py-2 text-body text-ink focus:border-ink focus:outline-none"
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
          <ShopStickyFilters
            filters={filters}
            setFilters={setFilters}
            maxPriceLimit={MAX_PRICE_LIMIT}
            resultCount={filteredProducts.length}
            categoryOptions={categoryOptions}
          />

          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-14 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-14 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  href={getProductHref(product)}
                  showSaleBadge={isSaleCollection}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-neutral-300 bg-neutral-100 px-6 py-16 text-center">
              <p className="text-h3 text-ink">No pieces match your selection</p>
              <p className="text-body mt-2 max-w-sm text-neutral-700">
                Try adjusting your filters to explore the full collection.
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
