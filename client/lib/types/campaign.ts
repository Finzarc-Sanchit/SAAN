import { z } from 'zod';

/** Storefront-facing shape from `GET /api/v1/campaigns/active`. */
export type Campaign = {
  id: string;
  tag: string;
  title: string;
  description: string;
  productId?: string;
  image: { url: string; alt: string };
  discountPercent?: number | null;
  cta: { label: string; href: string };
  startDate: string;
  endDate: string;
  priority: number;
};

/** Admin CRUD shape from `/api/v1/campaigns`. Mirrors `server/modules/campaign/campaign.types.ts`. */
export type AdminCampaign = {
  id: string;
  tag: string;
  title: string;
  description: string;
  productId: string;
  imageUrl: string;
  imageAlt: string;
  discountPercent: number | null;
  ctaText: string;
  startDate: string;
  endDate: string;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
  startDate: string;
  endDate: string;
  priority: number;
  active?: boolean;
};

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export const campaignFormSchema = z
  .object({
    tag: z.string().trim().min(1, 'Tag is required').max(100),
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().min(1, 'Description is required').max(2000),
    productId: z.string().min(1, 'Product is required'),
    imageUrl: z.string().url('Image URL must be valid'),
    imageAlt: z.string().trim().min(1, 'Image alt text is required').max(300),
    discountPercent: z
      .number({ invalid_type_error: 'Discount must be a number' })
      .min(0, 'Discount cannot be negative')
      .max(100, 'Discount cannot exceed 100%')
      .nullable()
      .optional(),
    ctaText: z.string().trim().min(1, 'CTA text is required').max(100),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    priority: z
      .number({ invalid_type_error: 'Priority is required' })
      .int('Priority must be a whole number')
      .min(0, 'Priority cannot be negative'),
    active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const from = new Date(data.startDate).getTime();
    const to = new Date(data.endDate).getTime();
    if (!Number.isNaN(from) && !Number.isNaN(to) && to <= from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['endDate'],
      });
    }
  });

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;
