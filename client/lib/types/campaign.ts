import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type Campaign = {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: { url: string; alt: string };
  discountPercent?: number | null;
  cta: { label: string; href: string };
  startDate: string;
  endDate: string;
  priority: number;
};

export type SanityCampaignDoc = {
  _id: string;
  tag: string;
  title: string;
  description: string;
  image: SanityImageSource & { alt?: string };
  discountPercent?: number | null;
  ctaText: string;
  ctaLink: string;
  startDate: string;
  endDate: string;
  priority: number;
};
