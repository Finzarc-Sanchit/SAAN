'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LUXURY_EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

const HOVER_TRANSITION = {
  duration: 0.5,
  ease: LUXURY_EASE,
} as const;

type StatTone = 'midnight' | 'ink';

type AtelierHeroStatCardProps = {
  value: number;
  suffix: string;
  label: string;
  tone: StatTone;
};

const TONE_BACKGROUND: Record<
  StatTone,
  { rest: string; brightened: string }
> = {
  midnight: {
    rest: '#12100e',
    brightened: '#1b1a18',
  },
  ink: {
    rest: '#0b0a09',
    brightened: '#151413',
  },
};

export function AtelierHeroStatCard({
  value,
  suffix,
  label,
  tone,
}: AtelierHeroStatCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isActive, setIsActive] = useState(false);
  const active = isActive && !prefersReducedMotion;
  const background = TONE_BACKGROUND[tone];

  return (
    <motion.div
      tabIndex={0}
      role="group"
      aria-label={`${value}${suffix} ${label}`}
      className={cn(
        'flex min-h-[11rem] cursor-pointer flex-col justify-between rounded-2xl px-7 py-7 text-paper outline-none sm:min-h-[14rem] lg:min-h-[12rem] lg:px-8 lg:py-8 xl:min-h-[13rem]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper/50',
      )}
      initial={false}
      animate={{
        y: active ? -4 : 0,
        scale: active ? 1.01 : 1,
        backgroundColor: active ? background.brightened : background.rest,
        boxShadow: active
          ? '0 12px 28px rgba(0, 0, 0, 0.2)'
          : '0 0 0 0 rgba(0, 0, 0, 0)',
      }}
      transition={HOVER_TRANSITION}
      onHoverStart={() => setIsActive(true)}
      onHoverEnd={() => setIsActive(false)}
      onFocus={(event) => {
        if (event.currentTarget.matches(':focus-visible')) {
          setIsActive(true);
        }
      }}
      onBlur={() => setIsActive(false)}
    >
      <motion.p
        className="font-display text-[clamp(2.75rem,5vw,4rem)] leading-none tracking-tight will-change-transform"
        animate={{ y: active ? -2 : 0 }}
        transition={HOVER_TRANSITION}
      >
        {value}
        {suffix}
      </motion.p>
      <motion.p
        className="text-[11px] font-medium tracking-[0.14em] text-paper uppercase"
        animate={{ opacity: active ? 0.8 : 0.55 }}
        transition={HOVER_TRANSITION}
      >
        {label}
      </motion.p>
    </motion.div>
  );
}
