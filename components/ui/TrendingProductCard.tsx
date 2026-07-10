'use client';

import { Heart, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/hooks/useWishlist';
import { formatPrice, getDiscountPercent } from '@/lib/site-content';
import { cn } from '@/lib/utils';

export type TrendingProduct = {
  id: string;
  name: string;
  price: number;
  mrp: number;
  currency?: string;
  image: string;
  isNew?: boolean;
};

type TrendingProductCardProps = {
  product: TrendingProduct;
  className?: string;
};

export function TrendingProductCard({ product, className }: TrendingProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem, openCart } = useCart();
  const wishlisted = isWishlisted(product.id);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const currency = product.currency ?? 'INR';
  const productHref = `/shop/${product.id}`;
  const discount =
    product.mrp > product.price
      ? getDiscountPercent(product.price, product.mrp)
      : 0;

  useEffect(() => {
    if (!showAddedToast) return;
    const timer = window.setTimeout(() => setShowAddedToast(false), 2000);
    return () => window.clearTimeout(timer);
  }, [showAddedToast]);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      currency,
      image: product.image,
    });
    openCart();
    setShowAddedToast(true);
  }

  return (
    <article
      className={cn(
        'chamfer-card trending-card group flex flex-col',
        'bg-gradient-to-b from-saan-bone to-saan-champagne/20',
        'shadow-[0_8px_32px_rgba(75,0,6,0.06)] transition-shadow duration-500 hover:shadow-[0_12px_40px_rgba(75,0,6,0.1)]',
        className
      )}
    >
      <div className="relative p-2 pb-0">
        <Link href={productHref} className="chamfer-card block overflow-hidden bg-saan-champagne/15">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="280px"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        </Link>

        {product.isNew && (
          <span className="text-label-caps pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-saan-maroon px-2.5 py-1 text-saan-bone">
            New
          </span>
        )}

        <button
          type="button"
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={cn(
            'absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-saan-bone/95 text-saan-maroon shadow-sm transition-all duration-200',
            'opacity-100 md:opacity-0 md:group-hover:opacity-100',
            wishlisted && 'scale-110 opacity-100'
          )}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-all duration-200',
              wishlisted && 'fill-saan-maroon'
            )}
            strokeWidth={1.25}
          />
        </button>
      </div>

      <Link href={productHref} className="block px-3 pt-3">
        <h3 className="font-body line-clamp-2 text-sm font-normal leading-snug tracking-normal text-saan-charcoal group-hover:text-saan-maroon transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-body text-base font-semibold text-saan-charcoal">
            {formatPrice(product.price, currency)}
          </span>
          {discount > 0 && (
            <>
              <span className="font-body text-xs text-saan-ink/45 line-through">
                MRP {formatPrice(product.mrp, currency)}
              </span>
              <span className="rounded-full bg-saan-champagne px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-saan-maroon">
                {discount}% Off
              </span>
            </>
          )}
        </div>
      </Link>

      <div className="relative px-3 pb-3 pt-2">
        {showAddedToast && (
          <span className="text-label-caps pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 bg-saan-charcoal px-3 py-1.5 text-saan-bone shadow-md">
            Added
          </span>
        )}
        <button
          type="button"
          aria-label={`Add ${product.name} to cart`}
          onClick={handleAddToCart}
          className="chamfer-btn text-label-caps flex w-full items-center justify-center gap-2 bg-saan-charcoal py-3 text-saan-bone transition-colors hover:bg-saan-maroon"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={1.25} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}
