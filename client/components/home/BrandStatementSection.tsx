'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { HOME_COPY } from '@/lib/site-content';

export function BrandStatementSection() {
  const copy = HOME_COPY.brandPhilosophy;
  const { mobile, desktop } = copy.image;

  return (
    <section
      aria-labelledby="brand-philosophy-heading"
      className="relative isolate min-h-[48rem] overflow-hidden bg-midnight text-paper lg:min-h-[52rem]"
    >
      <Image
        src={mobile.src}
        alt={mobile.alt}
        fill
        sizes="(max-width: 767px) 100vw, 1px"
        className="object-cover object-center md:hidden"
      />
      <Image
        src={desktop.src}
        alt={desktop.alt}
        fill
        sizes="(min-width: 768px) 100vw, 1px"
        className="hidden object-cover object-center md:block"
      />

      <div className="relative flex min-h-[48rem] flex-col justify-between px-6 py-10 sm:px-10 sm:py-14 lg:min-h-[52rem] lg:px-16 lg:py-16 xl:px-24">
        <ScrollReveal className="ml-auto max-w-sm border-l border-paper/40 pl-5 sm:pl-7">
          <p className="text-body text-paper/85">{copy.body}</p>
        </ScrollReveal>

        <div className="grid items-end gap-10 pt-24 lg:grid-cols-12 lg:gap-12">
          <ScrollReveal className="lg:col-span-8">
            <h2
              id="brand-philosophy-heading"
              className="max-w-4xl font-display text-[3.5rem] font-normal leading-[0.92] tracking-[-0.035em] text-paper sm:text-[5rem] lg:text-[7rem]"
            >
              {copy.headline}
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.12} className="lg:col-span-4">
            <blockquote className="border-t border-paper/40 pt-6">
              <p className="font-display text-h3 max-w-sm italic leading-snug text-paper">
                &ldquo;{copy.pullQuote}&rdquo;
              </p>
            </blockquote>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
