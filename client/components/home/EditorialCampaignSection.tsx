'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { CtaButton } from '@/components/ui/CtaButton';
import { ProductCard } from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStorefrontProducts } from '@/hooks/useStorefrontProducts';
import { getProductHref } from '@/lib/product-url';
import { HOME_COPY } from '@/lib/site-content';

const FEATURED_PRODUCT_COUNT = 4;

function FeaturedProductSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function EditorialCampaignSection() {
  const copy = HOME_COPY.editorialCampaign;
  const { featured, isLoading } = useStorefrontProducts();
  const campaignProducts = featured.slice(0, FEATURED_PRODUCT_COUNT);

  return (
    <section
      aria-labelledby="editorial-campaign-heading"
      className="bg-midnight text-paper"
    >
      <div className="grid lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
        <div className="relative min-h-[28rem] sm:min-h-[32rem] lg:min-h-[min(82vh,52rem)]">
          <div className="absolute inset-0" aria-hidden>
            <Image
              src={copy.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center lg:hidden"
            />
            <Image
              src={copy.desktopImage}
              alt=""
              fill
              sizes="65vw"
              className="hidden object-cover object-center lg:block"
            />
          </div>

          <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end px-6 pb-14 pt-28 sm:px-10 lg:justify-center lg:px-10 lg:py-24 xl:px-16">
            <ScrollReveal className="max-w-lg">
              <h2 id="editorial-campaign-heading" className="text-display-l text-paper">
                {copy.title}
              </h2>
              <p className="text-body-l mt-5 max-w-md text-paper/80">{copy.subtitle}</p>
              <div className="mt-10">
                <CtaButton href={copy.cta.href} variant="primary" tone="light" className="min-w-[12rem]">
                  {copy.cta.label}
                </CtaButton>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <aside
          aria-labelledby="editorial-featured-collection-heading"
          className="bg-paper px-6 py-14 md:px-10 md:py-20 lg:flex lg:min-h-[min(82vh,52rem)] lg:flex-col lg:justify-center lg:px-8 lg:py-16 xl:px-10"
        >
          <ScrollReveal>
            <h3 id="editorial-featured-collection-heading" className="text-h2 text-ink">
              {copy.featuredCollectionTitle}
            </h3>
          </ScrollReveal>

          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-14 lg:mt-12">
            {isLoading
              ? Array.from({ length: FEATURED_PRODUCT_COUNT }).map((_, index) => (
                  <FeaturedProductSkeleton key={index} />
                ))
              : campaignProducts.map((product, index) => (
                  <ScrollReveal key={product.id} delay={index * 0.05}>
                    <ProductCard product={product} href={getProductHref(product)} />
                  </ScrollReveal>
                ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
