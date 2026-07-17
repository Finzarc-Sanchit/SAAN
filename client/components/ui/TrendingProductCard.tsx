'use client';

import { ProductCard } from '@/components/ui/ProductCard';
import { getProductHref } from '@/lib/product-url';
import type { ShopProduct } from '@/lib/site-content';
import { cn } from '@/lib/utils';

export type TrendingProduct = Pick<
  ShopProduct,
  'id' | 'name' | 'price' | 'mrp' | 'currency' | 'image' | 'isNew' | 'slug'
>;

type TrendingProductCardProps = {
  product: TrendingProduct;
  className?: string;
};

export function TrendingProductCard({ product, className }: TrendingProductCardProps) {
  return (
    <div className={cn('trending-card', className)}>
      <ProductCard
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          currency: product.currency ?? 'INR',
          image: product.image,
          isNew: product.isNew ?? false,
        }}
        href={getProductHref(product)}
      />
    </div>
  );
}
