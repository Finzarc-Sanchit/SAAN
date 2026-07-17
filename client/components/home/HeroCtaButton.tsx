'use client';

import { motion } from 'framer-motion';
import { CtaButton } from '@/components/ui/CtaButton';
import { LUXURY_EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

type HeroCtaButtonProps = {
  href: string;
  label: string;
  variant: 'primary' | 'secondary';
  className?: string;
};

export function HeroCtaButton({
  href,
  label,
  variant,
  className,
}: HeroCtaButtonProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.45, ease: LUXURY_EASE }}
      className={cn('inline-block', className)}
    >
      <CtaButton
        href={href}
        variant={variant}
        tone="light"
      >
        {label}
      </CtaButton>
    </motion.div>
  );
}
