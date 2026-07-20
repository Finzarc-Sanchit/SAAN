'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { CtaButton } from '@/components/ui/CtaButton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LUXURY_EASE, statSlideUp } from '@/lib/motion';
import { ATELIER_LANDING_COPY, HOME_COPY } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const [HEADLINE_LINE_1, HEADLINE_LINE_2] = HOME_COPY.craftsmanship.title.split('. ').map((line, index, parts) =>
  index < parts.length - 1 ? `${line}.` : line,
);

function CraftStat({
  value,
  suffix,
  label,
  index,
  prefersReducedMotion,
}: {
  value: number;
  suffix: string;
  label: string;
  index: number;
  prefersReducedMotion: boolean;
}) {
  const content = (
    <div className="min-w-0 flex-1 border-t border-paper/20 pt-5 sm:pt-6">
      <p className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-none tracking-tight text-paper">
        {value}
        {suffix}
      </p>
      <p className="mt-3 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-paper/55">
        {label}
      </p>
    </div>
  );

  if (prefersReducedMotion) {
    return content;
  }

  return (
    <motion.div
      className="min-w-0 flex-1"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={statSlideUp}
      transition={{ duration: 0.75, ease: [...LUXURY_EASE], delay: index * 0.1 }}
    >
      {content}
    </motion.div>
  );
}

export function CraftStorySection() {
  const copy = HOME_COPY.craftsmanship;
  const { stats } = ATELIER_LANDING_COPY;
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [48, -48],
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="craftsmanship-heading"
      className="relative overflow-hidden bg-midnight text-paper"
    >
      <div className="grid min-h-0 lg:min-h-[min(92vh,56rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20 xl:px-20">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, ease: [...LUXURY_EASE] }}
          >
            <h2
              id="craftsmanship-heading"
              className="max-w-xl font-display text-[clamp(2.75rem,7vw,5rem)] leading-[0.95] tracking-[-0.03em] text-paper"
            >
              <span className="block">{HEADLINE_LINE_1}</span>
              <span className="mt-1 block text-paper/55">{HEADLINE_LINE_2}</span>
            </h2>
          </motion.div>

          <motion.p
            className="mt-8 max-w-md text-sm leading-relaxed font-light text-paper/75 sm:text-[15px]"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, ease: [...LUXURY_EASE], delay: 0.08 }}
          >
            {copy.body}
          </motion.p>

          <div className="mt-10 flex gap-6 sm:mt-12 sm:gap-8" role="list" aria-label="Atelier figures">
            {stats.map((stat, index) => (
              <CraftStat
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                index={index}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>

          <motion.div
            className="mt-12 sm:mt-14"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.75, ease: [...LUXURY_EASE], delay: 0.2 }}
          >
            <CtaButton href={copy.cta.href} variant="primary" tone="light" className="min-w-[13rem]">
              {copy.cta.label}
            </CtaButton>
          </motion.div>
        </div>

        <div className="relative min-h-[26rem] sm:min-h-[32rem] lg:min-h-full">
          <div className="absolute inset-0 bg-midnight lg:hidden" aria-hidden />
          <div
            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-midnight to-transparent lg:hidden"
            aria-hidden
          />

          <div className="relative h-full min-h-[inherit] overflow-hidden">
            <motion.div className="absolute inset-0" style={{ y: imageY }}>
              <Image
                src={copy.detailImage.src}
                alt={copy.detailImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover object-center scale-105"
              />
            </motion.div>

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-midnight via-midnight/20 to-transparent lg:via-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight/30 via-transparent to-midnight/10 lg:from-transparent"
              aria-hidden
            />

            <p
              className={cn(
                'pointer-events-none absolute -right-4 bottom-0 select-none font-display leading-none tracking-[-0.06em] text-paper/[0.07]',
                'text-[clamp(10rem,28vw,22rem)]',
              )}
              aria-hidden
            >
              14
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
