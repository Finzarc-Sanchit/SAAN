'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { CountUpNumber } from '@/components/motion/CountUpNumber';
import { TypewriterText } from '@/components/motion/TypewriterText';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  LUXURY_EASE,
  collectionSlideLeft,
  collectionSlideRight,
  statSlideUp,
} from '@/lib/motion';
import { ATELIER_LANDING_COPY } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const STAT_VARIANTS = [collectionSlideLeft, statSlideUp, collectionSlideRight] as const;
const TYPEWRITER_SPEED = 42;
const HEADLINE_LINE_1 = ATELIER_LANDING_COPY.headline;
const HEADLINE_LINE_2 = ATELIER_LANDING_COPY.headlineAccent;

function AnimatedStat({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const variants = STAT_VARIANTS[index] ?? statSlideUp;

  if (prefersReducedMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={variants}
      transition={{ duration: 0.8, ease: [...LUXURY_EASE], delay: index * 0.12 }}
    >
      {children}
    </motion.div>
  );
}

function PressMarquee() {
  const { pressEyebrow, press } = ATELIER_LANDING_COPY;
  const prefersReducedMotion = useReducedMotion();
  const items = [...press, ...press];

  if (prefersReducedMotion) {
    return (
      <div className="pb-8">
        <Container>
          <p className="text-label-caps mb-4 text-saan-bone/60">{pressEyebrow}</p>
          <p className="text-sm font-light text-saan-bone/70">
            {press.map((item) => item.name).join('   ·   ')}
          </p>
        </Container>
      </div>
    );
  }

  return (
    <div className="pb-6 pt-10">
      <Container className="mb-4">
        <p id="as-seen-in-heading" className="text-label-caps text-saan-bone/60">
          {pressEyebrow}
        </p>
      </Container>
      <ul className="sr-only" role="list">
        {press.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <div className="marquee-container w-full" aria-hidden>
        <div className="press-track animate-marquee-slow">
          {items.map((item, index) => (
            <span
              key={`${item.id}-${index}`}
              className="press-marquee-item font-display text-lg text-saan-bone/70 sm:text-xl"
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AtelierStatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [line1Complete, setLine1Complete] = useState(prefersReducedMotion);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const introY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [24, -48]);
  const bodyY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [40, -72]);
  const statsY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [56, -96]);
  const ctaY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [32, -40]);

  const { eyebrow, body, stats, heroImage, cta } = ATELIER_LANDING_COPY;

  return (
    <section
      id="atelier"
      ref={sectionRef}
      aria-labelledby="atelier-landing-heading"
      className="relative z-10 text-saan-bone"
    >
      <div className="sticky top-0 min-h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/65" aria-hidden />

        <div className="relative flex min-h-[90vh] flex-col justify-between pb-36 py-16 md:py-20 lg:py-24">
          <Container className="flex flex-1 flex-col">
            <motion.div style={{ y: introY }} className="max-w-3xl text-left">
              <div className="mb-6 flex items-center gap-4">
                <span className="h-px w-10 bg-saan-bone/60" aria-hidden />
                <p className="text-label-caps text-saan-bone/80">{eyebrow}</p>
              </div>
              <h2
                id="atelier-landing-heading"
                className="text-left text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] font-bold tracking-tight uppercase"
              >
                <span className="sr-only">
                  {HEADLINE_LINE_1} {HEADLINE_LINE_2}
                </span>
                <span aria-hidden>
                  <TypewriterText
                    text={HEADLINE_LINE_1}
                    speed={TYPEWRITER_SPEED}
                    onComplete={() => setLine1Complete(true)}
                  />
                  <br />
                  {(line1Complete || prefersReducedMotion) && (
                    <TypewriterText text={HEADLINE_LINE_2} speed={TYPEWRITER_SPEED} />
                  )}
                </span>
              </h2>
            </motion.div>

            <motion.div
              style={{ y: bodyY }}
              className="mt-8 max-w-xl space-y-5 text-left text-sm leading-relaxed font-light text-saan-bone/85 sm:text-[15px]"
            >
              {body.map((paragraph) => (
                <p key={paragraph.slice(0, 28)}>{paragraph}</p>
              ))}
            </motion.div>

            <motion.div
              style={{ y: statsY }}
              className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 md:mt-20 lg:mt-24"
            >
              {stats.map((stat, index) => (
                <AnimatedStat key={stat.label} index={index}>
                  <div className="text-left">
                    <p
                      className={cn(
                        'inline-flex w-fit text-[clamp(3rem,8vw,5.5rem)] leading-none font-bold tracking-tight',
                        'accent' in stat && stat.accent && 'bg-white/15 px-4 py-2'
                      )}
                    >
                      <CountUpNumber value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-4 text-xs font-bold tracking-[0.18em] uppercase sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                </AnimatedStat>
              ))}
            </motion.div>
          </Container>

          <motion.div
            style={{ y: ctaY }}
            className="mt-16 flex justify-center px-5 md:mt-20 lg:justify-start lg:pl-5"
          >
            <CtaButton href={cta.href} variant="primary" className="chamfer-btn">
              {cta.label}
            </CtaButton>
          </motion.div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          aria-labelledby="as-seen-in-heading"
        >
          <div className="pointer-events-auto">
            <PressMarquee />
          </div>
        </div>
      </div>

      <div className="h-[30vh] bg-saan-bone" aria-hidden />
    </section>
  );
}
