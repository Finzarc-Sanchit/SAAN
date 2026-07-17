import { Schema, model, type Types } from 'mongoose';
import { COLLECTION_STATUSES, type CollectionStatus } from '../../../../modules/collection/collection.types';

const collectionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    imageAlt: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: COLLECTION_STATUSES,
      required: true,
      default: 'draft',
      index: true,
    },
    sortOrder: { type: Number, required: true, min: 0, default: 0, index: true },
    featured: { type: Boolean, required: true, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

collectionSchema.index({ status: 1, sortOrder: 1, title: 1 });

export const CollectionModel = model('Collection', collectionSchema);

export type CollectionDocument = {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  description: string;
  tagline: string;
  imageUrl: string;
  imageAlt: string;
  status: CollectionStatus;
  sortOrder: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};
