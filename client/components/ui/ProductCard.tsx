'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/AuthProvider';
import { useWishlist } from '@/hooks/useWishlist';
import {
  addWishlistItem,
  removeWishlistItemByProductId,
  wishlistQueryKeys,
} from '@/lib/api/wishlist';
import { getProductHoverImage } from '@/lib/product-images';
import { formatPrice, getDiscountPercent, type ShopProduct } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Pick<
    ShopProduct,
    'id' | 'name' | 'price' | 'mrp' | 'currency' | 'image' | 'images' | 'isNew'
  >;
  href: string;
  showSaleBadge?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  href,
  showSaleBadge = false,
  className,
}: ProductCardProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const hoverImage = getProductHoverImage(product.images, product.image);
  const currency = product.currency ?? 'INR';
  const discountPercent = getDiscountPercent(product.price, product.mrp);
  const hasDiscount = discountPercent > 0;

  function invalidateWishlist() {
    void queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.all });
  }

  function handleWishlistToggle() {
    const nextWishlisted = !wishlisted;
    toggleWishlist(product.id);

    if (!isAuthenticated) {
      return;
    }

    if (nextWishlisted) {
      void addWishlistItem(product.id)
        .then(() => invalidateWishlist())
        .catch(() => {
          toggleWishlist(product.id);
        });
      return;
    }

    void removeWishlistItemByProductId(product.id)
      .then(() => invalidateWishlist())
      .catch(() => {
        toggleWishlist(product.id);
      });
  }

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <Link href={href} className="product-image-crossfade block bg-neutral-100">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 28vw"
            className="product-image-front object-cover object-center"
          />
          <Image
            src={hoverImage}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 28vw"
            className="product-image-hover absolute inset-0 object-cover object-center"
          />
          <span className="absolute inset-x-2 bottom-2 z-10 hidden h-11 translate-y-2 items-center justify-center bg-midnight/95 px-4 text-ui uppercase tracking-[0.14em] text-paper opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transform-none motion-reduce:transition-none md:flex">
            Buy now
          </span>
        </div>

        {(hasDiscount || showSaleBadge) && (
          <span className="absolute left-0.5 top-0.5 z-10 bg-signature px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-paper md:left-4 md:top-4 md:px-2.5 md:py-1 md:text-[10px] md:tracking-[0.12em]">
            {hasDiscount ? `${discountPercent}% off` : 'Sale'}
          </span>
        )}
      </Link>

      <button
        type="button"
        aria-label={
          wishlisted
            ? `Remove ${product.name} from wishlist`
            : `Add ${product.name} to wishlist`
        }
        aria-pressed={wishlisted}
        onClick={handleWishlistToggle}
        className={cn(
          'absolute right-0.5 top-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-paper/90 text-ink shadow-sm backdrop-blur-sm transition-colors hover:text-signature focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signature/40 md:right-4 md:top-4 md:h-9 md:w-9',
          wishlisted && 'text-signature',
        )}
      >
        <Heart
          className={cn(
            'h-3 w-3 md:h-4 md:w-4',
            wishlisted && 'fill-signature text-signature',
          )}
          strokeWidth={1.25}
        />
      </button>

      <Link href={href} className="mt-4 flex flex-col gap-1.5">
        <h3 className="text-body-l text-ink line-clamp-1">{product.name}</h3>
        {hasDiscount ? (
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-body-medium text-ink">
              {formatPrice(product.price, currency)}
            </span>
            <span className="text-body text-neutral-500 line-through decoration-1">
              {formatPrice(product.mrp, currency)}
            </span>
          </span>
        ) : (
          <span className="text-body-medium text-ink">
            {formatPrice(product.price, currency)}
          </span>
        )}
      </Link>
    </article>
  );
}
