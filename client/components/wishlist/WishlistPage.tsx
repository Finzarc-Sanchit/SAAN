'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { WishlistItemCard } from '@/components/wishlist/WishlistItemCard';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ProductCard } from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWishlist } from '@/hooks/useWishlist';
import { useStorefrontProducts } from '@/hooks/useStorefrontProducts';
import { getWishlist, wishlistQueryKeys } from '@/lib/api/wishlist';
import { getProductHref } from '@/lib/product-url';
import type { WishlistItem } from '@/lib/types/wishlist';

function WishlistLoadingState() {
  return (
    <div className="divide-y divide-neutral-300 border-t border-neutral-300">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-6 py-8 md:flex-row md:py-10">
          <Skeleton className="aspect-[3/4] w-full md:w-44 lg:w-52" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

function WishlistEmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center border border-dashed border-neutral-300 px-6 text-center">
      <Heart className="h-7 w-7 text-neutral-500" strokeWidth={1.25} aria-hidden />
      <h2 className="text-h2 mt-6 text-ink">No pieces saved yet</h2>
      <p className="text-body mt-3 max-w-md text-neutral-700">
        Save pieces while you browse — return here when you are ready to decide.
      </p>
      <CtaButton href="/shop" className="mt-8">
        Explore the shop
      </CtaButton>
    </div>
  );
}

function GuestWishlistGrid({
  productIds,
  onRemove,
}: {
  productIds: string[];
  onRemove: (productId: string) => void;
}) {
  const { products } = useStorefrontProducts();

  const resolved = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));

    return productIds
      .map((id) => byId.get(id))
      .filter((product): product is NonNullable<typeof product> => Boolean(product));
  }, [productIds, products]);

  if (resolved.length === 0) {
    return <WishlistEmptyState />;
  }

  return (
    <div>
      <p className="text-caption mb-8 text-neutral-500">
        {resolved.length} {resolved.length === 1 ? 'piece' : 'pieces'} saved on this device
      </p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-8 md:gap-y-14">
        {resolved.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} href={getProductHref(product)} />
            <button
              type="button"
              onClick={() => onRemove(product.id)}
              className="text-caption mt-3 text-neutral-500 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <p className="text-body mt-12 max-w-lg text-neutral-700">
        Sign in to keep these pieces across devices and move them into your bag.
      </p>
      <Link
        href="/account"
        className="text-ui mt-4 inline-flex border-b border-ink pb-1 text-ink transition-opacity hover:opacity-65"
      >
        Sign in
      </Link>
    </div>
  );
}

export function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading, openLoginDialog } = useAuth();
  const { items, count, toggleWishlist, replaceItems } = useWishlist();

  const wishlistQuery = useQuery({
    queryKey: wishlistQueryKeys.detail(),
    queryFn: getWishlist,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!wishlistQuery.data) return;
    replaceItems(wishlistQuery.data.items.map((item) => item.productId));
  }, [wishlistQuery.data, replaceItems]);

  const serverItems: WishlistItem[] = wishlistQuery.data?.items ?? [];

  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-neutral-300">
        <Container className="py-14 md:py-20">
          <h1 className="text-display-l text-ink">Wishlist</h1>
          <p className="text-body-l mt-5 max-w-xl text-neutral-700">
            Pieces you return to — considered, unhurried, ready when you are.
          </p>
          {!authLoading && (
            <p className="text-caption mt-6 text-neutral-500">
              {isAuthenticated
                ? `${serverItems.length} ${serverItems.length === 1 ? 'piece' : 'pieces'}`
                : `${count} ${count === 1 ? 'piece' : 'pieces'} on this device`}
            </p>
          )}
        </Container>
      </section>

      <section className="section-py">
        <Container>
          {authLoading ? (
            <WishlistLoadingState />
          ) : isAuthenticated ? (
            wishlistQuery.isLoading ? (
              <WishlistLoadingState />
            ) : wishlistQuery.isError ? (
              <div className="border border-neutral-300 px-6 py-10">
                <p className="text-body text-ink">We could not load your wishlist.</p>
                <button
                  type="button"
                  onClick={() => void wishlistQuery.refetch()}
                  className="text-ui mt-4 text-neutral-700 underline underline-offset-4 hover:text-ink"
                >
                  Try again
                </button>
              </div>
            ) : serverItems.length === 0 ? (
              <WishlistEmptyState />
            ) : (
              <div className="border-t border-neutral-300">
                {serverItems.map((item) => (
                  <WishlistItemCard
                    key={item.wishlistItemId}
                    item={item}
                    onRemovedLocally={(productId) => {
                      if (items.includes(productId)) {
                        toggleWishlist(productId);
                      }
                    }}
                  />
                ))}
              </div>
            )
          ) : items.length === 0 ? (
            <WishlistEmptyState />
          ) : (
            <div>
              <div className="mb-10 flex flex-col gap-4 border border-neutral-300 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-body text-neutral-700">
                  These pieces are saved on this device. Sign in to sync them to your account.
                </p>
                <button
                  type="button"
                  onClick={() => openLoginDialog('login')}
                  className="text-ui inline-flex min-h-11 items-center justify-center bg-ink px-6 text-paper transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Sign in
                </button>
              </div>
              <GuestWishlistGrid productIds={items} onRemove={toggleWishlist} />
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
