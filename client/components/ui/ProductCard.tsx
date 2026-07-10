'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { formatPrice } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  currency?: string;
  image: string;
  isNew?: boolean;
  className?: string;
};

export function ProductCard({
  id,
  name,
  price,
  currency = 'INR',
  image,
  isNew = false,
  className,
}: ProductCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <Link href={`/shop/${id}`} className="block">
        <div className="relative mb-4 aspect-[3/4] overflow-hidden">
          <motion.div
            className="absolute inset-0"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          >
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </motion.div>

          {isNew && (
            <span className="text-label-caps absolute left-3 top-3 bg-accent-crimson px-2 py-1 text-white">
              New
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="text-label-caps bg-saan-bone/90 px-4 py-2 text-saan-maroon backdrop-blur-sm">
              Quick View
            </span>
          </div>
        </div>

        <h3 className="mb-1 text-sm font-normal text-saan-ink">{name}</h3>
        <p className="font-display text-base text-saan-maroon">
          {formatPrice(price, currency)}
        </p>
      </Link>
    </article>
  );
}
