import { z } from 'zod';

const discountBaseSchema = z.object({
  type: z.enum(['percentage', 'flat']),
  value: z.number().positive('Discount value must be positive'),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
});

function validateDiscountDates(
  data: { validFrom?: Date; validTo?: Date },
  ctx: z.RefinementCtx,
): void {
  if (data.validFrom && data.validTo && data.validTo <= data.validFrom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'validTo must be after validFrom',
      path: ['validTo'],
    });
  }
}

export const createDiscountDto = discountBaseSchema.superRefine((data, ctx) => {
  validateDiscountDates(data, ctx);
});

export const updateDiscountDto = discountBaseSchema.partial().superRefine((data, ctx) => {
  validateDiscountDates(data, ctx);
});

export const discountIdParamsDto = z.object({
  id: z.string().min(1),
});

export type CreateDiscountDto = z.infer<typeof createDiscountDto>;
export type UpdateDiscountDto = z.infer<typeof updateDiscountDto>;
