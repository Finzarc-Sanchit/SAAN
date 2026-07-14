'use client';

import { Package } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type AdminProductThumbProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  iconClassName?: string;
};

/**
 * Admin product thumbs use a native img so arbitrary CDN / seed URLs work
 * without extending next.config remotePatterns for every host.
 */
export function AdminProductThumb({
  src,
  alt = '',
  className,
  iconClassName,
}: AdminProductThumbProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-saan-bone dark:bg-white/10',
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin thumbs accept arbitrary API image hosts
        <img
          src={src!}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            'flex h-full w-full items-center justify-center text-saan-maroon/60 dark:text-saan-gold',
            iconClassName,
          )}
        >
          <Package className="h-4 w-4" aria-hidden />
        </span>
      )}
    </div>
  );
}
