import { z } from 'zod';

export type CampaignImage = {
  url: string;
  alt: string;
};

/** Storefront-facing shape from `GET /api/v1/campaigns/active`. */
export type Campaign = {
  id: string;
  productId: string;
  productSlug: string;
  desktopImage: CampaignImage;
  mobileImage: CampaignImage;
  startDate: string;
  endDate: string;
  priority: number;
};

/** Admin CRUD shape from `/api/v1/campaigns`. Mirrors `server/modules/campaign/campaign.types.ts`. */
export type AdminCampaign = {
  id: string;
  productId: string;
  desktopImageUrl: string;
  desktopImageAlt: string;
  mobileImageUrl: string;
  mobileImageAlt: string;
  startDate: string;
  endDate: string;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCampaignInput = {
  productId: string;
  desktopImageUrl: string;
  desktopImageAlt: string;
  mobileImageUrl: string;
  mobileImageAlt: string;
  startDate: string;
  endDate: string;
  priority: number;
  active?: boolean;
};

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export const campaignFormSchema = z
  .object({
    productId: z.string().min(1, 'Product is required'),
    desktopImageUrl: z.string().url('Desktop image URL must be valid'),
    desktopImageAlt: z.string().trim().min(1, 'Desktop image alt text is required').max(300),
    mobileImageUrl: z.string().url('Mobile image URL must be valid'),
    mobileImageAlt: z.string().trim().min(1, 'Mobile image alt text is required').max(300),
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
