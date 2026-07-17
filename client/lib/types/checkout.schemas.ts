import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long')
  .regex(/^[+]?[\d\s()-]+$/, 'Invalid phone number format');

const postalCodeSchema = z
  .string()
  .trim()
  .min(3, 'Postal code is too short')
  .max(12, 'Postal code is too long')
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9\s-]*[A-Za-z0-9]$|^[A-Za-z0-9]$/,
    'Invalid postal code format',
  );

export const checkoutAddressSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: phoneSchema,
  address: z.string().trim().min(1, 'Address is required').max(200),
  apartment: z.string().trim().max(100).optional().or(z.literal('')),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  postalCode: postalCodeSchema,
});

export type CheckoutAddressValues = z.infer<typeof checkoutAddressSchema>;
