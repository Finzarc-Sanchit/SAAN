'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HeroSection } from '@/components/home/HeroSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function HeroScrollContainer() {
  const containerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const disableScale = reducedMotion || isMobile;

  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    disableScale ? [1, 1] : [1, 0.95]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [1, 0.95] : [1, 0.8]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    disableScale ? [0, 0] : [0, -24]
  );

  return (
    <section
      ref={containerRef}
      aria-label="Hero"
      className="relative h-[150vh] md:h-[200vh]"
    >
      <div className="sticky top-0 z-0 h-screen overflow-hidden">
        <motion.div
          style={{ scale, opacity, y, willChange: 'transform' }}
          className="gpu-layer h-full w-full origin-center"
        >
          <HeroSection />
        </motion.div>
      </div>
    </section>
  );
}
