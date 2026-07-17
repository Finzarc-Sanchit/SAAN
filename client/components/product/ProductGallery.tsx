'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const IMAGE_LABELS = ['Front', 'Back', 'Detail', 'On Model'] as const;

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryImages = images.slice(0, 4);
  const mainImage = galleryImages[activeIndex] ?? galleryImages[0];

  useEffect(() => {
    if (
      galleryImages.length <= 1 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % galleryImages.length);
    }, 7_000);

    return () => window.clearTimeout(timer);
  }, [activeIndex, galleryImages.length]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:gap-6">
      <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-neutral-100 lg:min-w-0 lg:flex-1">
        {mainImage && (
          <Image
            src={mainImage}
            alt={`${productName} — ${IMAGE_LABELS[activeIndex] ?? 'view'}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center"
          />
        )}
      </div>

      {galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide lg:w-24 lg:flex-col lg:overflow-visible">
          {galleryImages.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              aria-label={`View ${IMAGE_LABELS[index] ?? `image ${index + 1}`}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative shrink-0 overflow-hidden bg-neutral-100',
                'h-20 w-16 lg:h-auto lg:w-full lg:aspect-[3/4]',
                activeIndex === index
                  ? 'ring-1 ring-ink ring-offset-2 ring-offset-paper'
                  : 'opacity-70 hover:opacity-100'
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
