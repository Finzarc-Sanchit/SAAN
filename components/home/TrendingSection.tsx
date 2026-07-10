'use client';

import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { TrendingProductCard } from '@/components/ui/TrendingProductCard';
import { Container } from '@/components/ui/Container';
import { EditorialSectionHeading } from '@/components/ui/EditorialSectionHeading';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LUXURY_EASE } from '@/lib/motion';
import { SHOP_PRODUCTS, SECTION_COPY, TRENDING_FILTERS, type TrendingCategory } from '@/lib/site-content';
import { cn } from '@/lib/utils';

export function TrendingSection() {
  const [activeFilter, setActiveFilter] = useState<TrendingCategory>('new-arrivals');
  const prefersReducedMotion = useReducedMotion();
  const copy = SECTION_COPY.trending;

  const filteredProducts = useMemo(() => {
    return SHOP_PRODUCTS.filter((product) => {
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
  }, [activeFilter]);

  const carouselProducts = useMemo(() => {
    const items = filteredProducts.length > 0 ? filteredProducts : SHOP_PRODUCTS;
    return [...items, ...items];
  }, [filteredProducts]);

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
                    ? 'border-saan-maroon bg-saan-maroon text-saan-bone'
                    : 'border-saan-champagne bg-saan-bone text-saan-ink hover:border-saan-maroon hover:bg-saan-maroon hover:text-saan-bone'
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </Container>

      <div className="marquee-container w-full">
        <div
          className={cn(
            'trending-track px-5 md:px-8',
            !prefersReducedMotion && 'animate-marquee-fast hover:[animation-play-state:paused]'
          )}
        >
          {carouselProducts.map((product, index) => (
            <TrendingProductCard key={`${product.id}-${index}`} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
