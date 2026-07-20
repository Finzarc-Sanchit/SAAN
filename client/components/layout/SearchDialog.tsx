'use client';

import { ArrowRight, Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import {
  PRODUCT_SEARCH_MIN_LENGTH,
  useProductSearch,
} from '@/hooks/useProductSearch';
import { getProductHref } from '@/lib/product-url';
import { formatPrice } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const router = useRouter();
  const inputId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const { results, total, isLoading, isError, isIdle, query: debouncedQuery } =
    useProductSearch(query, { enabled: open });

  const trimmedQuery = query.trim();
  const canSubmit = trimmedQuery.length >= PRODUCT_SEARCH_MIN_LENGTH;
  const hasResults = results.length > 0;

  const closeAndReset = useCallback(() => {
    setQuery('');
    setActiveIndex(-1);
    onClose();
  }, [onClose]);

  const navigateToShop = useCallback(
    (searchTerm: string) => {
      const params = new URLSearchParams();
      params.set('search', searchTerm);
      closeAndReset();
      router.push(`/shop?${params.toString()}`);
    },
    [closeAndReset, router],
  );

  const navigateToProduct = useCallback(
    (href: string) => {
      closeAndReset();
      router.push(href);
    },
    [closeAndReset, router],
  );

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = '';
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndReset();
        return;
      }

      if (!hasResults) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, results.length - 1));
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      }

      if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        const selected = results[activeIndex];
        if (selected) {
          navigateToProduct(getProductHref(selected));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, closeAndReset, hasResults, navigateToProduct, open, results]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-midnight/55 backdrop-blur-[2px]"
        onClick={closeAndReset}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${inputId}-label`}
        className="relative z-10 mx-auto mt-0 w-full max-w-3xl border-b border-neutral-300 bg-paper shadow-[0_24px_80px_rgba(11,10,9,0.12)]"
      >
        <form
          className="flex items-center gap-3 border-b border-neutral-300 px-4 py-4 sm:px-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) {
              navigateToShop(trimmedQuery);
            }
          }}
        >
          <Search className="h-5 w-5 shrink-0 text-neutral-500" strokeWidth={1.25} aria-hidden />
          <label htmlFor={inputId} id={`${inputId}-label`} className="sr-only">
            Search products
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pieces, fabrics, occasions…"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-body text-ink placeholder:text-neutral-500 focus:outline-none"
          />
          {isLoading ? <Spinner className="h-4 w-4" /> : null}
          <button
            type="button"
            aria-label="Close search panel"
            onClick={closeAndReset}
            className="text-neutral-500 transition-opacity hover:opacity-60"
          >
            <X className="h-5 w-5" strokeWidth={1.25} />
          </button>
        </form>

        <div className="max-h-[min(70vh,32rem)] overflow-y-auto px-4 py-4 sm:px-6">
          {isIdle ? (
            <p className="py-8 text-center text-sm font-light text-neutral-600">
              Type at least {PRODUCT_SEARCH_MIN_LENGTH} characters to search the collection.
            </p>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-neutral-700" role="alert">
              We could not load search results. Please try again.
            </p>
          ) : !isLoading && !hasResults ? (
            <p className="py-8 text-center text-sm font-light text-neutral-600">
              No pieces found for &ldquo;{debouncedQuery}&rdquo;.
            </p>
          ) : (
            <ul role="listbox" aria-label="Search results" className="divide-y divide-neutral-200">
              {results.map((product, index) => {
                const isActive = index === activeIndex;

                return (
                  <li key={product.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => navigateToProduct(getProductHref(product))}
                      className={cn(
                        'flex w-full items-center gap-4 py-4 text-left transition-colors',
                        isActive ? 'bg-neutral-100' : 'hover:bg-neutral-100',
                      )}
                    >
                      <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-neutral-100">
                        <Image
                          src={product.image}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover object-center"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink">{product.name}</p>
                        <p className="mt-1 truncate text-xs text-neutral-500">{product.subtitle}</p>
                      </div>
                      <p className="shrink-0 text-sm text-ink">
                        {formatPrice(product.price, product.currency)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {canSubmit && hasResults ? (
          <div className="border-t border-neutral-300 px-4 py-4 sm:px-6">
            <Link
              href={`/shop?search=${encodeURIComponent(trimmedQuery)}`}
              onClick={closeAndReset}
              className="inline-flex items-center gap-2 text-ui text-ink transition-opacity hover:opacity-65"
            >
              View all {total} {total === 1 ? 'result' : 'results'}
              <ArrowRight className="h-4 w-4" strokeWidth={1.25} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SearchTrigger({
  onClick,
  tone = 'dark',
  className,
}: {
  onClick: () => void;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const isLight = tone === 'light';

  return (
    <button
      type="button"
      aria-label="Open search"
      onClick={onClick}
      className={cn('transition-opacity duration-300 hover:opacity-60', className)}
    >
      <Search
        className={cn('h-[18px] w-[18px]', isLight ? 'text-paper' : 'text-ink')}
        strokeWidth={1.25}
      />
    </button>
  );
}
