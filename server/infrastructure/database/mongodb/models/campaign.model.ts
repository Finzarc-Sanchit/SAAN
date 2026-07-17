import { Schema, model, type Types } from 'mongoose';

const campaignSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    desktopImageUrl: { type: String, required: true, trim: true },
    desktopImageAlt: { type: String, required: true, trim: true },
    mobileImageUrl: { type: String, required: true, trim: true },
    mobileImageAlt: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    priority: { type: Number, required: true, min: 0, index: true },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        if (ret.productId) {
          ret.productId = String(ret.productId);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

campaignSchema.index({ active: 1, startDate: 1, endDate: 1, priority: 1 });

export const CampaignModel = model('Campaign', campaignSchema);

export type CampaignDocument = {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  desktopImageUrl: string;
  desktopImageAlt: string;
  mobileImageUrl: string;
  mobileImageAlt: string;
  startDate: Date;
  endDate: Date;
  priority: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};
