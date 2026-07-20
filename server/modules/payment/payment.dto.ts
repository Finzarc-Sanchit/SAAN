import { z } from 'zod';
import { PAGINATION } from '../../shared/constants';

export const orderIdParamsDto = z.object({
  orderId: z.string().min(1, 'orderId is required'),
});

export const initiatePaymentDto = z.object({
  paymentMethod: z.string().min(1).default('card'),
});

export const verifyPaymentDto = z.object({
  razorpayOrderId: z.string().min(1, 'razorpayOrderId is required'),
  razorpayPaymentId: z.string().min(1, 'razorpayPaymentId is required'),
  razorpaySignature: z.string().min(1, 'razorpaySignature is required'),
});

export type OrderIdParamsDto = z.infer<typeof orderIdParamsDto>;
export type InitiatePaymentDto = z.infer<typeof initiatePaymentDto>;
export type VerifyPaymentDto = z.infer<typeof verifyPaymentDto>;

export const adminPaymentListQueryDto = z.object({
  status: z.enum(['created', 'pending', 'paid', 'failed', 'refunded']).optional(),
  paymentMethod: z.string().min(1).max(40).optional(),
  paymentGateway: z.string().min(1).max(40).optional(),
  search: z.string().min(1).max(200).optional(),
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

export type AdminPaymentListQueryDto = z.infer<typeof adminPaymentListQueryDto>;
