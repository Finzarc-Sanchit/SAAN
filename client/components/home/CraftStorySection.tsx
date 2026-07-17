'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { HOME_COPY } from '@/lib/site-content';

export function CraftStorySection() {
  const copy = HOME_COPY.craftsmanship;

  return (
    <section aria-labelledby="craftsmanship-heading" className="section-py bg-neutral-100">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <ScrollReveal className="order-2 lg:order-1 lg:col-span-5">
            <div className="max-w-md">
              <h2 id="craftsmanship-heading" className="text-display-l text-ink">
                {copy.title}
              </h2>
              <p className="text-body-l mt-6 text-neutral-700">{copy.body}</p>
              <div className="mt-8">
                <CtaButton href={copy.cta.href} variant="link">
                  {copy.cta.label}
                </CtaButton>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="order-1 lg:order-2 lg:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-300 lg:aspect-[5/3]">
              <Image
                src={copy.detailImage.src}
                alt={copy.detailImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center"
              />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
