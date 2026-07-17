import { Schema, model, type Types } from 'mongoose';
import {
  NEWSLETTER_SOURCES,
  NEWSLETTER_STATUSES,
  type NewsletterSource,
  type NewsletterStatus,
} from '../../../../modules/newsletter/newsletter.types';

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    status: {
      type: String,
      enum: NEWSLETTER_STATUSES,
      required: true,
      default: 'active',
      index: true,
    },
    source: {
      type: String,
      enum: NEWSLETTER_SOURCES,
      required: true,
      default: 'other',
    },
    subscribedAt: { type: Date, required: true, default: Date.now, index: true },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

newsletterSchema.index({ status: 1, subscribedAt: -1 });

export const NewsletterModel = model('Newsletter', newsletterSchema);

export type NewsletterDocument = {
  _id: Types.ObjectId;
  email: string;
  status: NewsletterStatus;
  source: NewsletterSource;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
