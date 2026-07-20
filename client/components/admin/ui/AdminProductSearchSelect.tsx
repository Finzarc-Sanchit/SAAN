'use client';

import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminProductCell } from '@/components/admin/ui/AdminProductCell';
import { adminInputClassName } from '@/components/admin/ui/AdminFormField';
import { Spinner } from '@/components/ui/Spinner';
import {
  ADMIN_PRODUCT_PICKER_MIN_SEARCH,
  adminProductPickerSubtitle,
  useAdminProductPickerSearch,
} from '@/hooks/useAdminProductPickerSearch';
import { fetchAdminProduct, productsQueryKeys } from '@/lib/api/products';
import type { ProductStatus } from '@/lib/types/product';
import { cn } from '@/lib/utils';

type AdminProductSearchSelectProps = {
  id: string;
  value: string;
  onChange: (productId: string) => void;
  disabled?: boolean;
  status?: ProductStatus;
  placeholder?: string;
};

function getProductImageUrl(product: { images: { imageUrl: string }[] }): string | undefined {
  return product.images[0]?.imageUrl;
}

export function AdminProductSearchSelect({
  id,
  value,
  onChange,
  disabled = false,
  status = 'active',
  placeholder = 'Search and select a product',
}: AdminProductSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const selectedQuery = useQuery({
    queryKey: productsQueryKeys.detail(value),
    queryFn: () => fetchAdminProduct(value),
    enabled: Boolean(value),
    staleTime: 60_000,
  });

  const { products, debouncedQuery, isSearching, isPartialQuery, isLoading } =
    useAdminProductPickerSearch({
      query: search,
      open,
      status,
    });

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      return;
    }

    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const selectedProduct = selectedQuery.data;

  function handleSelect(productId: string) {
    onChange(productId);
    setOpen(false);
  }

  function renderEmptyState() {
    if (isPartialQuery) {
      return (
        <li className="px-3 py-4 text-center font-body text-xs text-saan-ink/45 dark:text-paper/45">
          Type at least {ADMIN_PRODUCT_PICKER_MIN_SEARCH} characters to search
        </li>
      );
    }

    if (isSearching) {
      return (
        <li className="px-3 py-4 text-center font-body text-xs text-saan-ink/45 dark:text-paper/45">
          No products found for &ldquo;{debouncedQuery}&rdquo;
        </li>
      );
    }

    return (
      <li className="px-3 py-4 text-center font-body text-xs text-saan-ink/45 dark:text-paper/45">
        No active products available
      </li>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          adminInputClassName,
          'flex min-h-[3.25rem] items-center justify-between gap-3 py-2 text-left',
        )}
      >
        {selectedProduct ? (
          <AdminProductCell
            imageUrl={getProductImageUrl(selectedProduct)}
            name={selectedProduct.name}
            subtitle={adminProductPickerSubtitle(selectedProduct)}
            className="min-w-0 flex-1"
          />
        ) : (
          <span className="font-body text-sm text-saan-ink/35 dark:text-paper/35">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-saan-ink/45 transition-transform dark:text-paper/45',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className={cn(
            'absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-saan-champagne/70 bg-white shadow-lg',
            'dark:border-white/15 dark:bg-[#121412]',
          )}
        >
          <div className="border-b border-saan-champagne/50 p-2 dark:border-white/10">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-saan-ink/40 dark:text-paper/40"
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or slug…"
                className={cn(adminInputClassName, 'pl-9')}
                aria-controls={listboxId}
                autoComplete="off"
              />
            </div>
            {!isSearching && !isPartialQuery ? (
              <p className="mt-2 px-1 font-body text-[11px] text-saan-ink/40 dark:text-paper/40">
                Showing recent active products. Search to narrow results.
              </p>
            ) : null}
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-label="Products"
            className="max-h-72 overflow-y-auto p-1"
          >
            {isLoading ? (
              <li className="flex items-center justify-center py-8">
                <Spinner className="h-5 w-5" />
              </li>
            ) : products.length === 0 ? (
              renderEmptyState()
            ) : (
              products.map((product) => (
                <li key={product.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={product.id === value}
                    onClick={() => handleSelect(product.id)}
                    className={cn(
                      'w-full rounded-md px-2 py-2 text-left transition-colors',
                      product.id === value
                        ? 'bg-saan-maroon/8 dark:bg-white/10'
                        : 'hover:bg-paper/80 dark:hover:bg-white/5',
                    )}
                  >
                    <AdminProductCell
                      imageUrl={getProductImageUrl(product)}
                      name={product.name}
                      subtitle={adminProductPickerSubtitle(product)}
                    />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
