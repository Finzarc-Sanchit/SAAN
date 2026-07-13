import { z } from 'zod';

export const orderIdParamsDto = z.object({
  orderId: z.string().min(1, 'orderId is required'),
});

export const initiatePaymentDto = z.object({
  paymentMethod: z.string().min(1).default('card'),
});

export type OrderIdParamsDto = z.infer<typeof orderIdParamsDto>;
export type InitiatePaymentDto = z.infer<typeof initiatePaymentDto>;
