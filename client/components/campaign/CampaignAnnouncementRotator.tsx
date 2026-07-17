'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CampaignSlide } from '@/components/campaign/CampaignSlide';
import { Container } from '@/components/ui/Container';
import {
  CAMPAIGN_DESKTOP_IMAGE_SPEC,
  CAMPAIGN_MOBILE_IMAGE_SPEC,
} from '@/lib/campaign-image-spec';
import {
  isCloudinaryImageUrl,
  optimizeCampaignImageUrl,
} from '@/lib/campaign-image-url';
import { campaignRotatorChrome } from '@/lib/campaign-theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { isCampaignActive, fetchActiveCampaignsClient } from '@/lib/data/campaigns';
import type { Campaign } from '@/lib/types/campaign';
import { cn } from '@/lib/utils';

function preloadCampaignImage(url: string, width: number) {
  const src = isCloudinaryImageUrl(url)
    ? optimizeCampaignImageUrl(url, width)
    : url;
  const preload = new window.Image();
  preload.decoding = 'async';
  preload.src = src;
}

const ROTATION_MS = 8000;
const MANUAL_PAUSE_MS = 12000;
const EXPIRY_CHECK_MS = 30_000;

type CampaignAnnouncementRotatorProps = {
  initialCampaigns: Campaign[];
  className?: string;
};

export function CampaignAnnouncementRotator({
  initialCampaigns,
  className,
}: CampaignAnnouncementRotatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotationPausedUntil, setRotationPausedUntil] = useState(0);
  const isRefetchingRef = useRef(false);

  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => isCampaignActive(campaign)),
    [campaigns],
  );
  const campaignCount = activeCampaigns.length;
  const safeIndex = campaignCount > 0 ? currentIndex % campaignCount : 0;
  const currentCampaign = activeCampaigns[safeIndex];
  const isMulti = campaignCount > 1;
  const chrome = campaignRotatorChrome;

  const pauseRotation = useCallback(() => {
    setRotationPausedUntil(Date.now() + MANUAL_PAUSE_MS);
  }, []);

  const goNext = useCallback(() => {
    if (!isMulti) return;
    setCurrentIndex((prev) => (prev + 1) % campaignCount);
    pauseRotation();
  }, [campaignCount, isMulti, pauseRotation]);

  const goPrev = useCallback(() => {
    if (!isMulti) return;
    setCurrentIndex((prev) => (prev - 1 + campaignCount) % campaignCount);
    pauseRotation();
  }, [campaignCount, isMulti, pauseRotation]);

  useEffect(() => {
    if (!isMulti) return;

    const tick = () => {
      if (Date.now() < rotationPausedUntil) return;
      setCurrentIndex((prev) => (prev + 1) % campaignCount);
    };

    const intervalId = setInterval(tick, ROTATION_MS);
    return () => clearInterval(intervalId);
  }, [campaignCount, isMulti, rotationPausedUntil]);

  useEffect(() => {
    if (currentIndex >= campaignCount && campaignCount > 0) {
      setCurrentIndex(0);
    }
  }, [campaignCount, currentIndex]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCampaigns((prev) => prev.filter((campaign) => isCampaignActive(campaign)));
    }, EXPIRY_CHECK_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !isMulti) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    };

    section.addEventListener('keydown', handleKeyDown);
    return () => section.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, isMulti]);

  useEffect(() => {
    if (campaigns.length === 0 && !isRefetchingRef.current) {
      isRefetchingRef.current = true;
      void fetchActiveCampaignsClient()
        .then((refreshed) => {
          if (refreshed.length > 0) {
            setCampaigns(refreshed);
            setCurrentIndex(0);
          }
        })
        .finally(() => {
          isRefetchingRef.current = false;
        });
    }
  }, [campaigns.length]);

  // Warm the adjacent slide images so rotation never waits on a cold fetch.
  useEffect(() => {
    if (campaignCount < 2) return;

    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const width = isDesktop
      ? CAMPAIGN_DESKTOP_IMAGE_SPEC.displayWidth * 2
      : CAMPAIGN_MOBILE_IMAGE_SPEC.displayWidth * 2;
    const nextIndex = (safeIndex + 1) % campaignCount;
    const prevIndex = (safeIndex - 1 + campaignCount) % campaignCount;

    for (const index of [nextIndex, prevIndex]) {
      const campaign = activeCampaigns[index];
      if (!campaign) continue;
      preloadCampaignImage(
        isDesktop ? campaign.desktopImage.url : campaign.mobileImage.url,
        width,
      );
    }
  }, [campaignCount, safeIndex, activeCampaigns]);

  if (!currentCampaign) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      tabIndex={isMulti ? 0 : undefined}
      aria-labelledby="campaign-announcement-heading"
      aria-live="polite"
      className={cn('relative z-20 w-full bg-paper section-py outline-none', className)}
    >
      <Container>
        <p className="sr-only">
          Campaign {safeIndex + 1} of {campaignCount}: {currentCampaign.desktopImage.alt}
        </p>

        <div className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl">
          {activeCampaigns.map((campaign, index) => {
            const isActive = index === safeIndex;
            const isNeighbor =
              index === (safeIndex + 1) % campaignCount ||
              index === (safeIndex - 1 + campaignCount) % campaignCount;

            return (
              <div
                key={campaign.id}
                className={cn(
                  'w-full transition-opacity ease-in-out',
                  prefersReducedMotion ? 'duration-0' : 'duration-500',
                  isActive
                    ? 'relative z-10 opacity-100'
                    : 'pointer-events-none absolute inset-0 z-0 opacity-0',
                )}
                aria-hidden={!isActive}
              >
                {(isActive || isNeighbor || index === 0) && (
                  <CampaignSlide
                    campaign={campaign}
                    isFirst={index === 0}
                    eager={isActive || isNeighbor || index === 0}
                  />
                )}
              </div>
            );
          })}

          {isMulti && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous campaign"
                className={cn(
                  'absolute left-2 top-2 z-20 md:left-5 md:top-1/2 md:-translate-y-1/2 lg:left-6',
                  chrome.arrow,
                )}
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.25} />
              </button>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next campaign"
                className={cn(
                  'absolute right-2 top-2 z-20 md:right-5 md:top-1/2 md:-translate-y-1/2 lg:right-6',
                  chrome.arrow,
                )}
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.25} />
              </button>

              <div
                className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 md:bottom-6 md:right-6 md:left-auto md:translate-x-0 md:gap-2"
                aria-label={`Campaign slide ${safeIndex + 1} of ${campaignCount}`}
              >
                {activeCampaigns.map((campaign, index) => (
                  <button
                    key={campaign.id}
                    type="button"
                    aria-label={`Go to campaign ${index + 1}`}
                    aria-current={index === safeIndex ? 'true' : undefined}
                    onClick={() => {
                      setCurrentIndex(index);
                      pauseRotation();
                    }}
                    className={cn(
                      'h-1.5 w-1.5 border transition-colors md:h-2 md:w-2',
                      index === safeIndex ? chrome.dotActive : chrome.dotInactive,
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
