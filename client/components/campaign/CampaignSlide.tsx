'use client';

import Image from 'next/image';
import { useCallback } from 'react';
import { CountdownTimer } from '@/components/campaign/CountdownTimer';
import { CtaButton } from '@/components/ui/CtaButton';
import type { Campaign } from '@/lib/types/campaign';
import { cn } from '@/lib/utils';

type CampaignSlideProps = {
  campaign: Campaign;
  onExpire: (campaignId: string) => void;
  isFirst?: boolean;
};

export function CampaignSlide({ campaign, onExpire, isFirst = false }: CampaignSlideProps) {
  const handleExpire = useCallback(() => {
    onExpire(campaign.id);
  }, [campaign.id, onExpire]);

  return (
    <article className="grid min-h-[550px] min-w-0 grid-cols-1 items-center gap-10 lg:min-h-[650px] lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] lg:items-stretch lg:gap-16">
      <div className="order-2 flex min-w-0 flex-col justify-center lg:order-1">
        <p className="text-[12px] font-semibold tracking-[0.2em] text-saan-maroon uppercase">
          {campaign.tag}
        </p>
        <h2
          {...(isFirst ? { id: 'campaign-announcement-heading' } : {})}
          className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-bold tracking-tight text-saan-ink"
        >
          {campaign.title}
        </h2>
        {campaign.discountPercent != null && campaign.discountPercent > 0 && (
          <p className="mt-6 text-[clamp(3rem,8vw,6rem)] leading-none font-bold text-saan-maroon">
            {campaign.discountPercent}%
          </p>
        )}
        <div className={cn(campaign.discountPercent ? 'mt-6' : 'mt-8')}>
          <CountdownTimer endDate={campaign.endDate} onExpire={handleExpire} />
        </div>
        <div className="mt-10">
          <CtaButton href={campaign.cta.href} variant="link">
            {campaign.cta.label} →
          </CtaButton>
        </div>
      </div>

      <div className="order-1 min-h-0 min-w-0 lg:order-2 lg:flex lg:h-full">
        <div className="relative aspect-[4/5] w-full max-w-full overflow-hidden rounded-[32px] shadow-sm lg:aspect-auto lg:h-full lg:min-h-[520px]">
          <Image
            src={campaign.image.url}
            alt={campaign.image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center"
            priority={isFirst}
          />
        </div>
      </div>
    </article>
  );
}
