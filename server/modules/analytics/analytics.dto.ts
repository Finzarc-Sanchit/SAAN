import { z } from 'zod';

export const monthlySalesQueryDto = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const statisticsQueryDto = z
  .object({
    period: z.enum(['monthly', 'quarterly', 'annually']).default('monthly'),
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .superRefine((data, ctx) => {
    if (data.to <= data.from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'to must be after from',
        path: ['to'],
      });
    }
  });

export const upsertCurrentMonthTargetDto = z.object({
  targetAmount: z.number().min(0),
});

export const topProductsQueryDto = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export const recentOrdersQueryDto = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export type MonthlySalesQueryDto = z.infer<typeof monthlySalesQueryDto>;
export type StatisticsQueryDto = z.infer<typeof statisticsQueryDto>;
export type UpsertCurrentMonthTargetDto = z.infer<typeof upsertCurrentMonthTargetDto>;
export type TopProductsQueryDto = z.infer<typeof topProductsQueryDto>;
export type RecentOrdersQueryDto = z.infer<typeof recentOrdersQueryDto>;
