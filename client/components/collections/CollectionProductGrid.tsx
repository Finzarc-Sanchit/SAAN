'use client';

import Link from 'next/link';
import { ProductCard } from '@/components/ui/ProductCard';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStorefrontProducts } from '@/hooks/useStorefrontProducts';
import { getProductHref } from '@/lib/product-url';

type CollectionProductGridProps = {
  collectionTitle: string;
  collectionSlug?: string;
};

/** Shows the merged server and editorial catalog until backend collections exist. */
export function CollectionProductGrid({
  collectionTitle,
}: CollectionProductGridProps) {
  const { products: pieces, isLoading } = useStorefrontProducts();

  return (
    <section className="section-py bg-paper">
      <Container>
        <div className="mb-10">
          <h2 className="text-h2 text-ink">From {collectionTitle}</h2>
          <p className="text-caption mt-2 text-neutral-500">
            {isLoading
              ? 'Loading pieces…'
              : `${pieces.length} ${pieces.length === 1 ? 'piece' : 'pieces'}`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-8 md:gap-y-14">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : pieces.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-8 md:gap-y-14">
            {pieces.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                href={getProductHref(product)}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-md">
            <p className="text-body text-neutral-700">
              Pieces from this line are arriving soon. Explore the full shop for more.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block text-caption uppercase tracking-[0.14em] text-ink underline-offset-4 hover:underline"
            >
              Visit the shop
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
