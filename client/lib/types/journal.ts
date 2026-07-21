import { z } from 'zod';

export const JOURNAL_STATUSES = ['draft', 'published', 'archived'] as const;
export type JournalStatus = (typeof JOURNAL_STATUSES)[number];

export const JOURNAL_CATEGORIES = [
  'Style Guide',
  "Editor's Picks",
  'Behind the Seams',
  'Lookbook',
] as const;
export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];

export const JOURNAL_BLOCK_TYPES = [
  'paragraph',
  'heading',
  'image',
  'blockquote',
] as const;
export type JournalBlockType = (typeof JOURNAL_BLOCK_TYPES)[number];

export type JournalContentBlock = {
  type: JournalBlockType;
  value?: string;
  level?: 2 | 3;
  src?: string;
  alt?: string;
  caption?: string;
};

export type Journal = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: JournalCategory;
  imageUrl: string;
  imageAlt: string;
  blocks: JournalContentBlock[];
  status: JournalStatus;
  featured: boolean;
  readMinutes: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminJournalListParams = {
  page?: number;
  limit?: number;
  status?: JournalStatus;
  category?: JournalCategory;
  featured?: boolean;
  search?: string;
};

const contentBlockSchema = z
  .object({
    type: z.enum(JOURNAL_BLOCK_TYPES),
    value: z.string().trim().max(20_000).optional(),
    level: z.union([z.literal(2), z.literal(3)]).optional(),
    src: z.string().trim().optional(),
    alt: z.string().trim().max(300).optional(),
    caption: z.string().trim().max(500).optional(),
  })
  .superRefine((block, ctx) => {
    if (block.type === 'image') {
      if (!block.src) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Image blocks require an image',
          path: ['src'],
        });
      } else {
        const parsed = z.string().url().safeParse(block.src);
        if (!parsed.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Block image must be a valid URL',
            path: ['src'],
          });
        }
      }
      return;
    }
    if (!block.value?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${block.type} blocks require content`,
        path: ['value'],
      });
    }
  });

export const journalFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  excerpt: z.string().trim().min(1, 'Excerpt is required').max(1_200),
  category: z.enum(JOURNAL_CATEGORIES),
  imageUrl: z.string().trim().url('A valid cover image is required'),
  imageAlt: z.string().trim().min(1, 'Image alt text is required').max(300),
  blocks: z.array(contentBlockSchema).max(200),
  status: z.enum(JOURNAL_STATUSES),
  featured: z.boolean(),
});

export type JournalFormValues = z.infer<typeof journalFormSchema>;
export type CreateJournalInput = JournalFormValues;
export type UpdateJournalInput = Partial<JournalFormValues>;
