'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { HOME_COPY, OCCASION_TILES } from '@/lib/site-content';

export function ShopByOccasionSection() {
  const copy = HOME_COPY.shopByOccasion;

  return (
    <section aria-labelledby="shop-by-occasion-heading" className="section-py bg-neutral-100">
      <Container>
        <ScrollReveal className="mb-12 md:mb-16">
          <h2 id="shop-by-occasion-heading" className="text-display-l text-ink">
            {copy.title}
          </h2>
          <p className="text-body-l mt-5 max-w-lg text-neutral-700">{copy.subtitle}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-px bg-neutral-300 sm:grid-cols-2 lg:grid-cols-3">
          {OCCASION_TILES.map((occasion, index) => (
            <ScrollReveal key={occasion.id} delay={index * 0.06}>
              <Link
                href={occasion.href}
                className="group relative block aspect-[4/5] overflow-hidden bg-neutral-200 sm:aspect-[3/4]"
              >
                <Image
                  src={occasion.image}
                  alt={occasion.label}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-midnight/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <h3 className="text-h2 text-paper">{occasion.label}</h3>
                  <p className="text-body mt-2 text-paper/80">{occasion.description}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
