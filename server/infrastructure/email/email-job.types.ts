import { z } from 'zod';

const emailAddressSchema = z.string().email().max(254);

export const emailJobSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('otp'),
    to: emailAddressSchema,
    otp: z.string().regex(/^\d{6}$/),
    purpose: z.enum(['registration', 'resend']),
  }),
  z.object({
    type: z.literal('password-reset'),
    to: emailAddressSchema,
    resetLink: z.string().url(),
  }),
  z.object({
    type: z.literal('password-changed'),
    to: emailAddressSchema,
  }),
  z.object({
    type: z.literal('contact-confirmation'),
    to: emailAddressSchema,
    name: z.string().min(2).max(120),
    subject: z.string().min(2).max(200),
  }),
  z.object({
    type: z.literal('contact-admin-notification'),
    name: z.string().min(2).max(120),
    email: emailAddressSchema,
    phone: z.string().min(10).max(20),
    subject: z.string().min(2).max(200),
    message: z.string().min(10).max(5_000),
  }),
  z.object({
    type: z.literal('newsletter'),
    campaignId: z.string().min(1),
    subscriptionId: z.string().min(1),
    to: emailAddressSchema,
    subject: z.string().min(1).max(200),
    preheader: z.string().max(200).optional(),
    content: z.string().min(1).max(20_000),
  }),
  z.object({
    type: z.literal('order-confirmation'),
    to: emailAddressSchema,
    customerName: z.string().min(1).max(120),
    orderNumber: z.string().regex(/^\d{3}-\d{7}-\d{7}$/),
    total: z.number().nonnegative(),
    currency: z.string().length(3),
    itemSummary: z.string().min(1).max(2_000),
    confirmationUrl: z.string().url(),
  }),
  z.object({
    type: z.literal('order-admin-notification'),
    customerName: z.string().min(1).max(120),
    customerEmail: emailAddressSchema,
    orderNumber: z.string().regex(/^\d{3}-\d{7}-\d{7}$/),
    total: z.number().nonnegative(),
    currency: z.string().length(3),
    itemSummary: z.string().min(1).max(2_000),
    adminOrderUrl: z.string().url(),
  }),
]);

export type EmailJob = z.infer<typeof emailJobSchema>;
