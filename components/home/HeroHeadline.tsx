'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { FADE_EASE } from '@/lib/motion';

const HEADLINE =
  "True presence doesn't demand attention; it commands through stillness.";

const words = HEADLINE.split(' ');

const wordVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: FADE_EASE,
    },
  },
};

const reducedVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: FADE_EASE },
  },
};

export function HeroHeadline() {
  const reducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.35,
      },
    },
  };

  if (reducedMotion) {
    return (
      <motion.h1
        initial="hidden"
        animate="visible"
        variants={reducedVariants}
        className="max-w-4xl text-center font-display text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.15] tracking-tight text-saan-bone"
      >
        {HEADLINE.split('stillness.')[0]}
        <em className="font-normal italic">stillness.</em>
      </motion.h1>
    );
  }

  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl text-center font-display text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.15] tracking-tight text-saan-bone"
    >
      {words.map((word, index) => {
        const isStillness = word === 'stillness.';
        return (
          <motion.span
            key={`${word}-${index}`}
            variants={wordVariants}
            className="mr-[0.28em] inline-block last:mr-0"
          >
            {isStillness ? (
              <em className="font-normal italic">{word}</em>
            ) : (
              word
            )}
          </motion.span>
        );
      })}
    </motion.h1>
  );
}
