import { z } from 'zod';

export type DiscountType = 'percentage' | 'flat';

export type Discount = {
  id: string;
  type: DiscountType;
  value: number;
  validFrom: string;
  validTo: string;
};

export type CreateDiscountInput = {
  type: DiscountType;
  value: number;
  validFrom: string;
  validTo: string;
};

export type UpdateDiscountInput = Partial<CreateDiscountInput>;

export const discountFormSchema = z
  .object({
    type: z.enum(['percentage', 'flat']),
    value: z
      .number({ invalid_type_error: 'Value is required' })
      .positive('Value must be positive'),
    validFrom: z.string().min(1, 'Start date is required'),
    validTo: z.string().min(1, 'End date is required'),
  })
  .superRefine((data, ctx) => {
    const from = new Date(data.validFrom).getTime();
    const to = new Date(data.validTo).getTime();
    if (!Number.isNaN(from) && !Number.isNaN(to) && to <= from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['validTo'],
      });
    }
  });

export type DiscountFormValues = z.infer<typeof discountFormSchema>;
