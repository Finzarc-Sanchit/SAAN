import { Schema, model, type Types } from 'mongoose';
import {
  NEWSLETTER_CAMPAIGN_STATUSES,
  type NewsletterCampaignStatus,
} from '../../../../modules/newsletter/newsletter.types';

const newsletterCampaignSchema = new Schema(
  {
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    preheader: { type: String, default: null, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 20_000 },
    status: {
      type: String,
      enum: NEWSLETTER_CAMPAIGN_STATUSES,
      required: true,
      default: 'sending',
      index: true,
    },
    createdByAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientCount: { type: Number, required: true, min: 0 },
    queuedCount: { type: Number, required: true, default: 0, min: 0 },
    failedCount: { type: Number, required: true, default: 0, min: 0 },
    queuedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

newsletterCampaignSchema.index({ createdAt: -1 });

export const NewsletterCampaignModel = model(
  'NewsletterCampaign',
  newsletterCampaignSchema,
);

export type NewsletterCampaignDocument = {
  _id: Types.ObjectId;
  subject: string;
  preheader: string | null;
  content: string;
  status: NewsletterCampaignStatus;
  createdByAdminId: Types.ObjectId;
  recipientCount: number;
  queuedCount: number;
  failedCount: number;
  queuedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
