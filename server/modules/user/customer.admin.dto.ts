import { z } from 'zod';
import { PAGINATION } from '../../shared/constants';

export const adminCustomerListQueryDto = z.object({
  search: z.string().min(1).max(200).optional(),
  isVerified: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

export const adminCustomerIdParamsDto = z.object({
  id: z.string().min(1),
});

export type AdminCustomerListQueryDto = z.infer<typeof adminCustomerListQueryDto>;
