'use client';

import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ProductCard } from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStorefrontProducts } from '@/hooks/useStorefrontProducts';
import { getProductHref } from '@/lib/product-url';

export function EditsRailSection() {
  const { featured, isLoading } = useStorefrontProducts();

  return (
    <section aria-label="Curated edits" className="section-py bg-neutral-100">
      <Container>
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-ui text-neutral-500">The Edit</p>
            <h2 className="text-h2 mt-2 text-ink">Curated for the season</h2>
          </div>
          <CtaButton href="/collections" variant="primary" className="min-w-[12rem]">
            View Edits
          </CtaButton>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide md:gap-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="w-[min(42vw,280px)] shrink-0 sm:w-[300px] md:w-[340px] lg:w-[380px]"
                >
                  <Skeleton className="aspect-[3/4] w-full" />
                </div>
              ))
            : featured.map((product) => (
                <div
                  key={product.id}
                  className="w-[min(42vw,280px)] shrink-0 sm:w-[300px] md:w-[340px] lg:w-[380px]"
                >
                  <ProductCard product={product} href={getProductHref(product)} />
                </div>
              ))}
        </div>
      </Container>
    </section>
  );
}
