'use client';

import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { TrendingProductCard } from '@/components/ui/TrendingProductCard';
import { Container } from '@/components/ui/Container';
import { EditorialSectionHeading } from '@/components/ui/EditorialSectionHeading';
import { Skeleton } from '@/components/ui/Skeleton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useStorefrontProducts } from '@/hooks/useStorefrontProducts';
import { LUXURY_EASE } from '@/lib/motion';
import { SECTION_COPY, TRENDING_FILTERS, type TrendingCategory } from '@/lib/site-content';
import { cn } from '@/lib/utils';

export function TrendingSection() {
  const [activeFilter, setActiveFilter] = useState<TrendingCategory>('new-arrivals');
  const prefersReducedMotion = useReducedMotion();
  const copy = SECTION_COPY.trending;
  const { products, isLoading } = useStorefrontProducts();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeFilter === 'new-arrivals') {
        return product.isNew;
      }
      if (activeFilter === 'luxury-pret') {
        return ['Kurta Sets', 'Dhoti Sets', 'Sharara Sets'].includes(product.category);
      }
      if (activeFilter === 'luxury-formals') {
        return ['Lehengas', 'Sarees'].includes(product.category);
      }
      if (activeFilter === 'luxury-lawn') {
        return ['Anarkalis'].includes(product.category) && !product.isNew;
      }
      if (activeFilter === 'luxury-basics') {
        return ['Co-ords', 'Dresses'].includes(product.category);
      }
      if (activeFilter === 'accessories') {
        return product.category === 'Accessories' || product.id.includes('clutch');
      }
      return false;
    });
  }, [activeFilter, products]);

  const carouselProducts = useMemo(() => {
    const items = filteredProducts.length > 0 ? filteredProducts : products;
    if (items.length === 0) return [];
    return [...items, ...items];
  }, [filteredProducts, products]);

  return (
    <section
      aria-labelledby="trending-heading"
      className="section-surface-warm section-py relative z-10"
    >
      <Container className="mb-10">
        <ScrollReveal ease={LUXURY_EASE}>
          <EditorialSectionHeading
            id="trending-heading"
            eyebrow={copy.eyebrow}
            title={`${copy.title}${copy.titleAccent}`}
            titleAccent={copy.titleAccent}
            subtitle={copy.subtitle}
          />
        </ScrollReveal>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap">
          {TRENDING_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={isActive}
                className={cn(
                  'text-label-caps shrink-0 border px-4 py-2.5 transition-colors duration-200',
                  isActive
                    ? 'border-saan-maroon bg-saan-maroon text-paper'
                    : 'border-saan-champagne bg-paper text-saan-ink hover:border-saan-maroon hover:bg-saan-maroon hover:text-paper',
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </Container>

      {isLoading ? (
        <div className="flex gap-5 overflow-hidden px-5 md:px-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] w-[240px] shrink-0" />
          ))}
        </div>
      ) : carouselProducts.length > 0 ? (
        <div className="marquee-container w-full">
          <div
            className={cn(
              'trending-track px-5 md:px-8',
              !prefersReducedMotion && 'animate-marquee-fast hover:[animation-play-state:paused]',
            )}
          >
            {carouselProducts.map((product, index) => (
              <TrendingProductCard key={`${product.id}-${index}`} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <Container>
          <p className="text-body text-neutral-600">New pieces are arriving soon.</p>
        </Container>
      )}
    </section>
  );
}
