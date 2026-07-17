import { z } from 'zod';
import { COLLECTION_STATUSES } from './collection.types';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'slug is required')
  .max(160, 'slug must be 160 characters or fewer')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be URL-safe lowercase text');

const collectionFields = {
  title: z.string().trim().min(1, 'title is required').max(160),
  description: z.string().trim().min(1, 'description is required').max(2_000),
  tagline: z.string().trim().min(1, 'tagline is required').max(240),
  imageUrl: z.string().url('imageUrl must be a valid URL'),
  imageAlt: z.string().trim().min(1, 'imageAlt is required').max(300),
  status: z.enum(COLLECTION_STATUSES),
  sortOrder: z.number().int().min(0),
  featured: z.boolean(),
};

export const createCollectionDto = z.object({
  ...collectionFields,
  status: collectionFields.status.default('draft'),
  featured: collectionFields.featured.default(false),
});

export const updateCollectionDto = z.object({
  title: collectionFields.title.optional(),
  description: collectionFields.description.optional(),
  tagline: collectionFields.tagline.optional(),
  imageUrl: collectionFields.imageUrl.optional(),
  imageAlt: collectionFields.imageAlt.optional(),
  status: collectionFields.status.optional(),
  sortOrder: collectionFields.sortOrder.optional(),
  featured: collectionFields.featured.optional(),
}).refine((input) => Object.keys(input).length > 0, {
  message: 'at least one collection field is required',
});

export const collectionIdParamsDto = z.object({
  id: z.string().min(1),
});

export const collectionSlugParamsDto = z.object({
  slug: slugSchema,
});

export type CreateCollectionDto = z.infer<typeof createCollectionDto>;
export type UpdateCollectionDto = z.infer<typeof updateCollectionDto>;
