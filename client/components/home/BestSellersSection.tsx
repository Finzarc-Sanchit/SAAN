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

export function BestSellersSection() {
  const copy = HOME_COPY.bestSellers;
  const { bestSellers, isLoading } = useStorefrontProducts();

  return (
    <section aria-labelledby="best-sellers-heading" className="section-py bg-paper">
      <Container>
        <ScrollReveal className="mb-12 md:mb-16">
          <h2 id="best-sellers-heading" className="text-display-l text-ink">
            {copy.title}
          </h2>
          <p className="text-body-l mt-5 max-w-lg text-neutral-700">{copy.description}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-12">
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-14 lg:col-span-7 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex flex-col gap-3">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
              : bestSellers.length > 0
                ? bestSellers.map((product, index) => (
                    <ScrollReveal key={product.id} delay={index * 0.05}>
                      <ProductCard product={product} href={getProductHref(product)} />
                    </ScrollReveal>
                  ))
                : (
                    <p className="col-span-2 text-body text-neutral-600 lg:col-span-3">
                      Best sellers will appear here once products are published.
                    </p>
                  )}
          </div>

          <ScrollReveal delay={0.15} className="lg:col-span-5 lg:h-full">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 lg:aspect-auto lg:h-full lg:min-h-[800px]">
              <Image
                src={copy.campaignImage.src}
                alt={copy.campaignImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/60 to-transparent p-6 md:p-8">
                <CtaButton href={copy.cta.href} variant="primary" tone="light" className="min-w-[12rem]">
                  {copy.cta.label}
                </CtaButton>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
