'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { HeroHeadline } from '@/components/home/HeroHeadline';
import { HeroCtaButton } from '@/components/home/HeroCtaButton';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { HERO_VIDEO } from '@/lib/hero-media';
import { LUXURY_EASE } from '@/lib/motion';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const objectPosition = isDesktop
    ? HERO_VIDEO.objectPositionDesktop
    : HERO_VIDEO.objectPositionMobile;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        await video.play();
      } catch {
        // Autoplay may be blocked.
      }
    };

    playVideo();

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        void playVideo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 overflow-hidden bg-saan-charcoal">
        <video
          ref={videoRef}
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ objectPosition }}
          className="gpu-layer absolute inset-0 h-full w-full origin-center object-cover"
        >
          <source src={HERO_VIDEO.src} type="video/mp4" />
        </video>
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/55"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]"
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-16 pt-28 md:px-12 md:pt-32">
        <HeroHeadline />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
        >
          <HeroCtaButton
            href="/collections"
            label="Explore Collection"
            variant="primary"
          />
          <HeroCtaButton
            href="/booking"
            label="Schedule Booking"
            variant="secondary"
          />
        </motion.div>
      </div>
    </div>
  );
}
