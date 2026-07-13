import { z } from 'zod';

/** Loose international phone: digits with optional +, spaces, dashes, parentheses. */
const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long')
  .regex(/^[+]?[\d\s()-]+$/, 'Invalid phone number format');

/** Loose postal code: alphanumeric with optional spaces or hyphens (multi-country). */
const postalCodeSchema = z
  .string()
  .trim()
  .min(3, 'Postal code is too short')
  .max(12, 'Postal code is too long')
  .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]*[A-Za-z0-9]$|^[A-Za-z0-9]$/, 'Invalid postal code format');

const addressFields = {
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: phoneSchema,
  address: z.string().trim().min(1, 'Address is required').max(200),
  apartment: z.string().trim().max(100).nullable().optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  postalCode: postalCodeSchema,
};

export const createAddressDto = z.object({
  ...addressFields,
  isDefault: z.boolean().optional(),
});

export const updateAddressDto = z
  .object({
    firstName: addressFields.firstName.optional(),
    lastName: addressFields.lastName.optional(),
    phone: addressFields.phone.optional(),
    address: addressFields.address.optional(),
    apartment: addressFields.apartment,
    city: addressFields.city.optional(),
    state: addressFields.state.optional(),
    postalCode: addressFields.postalCode.optional(),
    isDefault: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const addressIdParamDto = z.object({
  addressId: z.string().uuid('Invalid address ID'),
});

export type CreateAddressDto = z.infer<typeof createAddressDto>;
export type UpdateAddressDto = z.infer<typeof updateAddressDto>;
export type AddressIdParamDto = z.infer<typeof addressIdParamDto>;
