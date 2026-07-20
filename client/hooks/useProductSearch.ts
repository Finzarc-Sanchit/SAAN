'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { listCategories, categoriesQueryKeys } from '@/lib/api/categories';
import { listProducts, productsQueryKeys } from '@/lib/api/products';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { mapStorefrontProducts } from '@/hooks/useStorefrontProducts';

export const PRODUCT_SEARCH_MIN_LENGTH = 2;
export const PRODUCT_SEARCH_SUGGESTION_LIMIT = 8;

export function useProductSearch(
  query: string,
  options?: { limit?: number; enabled?: boolean },
) {
  const limit = options?.limit ?? PRODUCT_SEARCH_SUGGESTION_LIMIT;
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, 300);
  const canSearch = debouncedQuery.length >= PRODUCT_SEARCH_MIN_LENGTH;
  const enabled = (options?.enabled ?? true) && canSearch;

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
    staleTime: 5 * 60_000,
  });

  const searchQuery = useQuery({
    queryKey: productsQueryKeys.search(debouncedQuery, limit),
    queryFn: () =>
      listProducts({
        status: 'active',
        search: debouncedQuery,
        limit,
      }),
    enabled,
    staleTime: 30_000,
  });

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categoriesQuery.data]);

  const results = useMemo(() => {
    if (!searchQuery.data?.items) return [];
    return mapStorefrontProducts(searchQuery.data.items, categoryNameById);
  }, [searchQuery.data?.items, categoryNameById]);

  return {
    query: debouncedQuery,
    results,
    total: searchQuery.data?.meta.total ?? results.length,
    isLoading: enabled && searchQuery.isFetching,
    isError: searchQuery.isError,
    isIdle: !canSearch,
  };
}
