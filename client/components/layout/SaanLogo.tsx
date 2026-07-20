'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BRAND } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type SaanLogoProps = {
  /** `default` — light backgrounds; `light` — dark backgrounds (e.g. midnight header) */
  variant?: 'default' | 'light';
  className?: string;
};

export function SaanLogo({ variant = 'default', className }: SaanLogoProps) {
  const src = variant === 'light' ? BRAND.logo : BRAND.logoOnLight;

  return (
    <Link
      href="/"
      aria-label={`${BRAND.name} home`}
      className={cn('relative block h-9 w-[88px] shrink-0 sm:h-10 sm:w-[96px]', className)}
    >
      <Image
        src={src}
        alt={BRAND.name}
        fill
        priority
        sizes="96px"
        className="object-contain object-left"
      />
    </Link>
  );
}
