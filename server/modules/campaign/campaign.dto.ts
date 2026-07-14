import { z } from 'zod';

const dateInputSchema = z.coerce.date();

export const createCampaignDto = z
  .object({
    tag: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    productId: z.string().min(1, 'productId is required'),
    imageUrl: z.string().url('imageUrl must be a valid URL'),
    imageAlt: z.string().min(1).max(300),
    discountPercent: z.number().min(0).max(100).nullish(),
    ctaText: z.string().min(1).max(100),
    startDate: dateInputSchema,
    endDate: dateInputSchema,
    priority: z.number().int().min(0),
    active: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endDate must be after startDate',
        path: ['endDate'],
      });
    }
  });

export const updateCampaignDto = z
  .object({
    tag: z.string().min(1).max(100).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    productId: z.string().min(1).optional(),
    imageUrl: z.string().url().optional(),
    imageAlt: z.string().min(1).max(300).optional(),
    discountPercent: z.number().min(0).max(100).nullish(),
    ctaText: z.string().min(1).max(100).optional(),
    startDate: dateInputSchema.optional(),
    endDate: dateInputSchema.optional(),
    priority: z.number().int().min(0).optional(),
    active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endDate must be after startDate',
        path: ['endDate'],
      });
    }
  });

export const campaignIdParamsDto = z.object({
  id: z.string().min(1),
});

export type CreateCampaignDto = z.infer<typeof createCampaignDto>;
export type UpdateCampaignDto = z.infer<typeof updateCampaignDto>;
