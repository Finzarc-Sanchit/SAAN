import { cn } from '@/lib/utils';

export type CampaignTextColor = 'white' | 'black';

export function getCampaignTheme(textColor: CampaignTextColor) {
  const isLight = textColor === 'white';

  return {
    countdownValue: isLight ? 'text-white' : 'text-ink',
    countdownLabel: isLight ? 'text-white/70' : 'text-neutral-500',
    countdownBox: isLight
      ? 'border-white/30 bg-white/10'
      : 'border-neutral-300 bg-white/90',
  };
}

/** Neutral chrome for image-only campaign rotator controls. */
export const campaignRotatorChrome = {
  arrow: cn(
    'flex h-8 w-8 items-center justify-center border border-white/35 bg-white/90 text-ink shadow-sm transition-opacity hover:opacity-80 md:h-11 md:w-11'
  ),
  dotActive: 'bg-white',
  dotInactive: 'border-white/50 bg-transparent',
} as const;
