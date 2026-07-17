/** Storefront campaign banner — matches `CampaignSlide` layout (do not change without updating CSS). */
export const CAMPAIGN_BANNER_LAYOUT_CLASS =
  'relative min-h-[min(78vw,580px)] w-full overflow-hidden md:min-h-[480px] lg:min-h-[560px]';

export const CAMPAIGN_DESKTOP_IMAGE_SPEC = {
  displayWidth: 1200,
  displayHeight: 560,
  uploadWidth: 2400,
  uploadHeight: 1120,
  aspectRatio: '15:7',
} as const;

export const CAMPAIGN_MOBILE_IMAGE_SPEC = {
  displayWidth: 750,
  displayHeight: 580,
  uploadWidth: 1500,
  uploadHeight: 1160,
  aspectRatio: '75:58',
} as const;

/** Reference viewports for admin preview — wide desktop matches typical live crop. */
export const CAMPAIGN_PREVIEW_VIEWPORT = {
  desktop: 1920,
  mobile: 390,
} as const;

/** Max preview width in admin so the frame fits the form column. */
export const CAMPAIGN_PREVIEW_MAX_WIDTH = 780;

/** Preview-only — narrows frame slightly for a touch more left/right crop vs live. */
const CAMPAIGN_PREVIEW_WIDTH_ADJUST = 0.975;

export type CampaignPreviewVariant = 'desktop' | 'mobile';

/**
 * Live banner size at a viewport — mirrors `Container` padding breakpoints
 * and `CampaignSlide` min-heights (do not use on the live banner).
 */
export function getLiveCampaignBannerSize(
  viewportWidth: number,
  variant: CampaignPreviewVariant,
): { bannerWidth: number; bannerHeight: number } {
  if (variant === 'mobile') {
    const paddingX = viewportWidth >= 640 ? 48 : 32;
    return {
      bannerWidth: viewportWidth - paddingX,
      bannerHeight: Math.min(Math.round(viewportWidth * 0.78), 580),
    };
  }

  const paddingX =
    viewportWidth >= 1280 ? 96 : viewportWidth >= 1024 ? 80 : viewportWidth >= 640 ? 48 : 32;
  const bannerHeight = viewportWidth >= 1024 ? 560 : 480;

  return {
    bannerWidth: viewportWidth - paddingX,
    bannerHeight,
  };
}

export function getCampaignPreviewReplica(variant: CampaignPreviewVariant): {
  bannerWidth: number;
  bannerHeight: number;
  scaledWidth: number;
  scaledHeight: number;
  breakpointLabel: string;
  referenceViewportWidth: number;
} {
  const referenceViewportWidth = CAMPAIGN_PREVIEW_VIEWPORT[variant];
  const { bannerWidth, bannerHeight } = getLiveCampaignBannerSize(
    referenceViewportWidth,
    variant,
  );

  const previewWidth = Math.round(bannerWidth * CAMPAIGN_PREVIEW_WIDTH_ADJUST);
  const previewHeight = bannerHeight;

  const scale = Math.min(1, CAMPAIGN_PREVIEW_MAX_WIDTH / previewWidth);
  const scaledWidth = Math.round(previewWidth * scale);
  const scaledHeight = Math.round(previewHeight * scale);

  return {
    bannerWidth: previewWidth,
    bannerHeight: previewHeight,
    scaledWidth,
    scaledHeight,
    referenceViewportWidth,
    breakpointLabel: variant === 'desktop' ? '768px and wider' : 'below 768px',
  };
}

export function formatCampaignImageDimensionHint(
  spec: typeof CAMPAIGN_DESKTOP_IMAGE_SPEC | typeof CAMPAIGN_MOBILE_IMAGE_SPEC,
): string {
  return `Recommended ${spec.uploadWidth} × ${spec.uploadHeight} px (${spec.aspectRatio}, @2× for ${spec.displayWidth} × ${spec.displayHeight} px display). JPEG, PNG, or WebP up to 5MB.`;
}
