import Image from 'next/image';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

type OrderItemThumbnailProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_CLASS = {
  sm: 'h-16 w-14',
  md: 'h-20 w-[4.5rem]',
  lg: 'h-28 w-24',
} as const;

export function OrderItemThumbnail({
  src,
  alt,
  className,
  size = 'md',
}: OrderItemThumbnailProps) {
  const normalizedSrc = src?.trim() || null;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100',
        SIZE_CLASS[size],
        className,
      )}
    >
      {normalizedSrc ? (
        <Image
          src={normalizedSrc}
          alt={alt}
          fill
          sizes={size === 'lg' ? '96px' : size === 'md' ? '72px' : '56px'}
          className="object-cover object-center"
          unoptimized
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-neutral-400"
          aria-hidden
        >
          <Package className="h-5 w-5" strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}
