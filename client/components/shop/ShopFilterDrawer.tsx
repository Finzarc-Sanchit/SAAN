'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ShopFilterPanels, ShopFilterResetButton } from '@/components/shop/ShopFilterPanels';
import { useScrollLock } from '@/hooks/useScrollLock';
import { type ShopFilterState } from '@/lib/shop-filters';

type ShopFilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: ShopFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ShopFilterState>>;
  maxPriceLimit: number;
  resultCount: number;
  availableCategories?: Set<string>;
};

export function ShopFilterDrawer({
  isOpen,
  onClose,
  filters,
  setFilters,
  maxPriceLimit,
  resultCount,
  availableCategories,
}: ShopFilterDrawerProps) {
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleReset = () => {
    setFilters({
      category: 'all',
      occasion: 'all',
      maxPrice: maxPriceLimit,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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

          <motion.aside
            id="shop-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex h-[100dvh] w-[min(85vw,20rem)] flex-col overflow-hidden border border-neutral-300 bg-paper shadow-xl"
          >
            <div className="shrink-0 border-b border-neutral-300 px-6 py-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-ui text-ink">Filter</p>
                <div className="flex items-center gap-3">
                  <p className="text-caption text-neutral-500">
                    {resultCount} {resultCount === 1 ? 'piece' : 'pieces'}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-neutral-500 transition-colors hover:text-ink"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" strokeWidth={1.25} />
                  </button>
                </div>
              </div>
            </div>

            <div
              data-lenis-prevent
              className="scrollbar-panel min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6"
            >
              <ShopFilterPanels
                filters={filters}
                setFilters={setFilters}
                maxPriceLimit={maxPriceLimit}
                availableCategories={availableCategories}
              />

              <ShopFilterResetButton onReset={handleReset} className="mt-8" />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
