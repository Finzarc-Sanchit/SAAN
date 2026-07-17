export const NEWSLETTER_STATUSES = ['active', 'unsubscribed'] as const;
export const NEWSLETTER_SOURCES = ['footer', 'home', 'other'] as const;

export type NewsletterStatus = (typeof NEWSLETTER_STATUSES)[number];
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number];

/** Database-agnostic newsletter subscription entity. */
export interface NewsletterSubscription {
  id: string;
  email: string;
  status: NewsletterStatus;
  source: NewsletterSource;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscribeNewsletterInput = {
  email: string;
  source?: NewsletterSource;
};

export type NewsletterListFilter = {
  status?: NewsletterStatus;
  search?: string;
};

export const NEWSLETTER_CAMPAIGN_STATUSES = [
  'sending',
  'queued',
  'partially_failed',
  'failed',
] as const;

export type NewsletterCampaignStatus =
  (typeof NEWSLETTER_CAMPAIGN_STATUSES)[number];

export interface NewsletterCampaign {
  id: string;
  subject: string;
  preheader: string | null;
  content: string;
  status: NewsletterCampaignStatus;
  createdByAdminId: string;
  recipientCount: number;
  queuedCount: number;
  failedCount: number;
  queuedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateNewsletterCampaignInput = Pick<
  NewsletterCampaign,
  'subject' | 'preheader' | 'content' | 'createdByAdminId' | 'recipientCount'
>;
