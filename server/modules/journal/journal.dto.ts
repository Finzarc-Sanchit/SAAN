import { z } from 'zod';
import { PAGINATION } from '../../shared/constants';
import {
  JOURNAL_BLOCK_TYPES,
  JOURNAL_CATEGORIES,
  JOURNAL_STATUSES,
} from './journal.types';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'slug is required')
  .max(220, 'slug must be 220 characters or fewer')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be URL-safe lowercase text');

const contentBlockDto = z
  .object({
    type: z.enum(JOURNAL_BLOCK_TYPES),
    value: z.string().trim().max(20_000).optional(),
    level: z.union([z.literal(2), z.literal(3)]).optional(),
    src: z.string().trim().url('block image src must be a valid URL').optional(),
    alt: z.string().trim().max(300).optional(),
    caption: z.string().trim().max(500).optional(),
  })
  .superRefine((block, ctx) => {
    if (block.type === 'image') {
      if (!block.src) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'image blocks require src',
          path: ['src'],
        });
      }
      return;
    }

    if (!block.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${block.type} blocks require value`,
        path: ['value'],
      });
    }
  });

const journalFields = {
  title: z.string().trim().min(1, 'title is required').max(200),
  excerpt: z.string().trim().min(1, 'excerpt is required').max(1_200),
  category: z.enum(JOURNAL_CATEGORIES),
  imageUrl: z.string().url('imageUrl must be a valid URL'),
  imageAlt: z.string().trim().min(1, 'imageAlt is required').max(300),
  blocks: z.array(contentBlockDto).max(200).default([]),
  status: z.enum(JOURNAL_STATUSES),
  featured: z.boolean(),
  readMinutes: z.number().int().min(1).max(999).optional(),
  publishedAt: z.coerce.date().nullable().optional(),
};

export const createJournalDto = z.object({
  ...journalFields,
  status: journalFields.status.default('draft'),
  featured: journalFields.featured.default(false),
});

export const updateJournalDto = z
  .object({
    title: journalFields.title.optional(),
    excerpt: journalFields.excerpt.optional(),
    category: journalFields.category.optional(),
    imageUrl: journalFields.imageUrl.optional(),
    imageAlt: journalFields.imageAlt.optional(),
    blocks: z.array(contentBlockDto).max(200).optional(),
    status: journalFields.status.optional(),
    featured: journalFields.featured.optional(),
    readMinutes: journalFields.readMinutes,
    publishedAt: journalFields.publishedAt,
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: 'at least one journal field is required',
  });

export const journalIdParamsDto = z.object({
  id: z.string().min(1, 'Journal id is required'),
});

export const journalSlugParamsDto = z.object({
  slug: slugSchema,
});

export const publicJournalListQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  category: z.enum(JOURNAL_CATEGORIES).optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export const adminJournalListQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  status: z.enum(JOURNAL_STATUSES).optional(),
  category: z.enum(JOURNAL_CATEGORIES).optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  search: z.string().trim().min(1).max(200).optional(),
});

export type CreateJournalDto = z.infer<typeof createJournalDto>;
export type UpdateJournalDto = z.infer<typeof updateJournalDto>;
export type PublicJournalListQueryDto = z.infer<typeof publicJournalListQueryDto>;
export type AdminJournalListQueryDto = z.infer<typeof adminJournalListQueryDto>;
