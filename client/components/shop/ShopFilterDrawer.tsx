'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  SHOP_COLLECTION_FILTERS,
  SHOP_CATEGORY_FILTERS,
  SHOP_OCCASION_FILTERS,
  formatPrice,
} from '@/lib/site-content';
import { cn } from '@/lib/utils';

type FilterState = {
  collection: string;
  category: string;
  occasion: string;
  maxPrice: number;
};

type ShopFilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  maxPriceLimit: number;
};

export function ShopFilterDrawer({
  isOpen,
  onClose,
  filters,
  setFilters,
  maxPriceLimit,
}: ShopFilterDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const handleReset = () => {
    setFilters({
      collection: 'all',
      category: 'all',
      occasion: 'all',
      maxPrice: maxPriceLimit,
    });
  };

  const handleCollectionChange = (id: string) => {
    setFilters((prev) => ({ ...prev, collection: id }));
  };

  const handleCategoryChange = (id: string) => {
    setFilters((prev) => ({ ...prev, category: id }));
  };

  const handleOccasionChange = (id: string) => {
    setFilters((prev) => ({ ...prev, occasion: id }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setFilters((prev) => ({ ...prev, maxPrice: val }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close filters overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-saan-charcoal/40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Filter catalog"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-paper shadow-2xl border-r border-saan-champagne/30"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-saan-champagne/40 px-6 py-5">
              <h2 className="font-body text-label-caps text-sm font-bold text-ink">
                Filters
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-saan-ink hover:bg-saan-champagne/20 transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-hide">
              {/* Collection Section */}
              <div className="space-y-4">
                <h3 className="font-body text-xs font-bold uppercase tracking-wider text-saan-ink/80">
                  Collection
                </h3>
                <div className="space-y-2.5">
                  {SHOP_COLLECTION_FILTERS.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="collection"
                        checked={filters.collection === item.id}
                        onChange={() => handleCollectionChange(item.id)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          'flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-colors',
                          filters.collection === item.id
                            ? 'border-saan-maroon bg-saan-maroon'
                            : 'border-saan-champagne bg-transparent group-hover:border-saan-maroon'
                        )}
                      >
                        {filters.collection === item.id && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span
                        className={cn(
                          'font-body text-sm transition-colors',
                          filters.collection === item.id
                            ? 'text-ink font-medium'
                            : 'text-saan-ink/70 group-hover:text-ink'
                        )}
                      >
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Section */}
              <div className="space-y-4">
                <h3 className="font-body text-xs font-bold uppercase tracking-wider text-saan-ink/80">
                  Category
                </h3>
                <div className="space-y-2.5">
                  {SHOP_CATEGORY_FILTERS.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === item.id}
                        onChange={() => handleCategoryChange(item.id)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          'flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-colors',
                          filters.category === item.id
                            ? 'border-saan-maroon bg-saan-maroon'
                            : 'border-saan-champagne bg-transparent group-hover:border-saan-maroon'
                        )}
                      >
                        {filters.category === item.id && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span
                        className={cn(
                          'font-body text-sm transition-colors',
                          filters.category === item.id
                            ? 'text-ink font-medium'
                            : 'text-saan-ink/70 group-hover:text-ink'
                        )}
                      >
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Occasion Section */}
              <div className="space-y-4">
                <h3 className="font-body text-xs font-bold uppercase tracking-wider text-saan-ink/80">
                  Occasion
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SHOP_OCCASION_FILTERS.map((item) => {
                    const isActive = filters.occasion === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleOccasionChange(item.id)}
                        className={cn(
                          'text-label-caps rounded-none border px-3.5 py-2 text-[10px] tracking-widest transition-all duration-200',
                          isActive
                            ? 'border-saan-maroon bg-saan-maroon text-paper'
                            : 'border-saan-champagne bg-white text-saan-ink hover:border-saan-maroon hover:bg-saan-maroon hover:text-paper'
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Section */}
              <div className="space-y-4">
                <h3 className="font-body text-xs font-bold uppercase tracking-wider text-saan-ink/80">
                  Price Limit
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between font-body text-sm text-saan-ink/80">
                    <span>Up to</span>
                    <span className="font-semibold text-ink">
                      {formatPrice(filters.maxPrice)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={maxPriceLimit}
                    step={500}
                    value={filters.maxPrice}
                    onChange={handlePriceChange}
                    className="w-full accent-saan-maroon h-1 bg-saan-champagne/40 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between font-body text-[10px] text-saan-ink/40">
                    <span>{formatPrice(5000)}</span>
                    <span>{formatPrice(maxPriceLimit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-saan-champagne/40 p-6 flex gap-4 bg-saan-surface-warm/30">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 text-label-caps border border-saan-champagne py-3 text-center text-xs text-saan-ink hover:border-saan-maroon hover:text-ink transition-colors"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-label-caps bg-saan-maroon py-3 text-center text-xs text-white hover:bg-ink transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
