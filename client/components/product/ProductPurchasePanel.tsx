'use client';

import { Heart, MessageCircle, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductQuantitySelector } from '@/components/product/ProductQuantitySelector';
import { ProductSizeSelector } from '@/components/product/ProductSizeSelector';
import { SizeGuideModal } from '@/components/product/SizeGuideModal';
import type { ProductDetail } from '@/lib/product-defaults';
import { formatPrice, getDiscountPercent } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type ProductPurchasePanelProps = {
  product: ProductDetail;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < Math.floor(rating)
              ? 'fill-saan-gold text-saan-gold'
              : 'fill-none text-saan-gold/40'
          )}
          strokeWidth={1.25}
        />
      ))}
    </div>
  );
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem, openCart } = useCart();
  const { requireAuth } = useRequireAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const currency = product.currency ?? 'INR';
  const discount = getDiscountPercent(product.price, product.mrp);
  const saveAmount = product.mrp > product.price ? product.mrp - product.price : 0;
  const wishlisted = isWishlisted(product.id);

  const whatsappHref = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi SAAN, I'd like to know more about ${product.name} (${product.sku}).`
  )}`;

  const handleAddToBag = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    requireAuth(() => {
      setSizeError(false);
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        currency,
        image: product.image,
        size: selectedSize,
        quantity,
      });
      openCart();
    });
  };

  return (
    <>
      <p className="text-label-caps text-[10px] text-saan-ink/45">
        {product.sku} · {product.collectionLabel}
      </p>

      <h1 className="mt-2 font-display text-3xl text-saan-charcoal md:text-4xl">
        {product.name}
      </h1>
      <p className="mt-1 font-display text-base font-light italic text-saan-ink/60">
        {product.subtitle}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <StarRating rating={product.rating} />
        <span className="font-body text-xs text-saan-ink/50">
          {product.rating} · {product.reviewCount} reviews
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <span className="font-body text-2xl font-semibold text-saan-charcoal">
          {formatPrice(product.price, currency)}
        </span>
        {discount > 0 && (
          <>
            <span className="font-body text-sm text-saan-ink/40 line-through">
              {formatPrice(product.mrp, currency)}
            </span>
            <span className="rounded-sm bg-saan-champagne px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-saan-maroon">
              Save {formatPrice(saveAmount, currency)}
            </span>
          </>
        )}
      </div>
      <p className="mt-2 font-body text-[11px] text-saan-ink/45">{product.gstNote}</p>

      <div className="mt-6">
        <p className="text-label-caps text-[10px] text-saan-ink/50">
          Colour — {product.colourLabel}
        </p>
        <div className="mt-2 flex gap-2">
          <span
            className="h-8 w-8 rounded-full border-2 border-saan-charcoal ring-2 ring-saan-bone ring-offset-1"
            style={{ backgroundColor: product.colourSwatch }}
            aria-label={product.colourLabel}
          />
        </div>
      </div>

      <ProductSizeSelector
        sizes={product.sizes}
        selectedSize={selectedSize}
        onSelect={(size) => {
          setSelectedSize(size);
          setSizeError(false);
        }}
        fitNotes={product.fitNotes}
        sizeStock={product.sizeStock}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />

      <ProductQuantitySelector quantity={quantity} onChange={setQuantity} />

      {sizeError && (
        <p className="mt-3 font-body text-xs text-saan-maroon" role="alert">
          Please select a size before adding to bag.
        </p>
      )}

      <button
        type="button"
        onClick={handleAddToBag}
        className="text-label-caps mt-6 flex w-full items-center justify-center gap-2 bg-saan-charcoal py-4 text-saan-bone transition-colors hover:bg-saan-maroon"
      >
        Add to Bag — {formatPrice(product.price * quantity, currency)}
        <span aria-hidden>→</span>
      </button>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={wishlisted}
          onClick={() => toggleWishlist(product.id)}
          className={cn(
            'text-label-caps flex items-center justify-center gap-2 border border-saan-charcoal py-3.5 text-saan-charcoal transition-colors hover:bg-saan-champagne/30',
            wishlisted && 'border-saan-maroon text-saan-maroon'
          )}
        >
          <Heart
            className={cn('h-4 w-4', wishlisted && 'fill-saan-maroon')}
            strokeWidth={1.25}
          />
          Save
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-label-caps flex items-center justify-center gap-2 bg-[#25D366] py-3.5 text-white transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.25} />
          Ask on WhatsApp
        </a>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-saan-champagne/40 pt-5">
        {['Free Shipping', '7-Day Returns', 'Authentic'].map((label) => (
          <span
            key={label}
            className="font-body text-[10px] uppercase tracking-widest text-saan-ink/45"
          >
            {label}
          </span>
        ))}
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}
