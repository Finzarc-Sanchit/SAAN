import { Schema, model, type Types } from 'mongoose';

const discountSchema = new Schema(
  {
    type: { type: String, enum: ['percentage', 'flat'], required: true },
    value: { type: Number, required: true, min: 0 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
  },
  {
    timestamps: false,
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

export const DiscountModel = model('Discount', discountSchema);

export type DiscountDocument = {
  _id: Types.ObjectId;
  type: 'percentage' | 'flat';
  value: number;
  validFrom: Date;
  validTo: Date;
};
