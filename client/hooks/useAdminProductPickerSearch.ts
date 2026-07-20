'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { listProducts, productsQueryKeys } from '@/lib/api/products';
import { formatInr } from '@/lib/admin/format';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Product, ProductListSort, ProductStatus } from '@/lib/types/product';

export const ADMIN_PRODUCT_PICKER_MIN_SEARCH = 2;
export const ADMIN_PRODUCT_PICKER_LIMIT = 8;

type UseAdminProductPickerSearchOptions = {
  query: string;
  open: boolean;
  status?: ProductStatus;
  limit?: number;
  sort?: ProductListSort;
};

export function useAdminProductPickerSearch({
  query,
  open,
  status = 'active',
  limit = ADMIN_PRODUCT_PICKER_LIMIT,
  sort = 'newest',
}: UseAdminProductPickerSearchOptions) {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, 300);
  const isSearching = debouncedQuery.length >= ADMIN_PRODUCT_PICKER_MIN_SEARCH;
  const isPartialQuery =
    trimmedQuery.length > 0 && trimmedQuery.length < ADMIN_PRODUCT_PICKER_MIN_SEARCH;

  const initialQuery = useQuery({
    queryKey: productsQueryKeys.list({ status, limit, page: 1, sort }),
    queryFn: () => listProducts({ status, limit, page: 1, sort }),
    enabled: open && !isSearching && !isPartialQuery,
    staleTime: 60_000,
  });

  const searchQuery = useQuery({
    queryKey: productsQueryKeys.search(debouncedQuery, limit),
    queryFn: () =>
      listProducts({
        status,
        search: debouncedQuery,
        limit,
        page: 1,
        sort,
      }),
    enabled: open && isSearching,
    staleTime: 30_000,
  });

  const products = useMemo(() => {
    if (isPartialQuery) {
      return [];
    }
    if (isSearching) {
      return searchQuery.data?.items ?? [];
    }
    return initialQuery.data?.items ?? [];
  }, [isPartialQuery, isSearching, searchQuery.data?.items, initialQuery.data?.items]);

  return {
    products,
    debouncedQuery,
    isSearching,
    isPartialQuery,
    isLoading: isSearching ? searchQuery.isFetching : initialQuery.isFetching,
  };
}

export function adminProductPickerSubtitle(product: Product): string {
  const parts = [product.slug, formatInr(product.salePrice ?? product.basePrice)];
  if (product.status !== 'active') {
    parts.push(product.status);
  }
  return parts.join(' · ');
}
