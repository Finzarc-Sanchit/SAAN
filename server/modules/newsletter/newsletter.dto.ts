import { z } from 'zod';
import { PAGINATION } from '../../shared/constants';
import { NEWSLETTER_SOURCES, NEWSLETTER_STATUSES } from './newsletter.types';

export const subscribeNewsletterDto = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  source: z.enum(NEWSLETTER_SOURCES).default('other'),
});

export const newsletterListQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  status: z.enum(NEWSLETTER_STATUSES).optional(),
  search: z.string().trim().min(1).max(254).optional(),
});

export const newsletterIdParamsDto = z.object({
  id: z.string().min(1, 'Newsletter subscription id is required'),
});

export const updateNewsletterStatusDto = z.object({
  status: z.enum(NEWSLETTER_STATUSES),
});

export type SubscribeNewsletterDto = z.infer<typeof subscribeNewsletterDto>;
export type NewsletterListQueryDto = z.infer<typeof newsletterListQueryDto>;
export type UpdateNewsletterStatusDto = z.infer<typeof updateNewsletterStatusDto>;
