'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ProductCard } from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStorefrontProducts } from '@/hooks/useStorefrontProducts';
import { getProductHref } from '@/lib/product-url';
import { HOME_COPY } from '@/lib/site-content';

export function NewArrivalsSection() {
  const copy = HOME_COPY.newArrivals;
  const { newArrivals, isLoading } = useStorefrontProducts();

  return (
    <section aria-labelledby="new-arrivals-heading" className="section-py bg-paper">
      <Container>
        <ScrollReveal className="mb-12 md:mb-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 id="new-arrivals-heading" className="text-display-l text-ink">
                {copy.title}
              </h2>
              <p className="text-body-l mt-5 text-neutral-700">{copy.description}</p>
            </div>
            <CtaButton href={copy.cta.href} variant="link">
              {copy.cta.label}
            </CtaButton>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <ScrollReveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 lg:aspect-auto lg:min-h-[720px]">
              <Image
                src={copy.campaignImage.src}
                alt={copy.campaignImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center"
              />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-14 lg:col-span-7 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex flex-col gap-3 lg:col-span-2">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
              : newArrivals.length > 0
                ? newArrivals.map((product, index) => (
                    <ScrollReveal key={product.id} delay={index * 0.05} className="lg:col-span-2">
                      <ProductCard product={product} href={getProductHref(product)} />
                    </ScrollReveal>
                  ))
                : (
                    <p className="col-span-2 text-body text-neutral-600 lg:col-span-4">
                      New arrivals will appear here once products are published in the atelier.
                    </p>
                  )}
          </div>
        </div>
      </Container>
    </section>
  );
}
