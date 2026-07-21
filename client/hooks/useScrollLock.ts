'use client';

import { useEffect } from 'react';
import { lockPageScroll, unlockPageScroll } from '@/lib/scroll-lock';

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    lockPageScroll();
    return () => unlockPageScroll();
  }, [locked]);
}
