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
