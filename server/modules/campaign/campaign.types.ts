export interface Campaign {
  id: string;
  productId: string;
  desktopImageUrl: string;
  desktopImageAlt: string;
  mobileImageUrl: string;
  mobileImageAlt: string;
  startDate: Date;
  endDate: Date;
  priority: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Storefront-facing shape (matches client Campaign type). */
export type ActiveCampaign = {
  id: string;
  productId: string;
  productSlug: string;
  desktopImage: { url: string; alt: string };
  mobileImage: { url: string; alt: string };
  startDate: string;
  endDate: string;
  priority: number;
};

export type CreateCampaignInput = {
  productId: string;
  desktopImageUrl: string;
  desktopImageAlt: string;
  mobileImageUrl: string;
  mobileImageAlt: string;
  startDate: Date;
  endDate: Date;
  priority: number;
  active?: boolean;
};

export type UpdateCampaignInput = Partial<CreateCampaignInput>;
