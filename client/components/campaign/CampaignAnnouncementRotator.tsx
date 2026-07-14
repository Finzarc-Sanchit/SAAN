'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CampaignSlide } from '@/components/campaign/CampaignSlide';
import { Container } from '@/components/ui/Container';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { isCampaignActive, fetchActiveCampaignsClient } from '@/lib/data/campaigns';
import type { Campaign } from '@/lib/types/campaign';
import { cn } from '@/lib/utils';

const ROTATION_MS = 8000;
const MANUAL_PAUSE_MS = 12000;

type CampaignAnnouncementRotatorProps = {
  initialCampaigns: Campaign[];
  className?: string;
};

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
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

  const activeCampaigns = campaigns.filter((campaign) => isCampaignActive(campaign));
  const campaignCount = activeCampaigns.length;
  const safeIndex = campaignCount > 0 ? currentIndex % campaignCount : 0;
  const currentCampaign = activeCampaigns[safeIndex];
  const isMulti = campaignCount > 1;

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

  const handleExpire = useCallback(async (campaignId: string) => {
    setCampaigns((prev) => {
      const next = prev.filter((campaign) => campaign.id !== campaignId);
      return next.filter((campaign) => isCampaignActive(campaign));
    });
    setCurrentIndex(0);

    if (isRefetchingRef.current) return;
    isRefetchingRef.current = true;

    try {
      const refreshed = await fetchActiveCampaignsClient();
      if (refreshed.length > 0) {
        setCampaigns(refreshed);
        setCurrentIndex(0);
      }
    } finally {
      isRefetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (campaigns.length === 0 && !isRefetchingRef.current) {
      void fetchActiveCampaignsClient().then((refreshed) => {
        if (refreshed.length > 0) {
          setCampaigns(refreshed);
          setCurrentIndex(0);
        }
      });
    }
  }, [campaigns.length]);

  if (!currentCampaign) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      tabIndex={isMulti ? 0 : undefined}
      aria-labelledby="campaign-announcement-heading"
      aria-live="polite"
      className={cn('relative z-20 bg-white section-py outline-none', className)}
    >
      <Container>
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="min-w-0"
        >
          <div className="min-w-0 overflow-hidden border border-saan-champagne/50 bg-white p-6 md:p-10 lg:p-12">
            <p className="sr-only">
              Campaign {safeIndex + 1} of {campaignCount}: {currentCampaign.title}.
            </p>
            <div className="relative min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentCampaign.id}
                  variants={fadeVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                  className="w-full min-w-0"
                >
                  <CampaignSlide
                    campaign={currentCampaign}
                    onExpire={handleExpire}
                    isFirst={safeIndex === 0}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {isMulti && (
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-saan-champagne/40 pt-6">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous campaign"
                  className="text-label-caps inline-flex items-center gap-2 text-saan-ink/70 transition-colors hover:text-saan-maroon"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.25} aria-hidden />
                  Previous
                </button>
                <span className="text-[11px] font-medium tracking-[0.18em] text-saan-ink/40 uppercase">
                  {safeIndex + 1} / {campaignCount}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next campaign"
                  className="text-label-caps inline-flex items-center gap-2 text-saan-ink/70 transition-colors hover:text-saan-maroon"
                >
                  Next
                  <ChevronRight className="h-4 w-4" strokeWidth={1.25} aria-hidden />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
