'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

type TypewriterTextProps = {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
};

export function TypewriterText({
  text,
  className,
  delay = 0,
  speed = 40,
  onComplete,
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReducedMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(prefersReducedMotion ? text.length : 0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleCount(text.length);
      onCompleteRef.current?.();
      return;
    }

    if (!isInView) return;

    let charIndex = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        charIndex += 1;
        setVisibleCount(charIndex);
        if (charIndex >= text.length) {
          clearInterval(intervalId);
          onCompleteRef.current?.();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isInView, text, delay, speed, prefersReducedMotion]);

  return (
    <span ref={ref} className={cn(className)} aria-hidden={visibleCount < text.length}>
      {text.slice(0, visibleCount)}
    </span>
  );
}
