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

const NEW_ARRIVALS_PRODUCT_COUNT = 8;

export function NewArrivalsSection() {
  const copy = HOME_COPY.newArrivals;
  const { newArrivals, isLoading } = useStorefrontProducts();

  return (
    <section aria-labelledby="new-arrivals-heading" className="section-py bg-paper">
      <Container>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:sticky lg:top-[calc(4.5rem+1px)] lg:col-span-5 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 lg:aspect-auto lg:h-[calc(100svh-5rem)] lg:max-h-[56rem]">
              <Image
                src={copy.campaignImage.src}
                alt={copy.campaignImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center"
                priority={false}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight/50 via-midnight/10 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 lg:p-10">
                <p className="text-caption uppercase tracking-[0.18em] text-paper/70">
                  {copy.campaign.eyebrow}
                </p>
                <h2 id="new-arrivals-heading" className="text-display-l mt-4 text-paper">
                  {copy.campaign.headline.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
                <div className="mt-6 space-y-1">
                  {copy.campaign.body.map((line) => (
                    <p key={line} className="text-body font-light text-paper/75">
                      {line}
                    </p>
                  ))}
                </div>
                <div className="mt-8">
                  <CtaButton href={copy.cta.href} variant="link" tone="light">
                    {copy.cta.label} →
                  </CtaButton>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-14 lg:col-span-7 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: NEW_ARRIVALS_PRODUCT_COUNT }).map((_, index) => (
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
