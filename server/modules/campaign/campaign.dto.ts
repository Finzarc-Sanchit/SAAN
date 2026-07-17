import { z } from 'zod';

const dateInputSchema = z.coerce.date();

export const createCampaignDto = z
  .object({
    productId: z.string().min(1, 'productId is required'),
    desktopImageUrl: z.string().url('desktopImageUrl must be a valid URL'),
    desktopImageAlt: z.string().min(1).max(300),
    mobileImageUrl: z.string().url('mobileImageUrl must be a valid URL'),
    mobileImageAlt: z.string().min(1).max(300),
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
    productId: z.string().min(1).optional(),
    desktopImageUrl: z.string().url().optional(),
    desktopImageAlt: z.string().min(1).max(300).optional(),
    mobileImageUrl: z.string().url().optional(),
    mobileImageAlt: z.string().min(1).max(300).optional(),
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
