'use client';

import { useMemo } from 'react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStorefrontProducts } from '@/hooks/useStorefrontProducts';
import { getProductHref } from '@/lib/product-url';
import type { ShopProduct } from '@/lib/site-content';

type RelatedProductsProps = {
  product: ShopProduct;
};

const RELATED_PRODUCT_LIMIT = 4;

function getRelatedProducts(
  product: ShopProduct,
  catalog: readonly ShopProduct[],
): ShopProduct[] {
  return catalog
    .filter((item) => item.id !== product.id)
    .map((item, index) => ({
      item,
      index,
      relevance:
        (item.collection === product.collection ? 4 : 0) +
        (item.category === product.category ? 2 : 0) +
        (item.occasion.some((value) => product.occasion.includes(value)) ? 1 : 0),
    }))
    .sort((a, b) => b.relevance - a.relevance || a.index - b.index)
    .slice(0, RELATED_PRODUCT_LIMIT)
    .map(({ item }) => item);
}

export function RelatedProducts({ product }: RelatedProductsProps) {
  const { products, isLoading } = useStorefrontProducts();
  const related = useMemo(
    () => getRelatedProducts(product, products),
    [product, products],
  );

  if (!isLoading && related.length === 0) {
    return null;
  }

  return (
    <section aria-label="Related products" className="section-py bg-neutral-100">
      <Container>
        <h2 className="text-h2 text-ink">You May Also Like</h2>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-8 md:gap-y-14">
          {isLoading
            ? Array.from({ length: RELATED_PRODUCT_LIMIT }).map((_, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            : related.map((item) => (
                <ProductCard key={item.id} product={item} href={getProductHref(item)} />
              ))}
        </div>
      </Container>
    </section>
  );
}
