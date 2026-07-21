'use client';

import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { listCategories, categoriesQueryKeys } from '@/lib/api/categories';
import { listProducts, productsQueryKeys } from '@/lib/api/products';
import {
  mapStorefrontProducts,
  STOREFRONT_INITIAL_PRODUCT_LIMIT,
  STOREFRONT_NEXT_PRODUCT_LIMIT,
} from '@/hooks/useStorefrontProducts';
import type { ProductListParams, ProductListSort } from '@/lib/types/product';
import type { ProductOccasion } from '@/lib/product-occasion';

export type InfiniteStorefrontProductsOptions = {
  search?: string;
  collectionId?: string;
  categoryName?: string;
  occasion?: ProductOccasion;
  maxPrice?: number;
  sort?: ProductListSort;
  enabled?: boolean;
};

function buildListParams(
  offset: number,
  options: InfiniteStorefrontProductsOptions,
  categoryId?: string,
): ProductListParams {
  const limit = offset === 0 ? STOREFRONT_INITIAL_PRODUCT_LIMIT : STOREFRONT_NEXT_PRODUCT_LIMIT;

  return {
    status: 'active',
    offset,
    limit,
    ...(options.search ? { search: options.search } : {}),
    ...(options.collectionId ? { collectionId: options.collectionId } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(options.occasion ? { occasion: options.occasion } : {}),
    ...(options.maxPrice !== undefined ? { maxPrice: options.maxPrice } : {}),
    ...(options.sort ? { sort: options.sort } : {}),
  };
}

function buildInfiniteQueryKey(
  options: InfiniteStorefrontProductsOptions,
  categoryId?: string,
) {
  return [
    ...productsQueryKeys.storefrontDetail('catalog'),
    'infinite',
    options.search?.trim() ?? '',
    options.collectionId ?? '',
    categoryId ?? '',
    options.occasion ?? '',
    options.maxPrice ?? '',
    options.sort ?? '',
  ] as const;
}

export function mapShopSortToApiSort(sortBy: string): ProductListSort | undefined {
  switch (sortBy) {
    case 'price-asc':
      return 'price_asc';
    case 'price-desc':
      return 'price_desc';
    case 'newest':
      return 'newest';
    default:
      return undefined;
  }
}

export function useInfiniteStorefrontProducts(
  options: InfiniteStorefrontProductsOptions = {},
) {
  const enabled = options.enabled ?? true;

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
    staleTime: 5 * 60_000,
    enabled,
  });

  const categoryId = useMemo(() => {
    if (!options.categoryName || options.categoryName === 'all') {
      return undefined;
    }

    return categoriesQuery.data?.find(
      (category) => category.name === options.categoryName,
    )?.id;
  }, [categoriesQuery.data, options.categoryName]);

  const productsQuery = useInfiniteQuery({
    queryKey: buildInfiniteQueryKey(options, categoryId),
    queryFn: ({ pageParam }) =>
      listProducts(buildListParams(pageParam, options, categoryId)),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.items.length === 0) return undefined;

      const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return loadedCount < lastPage.meta.total ? loadedCount : undefined;
    },
    staleTime: 60_000,
    enabled: enabled && (!options.categoryName || options.categoryName === 'all' || Boolean(categoryId)),
  });

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categoriesQuery.data]);

  const rawItems = useMemo(() => {
    const items = productsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<string>();

    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [productsQuery.data?.pages]);

  const products = useMemo(
    () => mapStorefrontProducts(rawItems, categoryNameById),
    [rawItems, categoryNameById],
  );

  const total = productsQuery.data?.pages[0]?.meta.total ?? products.length;

  const occasionOnlyQuery = useQuery({
    queryKey: [
      ...productsQueryKeys.storefrontDetail('catalog'),
      'occasion-categories',
      options.occasion ?? '',
      options.search?.trim() ?? '',
    ],
    queryFn: () =>
      listProducts({
        status: 'active',
        limit: 200,
        ...(options.search ? { search: options.search } : {}),
        ...(options.occasion ? { occasion: options.occasion } : {}),
      }),
    staleTime: 60_000,
    enabled: enabled && !!options.occasion,
  });

  const availableCategories = useMemo(() => {
    if (!options.occasion) return new Set<string>();

    const items = occasionOnlyQuery.data?.items ?? [];
    const set = new Set<string>();
    for (const item of items) {
      const name = categoryNameById.get(item.categoryId);
      if (name) set.add(name);
    }
    return set;
  }, [options.occasion, occasionOnlyQuery.data?.items, categoryNameById]);

  return {
    products,
    total,
    categories: categoriesQuery.data ?? [],
    categoryNameById,
    availableCategories,
    isLoading: productsQuery.isLoading,
    isFetchingNextPage: productsQuery.isFetchingNextPage,
    hasNextPage: productsQuery.hasNextPage,
    fetchNextPage: productsQuery.fetchNextPage,
    isError: productsQuery.isError,
  };
}
