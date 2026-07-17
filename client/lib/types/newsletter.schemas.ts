import { z } from 'zod';

export const NEWSLETTER_SOURCES = ['footer', 'home', 'other'] as const;
export const NEWSLETTER_STATUSES = ['active', 'unsubscribed'] as const;

export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number];
export type NewsletterStatus = (typeof NEWSLETTER_STATUSES)[number];

export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long'),
  source: z.enum(NEWSLETTER_SOURCES),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

export type NewsletterSubscriber = {
  id: string;
  email: string;
  source: NewsletterSource;
  status: NewsletterStatus;
  subscribedAt: string;
  unsubscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminNewsletterListParams = {
  search?: string;
  status?: NewsletterStatus;
  page?: number;
  limit?: number;
};

export type UpdateNewsletterStatusInput = {
  status: NewsletterStatus;
};

export const newsletterCampaignSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  preheader: z.string().trim().max(200).optional(),
  content: z.string().trim().min(1, 'Message is required').max(20_000),
});

export type SendNewsletterCampaignInput = z.infer<
  typeof newsletterCampaignSchema
>;

export type NewsletterCampaignStatus =
  | 'sending'
  | 'queued'
  | 'partially_failed'
  | 'failed';

export type NewsletterCampaign = {
  id: string;
  subject: string;
  preheader: string | null;
  content: string;
  status: NewsletterCampaignStatus;
  createdByAdminId: string;
  recipientCount: number;
  queuedCount: number;
  failedCount: number;
  queuedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminNewsletterCampaignListParams = {
  page?: number;
  limit?: number;
};
