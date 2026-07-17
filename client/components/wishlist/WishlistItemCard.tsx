'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, X } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { CtaButton } from '@/components/ui/CtaButton';
import {
  moveWishlistItemToCart,
  removeWishlistItem,
  wishlistQueryKeys,
} from '@/lib/api/wishlist';
import { getProductHref } from '@/lib/product-url';
import { formatPrice } from '@/lib/site-content';
import type { WishlistItem } from '@/lib/types/wishlist';
import { cn } from '@/lib/utils';

type WishlistItemCardProps = {
  item: WishlistItem;
  onRemovedLocally?: (productId: string) => void;
};

export function WishlistItemCard({ item, onRemovedLocally }: WishlistItemCardProps) {
  const queryClient = useQueryClient();
  const { openCart } = useCart();
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const product = item.product;
  const unavailable = item.isUnavailable || !product;
  const availableSizes = useMemo(
    () => (product?.sizes ?? []).filter((size) => size.quantity > 0 && size.size !== 'CUSTOM'),
    [product?.sizes],
  );

  const href = product?.slug
    ? getProductHref({ slug: product.slug })
    : getProductHref({ id: item.productId });

  const removeMutation = useMutation({
    mutationFn: () => removeWishlistItem(item.wishlistItemId),
    onSuccess: async () => {
      onRemovedLocally?.(item.productId);
      await queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.all });
    },
    onError: () => {
      setActionError('Could not remove this piece. Please try again.');
    },
  });

  const moveMutation = useMutation({
    mutationFn: (sizeId: string) =>
      moveWishlistItemToCart(item.wishlistItemId, { sizeId, quantity: 1 }),
    onSuccess: async () => {
      onRemovedLocally?.(item.productId);
      await queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.all });
      openCart();
    },
    onError: () => {
      setActionError('Could not move this piece to your bag. Please try again.');
    },
  });

  function handleMoveToBag() {
    setActionError(null);

    if (availableSizes.length === 0) {
      setActionError('This piece is not available to add right now.');
      return;
    }

    if (!selectedSizeId) {
      setSizeError(true);
      return;
    }

    setSizeError(false);
    moveMutation.mutate(selectedSizeId);
  }

  const imageSrc = product?.imageUrl ?? '/images/placeholder-product.jpg';
  const name = product?.name ?? 'Saved piece';
  const price = product?.effectivePrice ?? product?.basePrice ?? 0;
  const mrp = product?.basePrice ?? price;
  const hasDiscount = mrp > price;

  return (
    <article
      className={cn(
        'group flex flex-col border-b border-neutral-300 py-8 md:flex-row md:gap-10 md:py-10',
        unavailable && 'opacity-70',
      )}
    >
      <Link
        href={unavailable ? '/shop' : href}
        className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-neutral-100 md:w-44 lg:w-52"
      >
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 208px"
          className="object-cover object-center transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-[1.02] motion-reduce:transition-none"
        />
      </Link>

      <div className="mt-5 flex min-w-0 flex-1 flex-col md:mt-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={unavailable ? '/shop' : href}
              className="text-h3 text-ink transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {name}
            </Link>
            {unavailable ? (
              <p className="text-caption mt-2 text-neutral-500">No longer available</p>
            ) : hasDiscount ? (
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-body-medium text-ink">{formatPrice(price)}</p>
                <p className="text-body text-neutral-500 line-through">{formatPrice(mrp)}</p>
              </div>
            ) : (
              <p className="text-body-medium mt-3 text-ink">{formatPrice(price)}</p>
            )}
          </div>

          <button
            type="button"
            aria-label={`Remove ${name} from saved pieces`}
            disabled={removeMutation.isPending}
            onClick={() => {
              setActionError(null);
              removeMutation.mutate();
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center text-neutral-500 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
          >
            <X className="h-4 w-4" strokeWidth={1.25} />
          </button>
        </div>

        {!unavailable && availableSizes.length > 0 && (
          <div className="mt-6">
            <p className="text-caption text-neutral-500">Select a size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const isSelected = selectedSizeId === size.sizeId;
                return (
                  <button
                    key={size.sizeId}
                    type="button"
                    onClick={() => {
                      setSelectedSizeId(size.sizeId);
                      setSizeError(false);
                      setActionError(null);
                    }}
                    className={cn(
                      'min-h-10 min-w-12 border px-3 text-ui transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                      isSelected
                        ? 'border-ink bg-ink text-paper'
                        : 'border-neutral-300 text-ink hover:border-ink',
                    )}
                  >
                    {size.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(sizeError || actionError) && (
          <p className="text-caption mt-4 text-error" role="alert">
            {actionError ?? 'Please select a size before continuing.'}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          {!unavailable && availableSizes.length > 0 ? (
            <CtaButton
              type="button"
              onClick={handleMoveToBag}
              disabled={moveMutation.isPending || removeMutation.isPending}
              className="w-full sm:w-auto"
            >
              {moveMutation.isPending ? 'Moving…' : 'Move to bag'}
            </CtaButton>
          ) : (
            <CtaButton href={unavailable ? '/shop' : href} className="w-full sm:w-auto">
              {unavailable ? 'Browse the shop' : 'View piece'}
            </CtaButton>
          )}

          {!unavailable && (
            <Link
              href={href}
              className="text-ui inline-flex items-center gap-2 text-neutral-700 underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              <Heart className="h-3.5 w-3.5" strokeWidth={1.25} />
              View details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
