import { Schema, model, type Types } from 'mongoose';

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;

        if (ret.productId) {
          ret.productId = String(ret.productId);
        }

        if (ret.userId) {
          ret.userId = String(ret.userId);
        }

        return ret;
      },
    },
  },
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const ReviewModel = model('Review', reviewSchema);

export type ReviewDocument = {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
};
