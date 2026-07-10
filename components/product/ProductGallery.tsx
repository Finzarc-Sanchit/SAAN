'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LUXURY_EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

type ProductGalleryProps = {
  images: string[];
  productName: string;
  discountPercent: number;
};

const AUTO_SCROLL_MS = 4500;

export function ProductGallery({
  images,
  productName,
  discountPercent,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (prefersReducedMotion || isPaused || images.length <= 1) return;
    const timer = window.setInterval(advance, AUTO_SCROLL_MS);
    return () => window.clearInterval(timer);
  }, [advance, prefersReducedMotion, isPaused, images.length]);

  const mainImage = images[activeIndex] ?? images[0];

  return (
    <div
      className="flex gap-2.5 md:gap-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="hidden shrink-0 flex-col gap-2 sm:flex">
        {images.map((src, index) => (
          <motion.button
            key={`${src}-${index}`}
            type="button"
            aria-label={`View image ${index + 1}`}
            aria-current={activeIndex === index ? 'true' : undefined}
            onClick={() => setActiveIndex(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'relative h-11 w-11 overflow-hidden rounded-full border-2 transition-colors md:h-12 md:w-12',
              activeIndex === index
                ? 'border-saan-maroon'
                : 'border-saan-champagne/60 hover:border-saan-gold'
            )}
          >
            <Image src={src} alt="" fill sizes="48px" className="object-cover" />
          </motion.button>
        ))}
      </div>

      <div
        className="relative w-full overflow-hidden bg-saan-champagne/10"
        style={{ aspectRatio: '4/5', maxHeight: 'min(56vh, 520px)' }}
      >
        {discountPercent > 0 && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: LUXURY_EASE }}
            className="absolute left-3 top-3 z-10 rounded-full bg-saan-maroon px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-saan-bone"
          >
            {discountPercent}% off
          </motion.span>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={
              prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.02 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.55, ease: LUXURY_EASE }}
            className="absolute inset-0"
          >
            <Image
              src={mainImage}
              alt={productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && !prefersReducedMotion && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  activeIndex === index ? 'w-5 bg-saan-bone' : 'w-1.5 bg-saan-bone/45'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
