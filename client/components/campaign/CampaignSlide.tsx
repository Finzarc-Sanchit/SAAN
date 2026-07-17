'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CAMPAIGN_BANNER_LAYOUT_CLASS,
  CAMPAIGN_DESKTOP_IMAGE_SPEC,
  CAMPAIGN_MOBILE_IMAGE_SPEC,
} from '@/lib/campaign-image-spec';
import {
  isCloudinaryImageUrl,
  optimizeCampaignImageUrl,
} from '@/lib/campaign-image-url';
import { getProductHref } from '@/lib/product-url';
import type { Campaign } from '@/lib/types/campaign';
import { cn } from '@/lib/utils';

type CampaignSlideProps = {
  campaign: Campaign;
  isFirst?: boolean;
  /** When false, defer offscreen rotator slides until nearby. */
  eager?: boolean;
  className?: string;
};

type Viewport = 'mobile' | 'desktop';

function useCampaignViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const sync = () => setViewport(media.matches ? 'desktop' : 'mobile');
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return viewport;
}

function resolveCampaignImage(
  url: string,
  width: number,
): { src: string; unoptimized: boolean } {
  if (isCloudinaryImageUrl(url)) {
    return {
      src: optimizeCampaignImageUrl(url, width),
      unoptimized: true,
    };
  }

  return { src: url, unoptimized: false };
}

export function CampaignSlide({
  campaign,
  isFirst = false,
  eager = false,
  className,
}: CampaignSlideProps) {
  const href = getProductHref({ slug: campaign.productSlug });
  const viewport = useCampaignViewport();
  const shouldPrioritize = isFirst || eager;

  const mobile = resolveCampaignImage(
    campaign.mobileImage.url,
    CAMPAIGN_MOBILE_IMAGE_SPEC.displayWidth * 2,
  );
  const desktop = resolveCampaignImage(
    campaign.desktopImage.url,
    CAMPAIGN_DESKTOP_IMAGE_SPEC.displayWidth * 2,
  );

  const activeImage =
    viewport === 'desktop'
      ? {
          ...desktop,
          alt: campaign.desktopImage.alt,
          sizes: `(min-width: 1280px) ${CAMPAIGN_DESKTOP_IMAGE_SPEC.displayWidth}px, 100vw`,
        }
      : {
          ...mobile,
          alt: campaign.mobileImage.alt,
          sizes: '100vw',
        };

  return (
    <Link
      href={href}
      className={cn(
        'group block cursor-pointer outline-none transition-opacity hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2',
        className,
      )}
      aria-label={campaign.desktopImage.alt}
      {...(isFirst ? { id: 'campaign-announcement-heading' } : {})}
      tabIndex={eager || isFirst ? undefined : -1}
    >
      <article className={cn(CAMPAIGN_BANNER_LAYOUT_CLASS, 'relative')}>
        <Image
          key={`${campaign.id}-${viewport}`}
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority={shouldPrioritize && isFirst}
          loading={shouldPrioritize ? 'eager' : 'lazy'}
          fetchPriority={shouldPrioritize && isFirst ? 'high' : 'auto'}
          quality={72}
          sizes={activeImage.sizes}
          unoptimized={activeImage.unoptimized}
          className="object-cover object-center"
        />
      </article>
    </Link>
  );
}
