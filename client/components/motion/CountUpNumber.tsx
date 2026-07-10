'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

type CountUpNumberProps = {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
};

export function CountUpNumber({
  value,
  suffix = '',
  className,
  duration = 1.8,
}: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(prefersReducedMotion ? value : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value);
      return;
    }

    if (!isInView) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [isInView, value, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={cn(className)}>
      {display}
      {suffix}
    </span>
  );
}
