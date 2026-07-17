import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCategories, categoriesQueryKeys } from '@/lib/api/categories';
import { listProducts, productsQueryKeys } from '@/lib/api/products';
import { mapApiProductToShopProduct } from '@/lib/product-defaults';
import { SHOP_PRODUCTS, type ShopProduct } from '@/lib/site-content';
import type { Product } from '@/lib/types/product';

export const STOREFRONT_PRODUCT_LIMIT = 100;

export const storefrontProductsQueryKey = [
  ...productsQueryKeys.storefrontDetail('catalog'),
  'active-list',
  STOREFRONT_PRODUCT_LIMIT,
] as const;

export function mapStorefrontProducts(
  products: Product[],
  categoryNameById: Map<string, string>,
): ShopProduct[] {
  return products.map((product) =>
    mapApiProductToShopProduct(product, categoryNameById.get(product.categoryId)),
  );
}

/**
 * Combines buyable API products with editorial fallback products.
 * API records win when either an id or slug collides with a static record.
 */
export function mergeStorefrontProducts(
  apiProducts: readonly ShopProduct[],
  staticProducts: readonly ShopProduct[] = SHOP_PRODUCTS,
): ShopProduct[] {
  const claimedKeys = new Set(
    apiProducts.flatMap((product) =>
      [product.id, product.slug].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );
  const staticFallbacks = staticProducts.filter((product) => {
    const keys = [product.id, product.slug].filter(
      (value): value is string => Boolean(value),
    );
    if (keys.some((key) => claimedKeys.has(key))) {
      return false;
    }
    keys.forEach((key) => claimedKeys.add(key));
    return true;
  });

  return [...apiProducts, ...staticFallbacks];
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

/** Server-backed catalog enriched with the existing editorial dummy products. */
export function useStorefrontProducts() {
  const productsQuery = useQuery({
    queryKey: storefrontProductsQueryKey,
    queryFn: () => listProducts({ status: 'active', limit: STOREFRONT_PRODUCT_LIMIT }),
    staleTime: 60_000,
  });

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
    staleTime: 5 * 60_000,
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

  const products = useMemo(() => {
    const apiProducts = mapStorefrontProducts(rawItems, categoryNameById);
    return mergeStorefrontProducts(apiProducts);
  }, [rawItems, categoryNameById]);

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
    fromApi: rawItems.length > 0,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    categoryNameById,
  };
}
