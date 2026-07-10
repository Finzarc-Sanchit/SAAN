'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type CountdownTimerProps = {
  endDate: string;
  onExpire: () => void;
  className?: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

function getTimeLeft(endDate: string): TimeLeft {
  const total = new Date(endDate).getTime() - Date.now();
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="min-w-[3.5rem] rounded-lg border border-saan-champagne/40 bg-saan-bone px-3 py-2 text-center font-mono text-xl text-saan-ink">
        {value}
      </div>
      <span className="text-[10px] font-semibold tracking-[0.18em] text-saan-ink/50 uppercase">
        {label}
      </span>
    </div>
  );
}

const PLACEHOLDER: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 1 };

export function CountdownTimer({ endDate, onExpire, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    hasExpiredRef.current = false;

    const tick = () => {
      const next = getTimeLeft(endDate);
      setTimeLeft(next);

      if (next.total <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire();
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, [endDate, onExpire]);

  const display = timeLeft ?? PLACEHOLDER;

  return (
    <div className={cn('flex flex-wrap gap-4 sm:gap-5', className)} role="timer" aria-live="off">
      <CountdownUnit value={pad(display.days)} label="Days" />
      <CountdownUnit value={pad(display.hours)} label="Hours" />
      <CountdownUnit value={pad(display.minutes)} label="Min" />
      <CountdownUnit value={pad(display.seconds)} label="Sec" />
    </div>
  );
}
