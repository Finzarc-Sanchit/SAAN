'use client';

import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { Container } from '@/components/ui/Container';
import type { ShopProduct } from '@/lib/site-content';

type CollectionProductGridProps = {
  products: ShopProduct[];
  collectionTitle: string;
};

export function CollectionProductGrid({ products, collectionTitle }: CollectionProductGridProps) {
  return (
    <section className="bg-saan-bone py-16 md:py-24">
      <Container className="max-w-[1600px]">
        <div className="mb-10">
          <h2 className="font-display text-2xl text-saan-maroon md:text-3xl">
            From {collectionTitle}
          </h2>
          <p className="mt-2 font-body text-xs uppercase tracking-widest text-saan-ink/50">
            {products.length} {products.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <ShopProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <p className="font-body text-saan-ink/60">
            Pieces from this line are arriving soon. Explore the full shop for more.
          </p>
        )}
      </Container>
    </section>
  );
}
