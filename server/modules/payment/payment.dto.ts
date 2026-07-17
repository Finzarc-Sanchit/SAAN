import { z } from 'zod';

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
