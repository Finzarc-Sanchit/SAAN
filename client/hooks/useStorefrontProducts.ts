'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCategories, categoriesQueryKeys } from '@/lib/api/categories';
import { listProducts, productsQueryKeys } from '@/lib/api/products';
import { mapApiProductToShopProduct } from '@/lib/product-defaults';
import type { ShopProduct } from '@/lib/site-content';

export const STOREFRONT_PRODUCT_LIMIT = 100;

type UseStorefrontProductsOptions = {
  search?: string;
  enabled?: boolean;
};

export function mapStorefrontProducts(
  products: Parameters<typeof mapApiProductToShopProduct>[0][],
  categoryNameById: Map<string, string>,
): ShopProduct[] {
  return products.map((product) =>
    mapApiProductToShopProduct(product, categoryNameById.get(product.categoryId)),
  );
}

export function selectNewArrivals(products: ShopProduct[], limit = 8): ShopProduct[] {
  const arrivals = products.filter((product) => product.isNew);
  if (arrivals.length >= limit) {
    return arrivals.slice(0, limit);
  }
  return [...arrivals, ...products.filter((product) => !product.isNew)].slice(0, limit);
}

function selectFlaggedProducts(
  products: ShopProduct[],
  flaggedIds: Set<string>,
  limit: number,
): ShopProduct[] {
  const flagged = products.filter((product) => flaggedIds.has(product.id));
  const remaining = products.filter((product) => !flaggedIds.has(product.id));
  return [...flagged, ...remaining].slice(0, limit);
}

function buildStorefrontQueryKey(search?: string) {
  const normalizedSearch = search?.trim() || undefined;
  return [
    ...productsQueryKeys.storefrontDetail('catalog'),
    'active-list',
    STOREFRONT_PRODUCT_LIMIT,
    normalizedSearch ?? '',
  ] as const;
}

/** Server-backed storefront catalog — no static product fallbacks. */
export function useStorefrontProducts(options: UseStorefrontProductsOptions = {}) {
  const normalizedSearch = options.search?.trim() || undefined;
  const enabled = options.enabled ?? true;

  const productsQuery = useQuery({
    queryKey: buildStorefrontQueryKey(normalizedSearch),
    queryFn: () =>
      listProducts({
        status: 'active',
        limit: STOREFRONT_PRODUCT_LIMIT,
        ...(normalizedSearch ? { search: normalizedSearch } : {}),
      }),
    staleTime: 60_000,
    enabled,
  });

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
    staleTime: 5 * 60_000,
    enabled,
  });

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categoriesQuery.data]);

  const rawItems = useMemo(
    () => productsQuery.data?.items ?? [],
    [productsQuery.data?.items],
  );

  const products = useMemo(
    () => mapStorefrontProducts(rawItems, categoryNameById),
    [rawItems, categoryNameById],
  );

  const newArrivals = useMemo(() => selectNewArrivals(products, 8), [products]);

  const bestSellers = useMemo(() => {
    const bestSellerIds = new Set(
      rawItems.filter((product) => product.isBestSeller).map((product) => product.id),
    );
    return selectFlaggedProducts(products, bestSellerIds, 6);
  }, [products, rawItems]);

  const featured = useMemo(() => {
    const featuredIds = new Set(
      rawItems.filter((product) => product.isFeatured).map((product) => product.id),
    );
    return selectFlaggedProducts(products, featuredIds, 6);
  }, [products, rawItems]);

  return {
    products,
    newArrivals,
    bestSellers,
    featured,
    total: productsQuery.data?.meta.total ?? products.length,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    categoryNameById,
  };
}
