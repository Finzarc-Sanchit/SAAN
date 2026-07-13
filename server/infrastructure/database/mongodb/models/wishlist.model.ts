import { Schema, model, type Types } from 'mongoose';

const wishlistItemSchema = new Schema(
  {
    wishlistItemId: {
      type: String,
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    addedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  { _id: false },
);

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [wishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        if (ret.userId) {
          ret.userId = String(ret.userId);
        }
        return ret;
      },
    },
  },
);

wishlistSchema.index({ userId: 1 }, { unique: true });

export const WishlistModel = model('Wishlist', wishlistSchema);

export type WishlistItemDocument = {
  wishlistItemId: string;
  productId: Types.ObjectId;
  addedAt: Date;
};

export type WishlistDocument = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: WishlistItemDocument[];
  createdAt: Date;
  updatedAt: Date;
};
