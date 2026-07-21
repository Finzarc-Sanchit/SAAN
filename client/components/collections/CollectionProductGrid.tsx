'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ProductInfiniteGrid } from '@/components/catalog/ProductInfiniteGrid';
import { Container } from '@/components/ui/Container';
import { useInfiniteStorefrontProducts } from '@/hooks/useInfiniteStorefrontProducts';
import {
  fetchStorefrontCollectionBySlug,
  storefrontCollectionsQueryKeys,
} from '@/lib/api/storefront-collections';

type CollectionProductGridProps = {
  collectionTitle: string;
  collectionSlug: string;
};

/** Shows active catalog products for a collection page. */
export function CollectionProductGrid({
  collectionTitle,
  collectionSlug,
}: CollectionProductGridProps) {
  const collectionQuery = useQuery({
    queryKey: storefrontCollectionsQueryKeys.detail(collectionSlug),
    queryFn: () => fetchStorefrontCollectionBySlug(collectionSlug),
  });

  const collectionId = collectionQuery.data?.id;

  const {
    products,
    total,
    isLoading: isProductsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteStorefrontProducts({
    collectionId,
    enabled: Boolean(collectionId),
  });

  const isLoading = collectionQuery.isLoading || isProductsLoading;

  return (
    <section className="section-py bg-paper">
      <Container>
        <div className="mb-10">
          <h2 className="text-h2 text-ink">From {collectionTitle}</h2>
          <p className="text-caption mt-2 text-neutral-500">
            {isLoading
              ? 'Loading pieces…'
              : `${total} ${total === 1 ? 'piece' : 'pieces'}`}
          </p>
        </div>

        <ProductInfiniteGrid
          products={products}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onLoadMore={() => {
            void fetchNextPage();
          }}
          className="md:grid-cols-3 lg:grid-cols-4"
          emptyState={
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
          }
        />
      </Container>
    </section>
  );
}
