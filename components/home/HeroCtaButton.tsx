'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
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
      <Link
        href={href}
        className={cn(
          'chamfer-btn text-label-caps inline-flex items-center justify-center px-10 py-4 tracking-[0.12em] transition-all duration-300 ease-out',
          variant === 'primary'
            ? 'bg-saan-maroon/90 text-saan-bone backdrop-blur-sm hover:bg-saan-gold hover:text-saan-bone'
            : 'border border-saan-bone/80 bg-black/20 text-saan-bone backdrop-blur-sm hover:border-saan-gold hover:text-saan-gold'
        )}
      >
        {label}
      </Link>
    </motion.div>
  );
}
