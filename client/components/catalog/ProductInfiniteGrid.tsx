'use client';

import { useEffect, useRef } from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { getProductHref } from '@/lib/product-url';
import type { ShopProduct } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type ProductInfiniteGridProps = {
  products: ShopProduct[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  showSaleBadge?: boolean;
  className?: string;
  emptyState?: React.ReactNode;
};

function ProductGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-14 lg:grid-cols-3',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function ProductInfiniteGrid({
  products,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  showSaleBadge = false,
  className,
  emptyState,
}: ProductInfiniteGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    if (!isFetchingNextPage) {
      isLoadingMoreRef.current = false;
    }
  }, [isFetchingNextPage]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting &&
          !isFetchingNextPage &&
          !isLoadingMoreRef.current
        ) {
          isLoadingMoreRef.current = true;
          onLoadMore();
        }
      },
      { rootMargin: '320px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return <ProductGridSkeleton count={12} className={className} />;
  }

  if (products.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-14 lg:grid-cols-3',
          className,
        )}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            href={getProductHref(product)}
            showSaleBadge={showSaleBadge}
          />
        ))}
      </div>

      <div ref={loadMoreRef} className="mt-10 flex justify-center" aria-hidden={!hasNextPage}>
        {isFetchingNextPage ? (
          <ProductGridSkeleton count={3} className={className} />
        ) : null}
      </div>
    </>
  );
}
