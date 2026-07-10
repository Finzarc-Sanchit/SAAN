'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { FADE_EASE, fadeUpVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

type EaseTuple = readonly [number, number, number, number];

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'article';
  ease?: EaseTuple;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  as = 'div',
  ease = FADE_EASE,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Tag = motion[as];

  if (prefersReducedMotion) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  return (
    <Tag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUpVariants}
      transition={{ delay, duration: 0.8, ease: [...ease] }}
    >
      {children}
    </Tag>
  );
}
