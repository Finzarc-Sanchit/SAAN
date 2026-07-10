'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/hooks/useWishlist';
import { formatPrice, getDiscountPercent, type ShopProduct } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type ShopProductCardProps = {
  product: ShopProduct;
  index: number;
};

export function ShopProductCard({ product, index }: ShopProductCardProps) {
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
    const timer = window.setTimeout(() => setShowAddedToast(false), 1800);
    return () => window.clearTimeout(timer);
  }, [showAddedToast]);

  const handleAddToCart = (e: React.MouseEvent) => {
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
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: (index % 3) * 0.05 }}
      className={cn(
        'chamfer-card group flex w-full flex-col',
        'bg-gradient-to-b from-saan-bone to-saan-champagne/25',
        'shadow-[0_8px_32px_rgba(75,0,6,0.06)] transition-shadow duration-500',
        'hover:shadow-[0_12px_40px_rgba(75,0,6,0.1)]'
      )}
    >
      <div className="relative p-2.5 pb-0">
        <Link href={productHref} className="chamfer-card block overflow-hidden bg-saan-champagne/15">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-5 top-5 z-10 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-saan-maroon px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-saan-bone shadow-sm">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-saan-champagne px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-saan-maroon shadow-sm">
              {discount}% Off
            </span>
          )}
        </div>

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
            'absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-saan-bone/95 text-saan-maroon shadow-sm transition-all duration-300',
            'opacity-100 md:opacity-0 md:group-hover:opacity-100',
            wishlisted && 'scale-105 opacity-100'
          )}
        >
          <Heart
            className={cn(
              'h-3.5 w-3.5 transition-all duration-300',
              wishlisted && 'fill-saan-maroon'
            )}
            strokeWidth={1.25}
          />
        </button>
      </div>

      <Link href={productHref} className="flex flex-1 flex-col px-3.5 pt-3.5">
        <span className="font-body text-[10px] font-medium uppercase tracking-[0.15em] text-saan-ink/40">
          {product.sku}
        </span>
        <h3 className="mt-1 font-display text-base font-medium leading-snug text-saan-maroon transition-colors duration-300 group-hover:text-saan-gold line-clamp-1">
          {product.name}
        </h3>
        <span className="mt-0.5 font-body text-xs text-saan-charcoal/55">
          {product.subtitle}
        </span>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-body text-sm font-bold text-saan-charcoal">
            {formatPrice(product.price, currency)}
          </span>
          {discount > 0 && (
            <span className="font-body text-[11px] text-saan-ink/40 line-through">
              MRP {formatPrice(product.mrp, currency)}
            </span>
          )}
        </div>
      </Link>

      <div className="relative px-3.5 pb-3.5 pt-2">
        {showAddedToast && (
          <span className="text-[10px] font-bold uppercase tracking-widest pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 bg-saan-charcoal px-3 py-1.5 text-saan-bone shadow-md">
            Added
          </span>
        )}
        <button
          type="button"
          aria-label={`Add ${product.name} to cart`}
          onClick={handleAddToCart}
          className="chamfer-btn text-[10px] font-bold uppercase tracking-widest flex w-full items-center justify-center gap-2 bg-saan-charcoal py-3 text-saan-bone transition-colors hover:bg-saan-maroon"
        >
          <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.25} />
          Add to Cart
        </button>
      </div>
    </motion.article>
  );
}
