import { Schema, model, type Types } from 'mongoose';

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sizeId: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    addedAt: { type: Date, required: true, default: Date.now },
  },
  {
    _id: true,
    timestamps: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.cartItemId = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: {
      type: [cartItemSchema],
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
export const CartModel = model('Cart', cartSchema);

export type CartItemDocument = {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sizeId: string;
  quantity: number;
  addedAt: Date;
};

export type CartDocument = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: CartItemDocument[];
  createdAt: Date;
  updatedAt: Date;
};
