import { getCampaignPreviewReplica, type CampaignPreviewVariant } from '@/lib/campaign-image-spec';
import { cn } from '@/lib/utils';

type CampaignStorefrontPreviewProps = {
  imageUrl: string;
  alt: string;
  variant: CampaignPreviewVariant;
  className?: string;
};

/**
 * Scaled replica of the live campaign banner crop — same frame + object-cover as storefront.
 */
export function CampaignStorefrontPreview({
  imageUrl,
  alt,
  variant,
  className,
}: CampaignStorefrontPreviewProps) {
  const replica = getCampaignPreviewReplica(variant);

  return (
    <div
      className={cn(
        'mt-5 border-t border-saan-champagne/30 pt-5 dark:border-white/10',
        className
      )}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-saan-ink/45 dark:text-paper/45">
          Storefront preview
        </p>
        <p className="font-body text-xs text-saan-ink/55 dark:text-paper/55">
          {replica.bannerWidth} × {replica.bannerHeight} px · {replica.breakpointLabel}
        </p>
      </div>

      <div className="flex justify-center">
        <div
          className="overflow-hidden rounded-2xl border border-saan-champagne/40 bg-saan-champagne/10 shadow-sm dark:border-white/10 dark:bg-white/5 md:rounded-3xl"
          style={{ width: replica.scaledWidth, height: replica.scaledHeight }}
        >
          <img
            src={imageUrl}
            alt={alt || 'Campaign storefront preview'}
            className="block h-full w-full object-cover object-center"
          />
        </div>
      </div>

      <p className="mt-2 text-center font-body text-[11px] text-saan-ink/40 dark:text-paper/40">
        Same crop as live banner at {replica.referenceViewportWidth}px viewport (
        {replica.scaledWidth} × {replica.scaledHeight} px)
      </p>
    </div>
  );
}
