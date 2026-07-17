'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CtaButton } from '@/components/ui/CtaButton';
import { LUXURY_EASE } from '@/lib/motion';
import { SAANLABEL_SECTIONS } from '@/lib/saanlabel-images';

export function ShopHeroSection() {
  const handleScrollToCatalog = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const catalog = document.getElementById('shop-catalog');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-full w-full bg-paper">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={SAANLABEL_SECTIONS.shopHero}
          alt="SAAN Women's Wear Collection"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[35%_center] md:object-center transition-transform duration-1000"
        />
        {/* Gradients for readability */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/40 md:to-black/50"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 pb-16 pt-28 md:px-24 md:pt-32 items-center md:items-end text-center md:text-right">
        <div className="max-w-xl md:max-w-2xl flex flex-col items-center md:items-end">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: LUXURY_EASE }}
            className="flex flex-col gap-1 md:gap-2"
          >
            <h1 className="font-body font-bold text-white uppercase tracking-[0.12em] text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.1] md:leading-[1.05]">
              New
              <br />
              Arrivals
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: LUXURY_EASE, delay: 0.3 }}
            className="mt-6 font-body font-normal text-white/90 uppercase tracking-[0.25em] text-xs sm:text-sm md:text-base lg:text-lg"
          >
            In Women&apos;s Wear
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: LUXURY_EASE, delay: 0.6 }}
            className="mt-10 md:mt-12"
          >
            <CtaButton
              type="button"
              variant="primary"
              tone="light"
              onClick={handleScrollToCatalog}
            >
              Shop Now
            </CtaButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
