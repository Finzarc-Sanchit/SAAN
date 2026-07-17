'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { COMMUNITY_IMAGES, HOME_COPY } from '@/lib/site-content';
import { cn } from '@/lib/utils';

export function CommunitySection() {
  const copy = HOME_COPY.community;

  return (
    <section
      aria-labelledby="community-heading"
      className="bg-paper py-14 md:py-20"
    >
      <ScrollReveal className="mb-7 text-center md:mb-9">
        <h2 id="community-heading" className="text-h2 text-ink">
          <a
            href={copy.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm underline-offset-4 transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            Follow us @saan.label
          </a>
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-2 gap-px px-2 md:grid-cols-4 lg:grid-cols-8">
        {COMMUNITY_IMAGES.map((image, index) => (
          <a
            key={image.src}
            href={copy.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${image.alt} on Instagram`}
            className={cn(
              'group relative aspect-[3/4] overflow-hidden bg-neutral-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
              index >= 4 && 'hidden md:block',
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 25vw, 12.5vw"
              className="object-cover object-center transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-[1.025] motion-reduce:transition-none"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
