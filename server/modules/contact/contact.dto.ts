import { z } from 'zod';
import { PAGINATION } from '../../shared/constants';
import { CONTACT_STATUSES } from './contact.types';

export const createContactDto = z.object({
  name: z.string().trim().min(2).max(120),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  phone: z.string().trim().min(10).max(20),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(5_000),
});

export const contactListQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  status: z.enum(CONTACT_STATUSES).optional(),
  search: z.string().trim().min(1).max(200).optional(),
});

export const contactIdParamsDto = z.object({
  id: z.string().min(1, 'Contact id is required'),
});

export const updateContactStatusDto = z.object({
  status: z.enum(CONTACT_STATUSES),
});

export type CreateContactDto = z.infer<typeof createContactDto>;
export type ContactListQueryDto = z.infer<typeof contactListQueryDto>;
export type UpdateContactStatusDto = z.infer<typeof updateContactStatusDto>;
