'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { CtaButton } from '@/components/ui/CtaButton';
import { FEATURED_COLLECTION } from '@/lib/site-content';

export function FeaturedCollectionSection() {
  return (
    <section
      aria-labelledby="featured-collection-heading"
      className="section-surface-charcoal relative z-10 w-full overflow-hidden"
    >
      <div className="mx-auto max-w-[1600px]">
        <ScrollReveal>
          <div className="flex flex-col items-center lg:flex-row">
            <div className="relative min-h-[500px] w-full lg:min-h-[700px] lg:w-1/2">
              <Image
                src={FEATURED_COLLECTION.image}
                alt={FEATURED_COLLECTION.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center lg:object-right"
              />
            </div>

            <div className="relative z-10 flex w-full flex-col items-start justify-center px-6 py-16 text-center lg:w-1/2 lg:items-center lg:px-16 lg:py-24 xl:px-24">
              <p className="text-label-caps mb-4 text-saan-gold">{FEATURED_COLLECTION.subtitle}</p>
              <h2
                id="featured-collection-heading"
                className="font-display text-5xl uppercase tracking-widest text-saan-bone sm:text-6xl md:text-7xl"
              >
                {FEATURED_COLLECTION.title}
              </h2>
              <p className="mt-6 max-w-md font-light leading-relaxed text-saan-bone/70">
                {FEATURED_COLLECTION.tagline}
              </p>
              <div className="mt-10">
                <CtaButton href={FEATURED_COLLECTION.href} variant="primary">
                  Explore Collection
                </CtaButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
