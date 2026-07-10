'use client';

import { useMemo, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { ShopToolbar } from '@/components/shop/ShopToolbar';
import { ShopFilterDrawer } from '@/components/shop/ShopFilterDrawer';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { SHOP_PRODUCTS } from '@/lib/site-content';

const MAX_PRICE_LIMIT = 50000;

export function ShopCatalog() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    collection: 'all',
    category: 'all',
    occasion: 'all',
    maxPrice: MAX_PRICE_LIMIT,
  });

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.collection !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.occasion !== 'all') count++;
    if (filters.maxPrice < MAX_PRICE_LIMIT) count++;
    return count;
  }, [filters]);

  // Filter and Sort products
  const filteredProducts = useMemo(() => {
    let result = [...SHOP_PRODUCTS];

    // Filter by collection
    if (filters.collection !== 'all') {
      result = result.filter((p) => p.collection === filters.collection);
    }

    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }

    // Filter by occasion
    if (filters.occasion !== 'all') {
      result = result.filter((p) => p.occasion === filters.occasion);
    }

    // Filter by price
    result = result.filter((p) => p.price <= filters.maxPrice);

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return result;
  }, [filters, sortBy]);

  return (
    <section
      id="shop-catalog"
      className="relative z-10 bg-saan-bone py-16 md:py-24 border-t border-saan-champagne/20"
    >
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-normal text-saan-maroon tracking-tight">
              The Shop
            </h2>
            <p className="font-body text-xs text-saan-ink/50 uppercase tracking-widest mt-2">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} on the floor
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <ShopToolbar
          onOpenFilters={() => setIsFiltersOpen(true)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {filteredProducts.map((product, index) => (
              <ShopProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="mt-20 flex flex-col items-center justify-center text-center py-12 border border-dashed border-saan-champagne/40 bg-white/50">
            <p className="font-display text-xl text-saan-maroon">No pieces match your selection</p>
            <p className="font-body text-sm text-saan-ink/60 mt-2 max-w-sm">
              Try adjusting your filters or clearing them to explore our full collection.
            </p>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  collection: 'all',
                  category: 'all',
                  occasion: 'all',
                  maxPrice: MAX_PRICE_LIMIT,
                })
              }
              className="mt-6 text-label-caps bg-saan-maroon px-6 py-3 text-xs text-white hover:bg-saan-gold transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Filter Drawer */}
        <ShopFilterDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          filters={filters}
          setFilters={setFilters}
          maxPriceLimit={MAX_PRICE_LIMIT}
        />
      </Container>
    </section>
  );
}
