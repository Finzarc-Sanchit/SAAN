'use client';

import { useEffect, useRef, useState } from 'react';
import { getCampaignTheme, type CampaignTextColor } from '@/lib/campaign-theme';
import { cn } from '@/lib/utils';

type CountdownTimerProps = {
  endDate: string;
  onExpire: () => void;
  className?: string;
  variant?: 'default' | 'banner';
  textColor?: CampaignTextColor;
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

function CountdownUnit({
  value,
  label,
  variant,
  textColor,
}: {
  value: string;
  label: string;
  variant: 'default' | 'banner';
  textColor: CampaignTextColor;
}) {
  const theme = getCampaignTheme(textColor);

  if (variant === 'banner') {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={cn(
            'min-w-[2.75rem] px-2 py-1.5 text-center md:min-w-[3rem] md:px-2.5 md:py-2',
            theme.countdownBox
          )}
        >
          <span className={cn('text-body-medium tabular-nums', theme.countdownValue)}>
            {value}
          </span>
        </div>
        <span className={cn('text-[0.625rem] uppercase tracking-wider', theme.countdownLabel)}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="min-w-[3.25rem] border border-neutral-300 bg-neutral-100 px-3 py-2.5 text-center">
        <span className="text-body-medium tabular-nums text-ink">{value}</span>
      </div>
      <span className="text-ui text-neutral-500">{label}</span>
    </div>
  );
}

const PLACEHOLDER: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 1 };

export function CountdownTimer({
  endDate,
  onExpire,
  className,
  variant = 'default',
  textColor = 'white',
}: CountdownTimerProps) {
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
    <div
      className={cn(
        'flex flex-wrap gap-2 sm:gap-3',
        variant === 'banner' && 'gap-3 md:gap-4',
        className
      )}
      role="timer"
      aria-live="off"
    >
      <CountdownUnit
        value={pad(display.days)}
        label="Days"
        variant={variant}
        textColor={textColor}
      />
      <CountdownUnit
        value={pad(display.hours)}
        label="Hours"
        variant={variant}
        textColor={textColor}
      />
      <CountdownUnit
        value={pad(display.minutes)}
        label="Min"
        variant={variant}
        textColor={textColor}
      />
      <CountdownUnit
        value={pad(display.seconds)}
        label="Sec"
        variant={variant}
        textColor={textColor}
      />
    </div>
  );
}
