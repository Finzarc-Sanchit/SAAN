import { z } from 'zod';

export const COLLECTION_STATUSES = ['draft', 'published'] as const;

export type CollectionStatus = (typeof COLLECTION_STATUSES)[number];

export type Collection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tagline: string;
  imageUrl: string;
  imageAlt: string;
  status: CollectionStatus;
  sortOrder: number;
  featured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

const collectionFieldsSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(2_000, 'Description must be 2,000 characters or fewer'),
  tagline: z
    .string()
    .trim()
    .min(1, 'Tagline is required')
    .max(240, 'Tagline must be 240 characters or fewer'),
  imageUrl: z.string().trim().url('A valid collection image is required'),
  imageAlt: z.string().trim().min(1, 'Image alt text is required').max(300),
  status: z.enum(COLLECTION_STATUSES),
  sortOrder: z
    .number({ invalid_type_error: 'Sort order is required' })
    .int('Sort order must be a whole number')
    .min(0, 'Sort order cannot be negative'),
  featured: z.boolean(),
});

export const createCollectionSchema = collectionFieldsSchema;

export const updateCollectionSchema = collectionFieldsSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field must be provided',
  });

export const collectionFormSchema = collectionFieldsSchema;

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
