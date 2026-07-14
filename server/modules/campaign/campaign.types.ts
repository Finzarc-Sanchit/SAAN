export interface Campaign {
  id: string;
  tag: string;
  title: string;
  description: string;
  productId: string;
  imageUrl: string;
  imageAlt: string;
  discountPercent: number | null;
  ctaText: string;
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
  tag: string;
  title: string;
  description: string;
  productId: string;
  image: { url: string; alt: string };
  discountPercent: number | null;
  cta: { label: string; href: string };
  startDate: string;
  endDate: string;
  priority: number;
};

export type CreateCampaignInput = {
  tag: string;
  title: string;
  description: string;
  productId: string;
  imageUrl: string;
  imageAlt: string;
  discountPercent?: number | null;
  ctaText: string;
  startDate: Date;
  endDate: Date;
  priority: number;
  active?: boolean;
};

export type UpdateCampaignInput = Partial<CreateCampaignInput>;
