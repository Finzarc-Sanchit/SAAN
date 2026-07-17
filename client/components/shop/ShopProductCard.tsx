'use client';

import { ProductCard } from '@/components/ui/ProductCard';
import { getProductHref } from '@/lib/product-url';
import type { ShopProduct } from '@/lib/site-content';

type ShopProductCardProps = {
  product: ShopProduct;
  index?: number;
  showSaleBadge?: boolean;
};

/** @deprecated Prefer ProductCard directly. Kept for compatibility. */
export function ShopProductCard({
  product,
  showSaleBadge = false,
}: ShopProductCardProps) {
  return (
    <ProductCard
      product={product}
      href={getProductHref(product)}
      showSaleBadge={showSaleBadge}
    />
  );
}
