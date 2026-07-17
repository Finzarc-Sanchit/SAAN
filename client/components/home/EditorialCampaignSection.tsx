'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { CtaButton } from '@/components/ui/CtaButton';
import { HOME_COPY } from '@/lib/site-content';

export function EditorialCampaignSection() {
  const copy = HOME_COPY.editorialCampaign;

  return (
    <section aria-labelledby="editorial-campaign-heading" className="relative">
      <div className="relative min-h-[85vh] overflow-hidden bg-midnight md:min-h-[92vh]">
        <Image
          src={copy.image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={false}
        />
        <div className="absolute inset-0 bg-midnight/25" aria-hidden />

        <div className="relative z-10 flex min-h-[85vh] flex-col justify-end px-6 pb-16 pt-32 md:min-h-[92vh] md:px-12 md:pb-24 lg:px-16">
          <ScrollReveal className="max-w-2xl">
            <h2
              id="editorial-campaign-heading"
              className="text-display-l max-w-xl text-paper"
            >
              {copy.title}
            </h2>
            <div className="mt-8">
              <CtaButton href={copy.cta.href} variant="link" tone="light">
                {copy.cta.label}
              </CtaButton>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
