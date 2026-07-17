import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingStarsProps = {
  rating: number;
  size?: 'sm' | 'md';
  className?: string;
};

const STAR_COUNT = 5;

export function RatingStars({ rating, size = 'sm', className }: RatingStarsProps) {
  const normalizedRating = Math.min(STAR_COUNT, Math.max(0, rating));
  const sizeClass = size === 'md' ? 'size-5' : 'size-4';

  return (
    <span
      role="img"
      aria-label={`${normalizedRating.toFixed(1)} out of 5 stars`}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const fillPercent = Math.min(100, Math.max(0, (normalizedRating - index) * 100));

        return (
          <span key={index} className={cn('relative inline-flex', sizeClass)} aria-hidden="true">
            <Star className={cn(sizeClass, 'text-neutral-300')} strokeWidth={1.4} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star
                className={cn(sizeClass, 'fill-ink text-ink')}
                strokeWidth={1.4}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}
