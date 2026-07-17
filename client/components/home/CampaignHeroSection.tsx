'use client';

import { useEffect, useRef } from 'react';
import { HeroHeadline } from '@/components/home/HeroHeadline';
import { CtaButton } from '@/components/ui/CtaButton';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { HERO_VIDEO } from '@/lib/hero-media';

export function CampaignHeroSection() {
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
    <section aria-label="Campaign hero" className="relative -mt-16 h-[100svh] md:-mt-[72px]">
      <div className="absolute inset-0 overflow-hidden bg-midnight">
        <video
          ref={videoRef}
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ objectPosition }}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={HERO_VIDEO.src} type="video/mp4" />
        </video>
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-midnight/50 via-midnight/20 to-midnight/60"
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-16 pt-28 md:px-12 md:pt-32">
        <HeroHeadline />
        <div className="mt-10">
          <CtaButton href="/shop" variant="primary" tone="light">
            Explore New Arrivals
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
