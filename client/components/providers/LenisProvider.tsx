'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { onPageScrollLockChange } from '@/lib/scroll-lock';

type LenisProviderProps = {
  children: React.ReactNode;
};

function scrollPageToTop(lenis: Lenis | null) {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
    return;
  }

  window.scrollTo(0, 0);
}

function ScrollToTopOnNavigate({ lenisRef }: { lenisRef: React.RefObject<Lenis | null> }) {
  const pathname = usePathname();

  useEffect(() => {
    scrollPageToTop(lenisRef.current);
    requestAnimationFrame(() => scrollPageToTop(lenisRef.current));
  }, [pathname, lenisRef]);

  return null;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    const unsubscribeScrollLock = onPageScrollLockChange((locked) => {
      if (locked) {
        lenis.stop();
        return;
      }
      lenis.start();
    });

    return () => {
      cancelAnimationFrame(rafId);
      unsubscribeScrollLock();
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, [reducedMotion]);

  return (
    <>
      <ScrollToTopOnNavigate lenisRef={lenisRef} />
      {children}
    </>
  );
}
