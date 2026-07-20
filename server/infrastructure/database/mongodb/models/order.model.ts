import { Schema, model, type Types } from 'mongoose';

const orderAddressSnapshotSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    apartment: { type: String, default: null, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sizeId: { type: String, required: true, trim: true },
    productNameSnapshot: { type: String, required: true, trim: true },
    productImageSnapshot: { type: String, default: null, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  {
    _id: true,
    timestamps: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.orderItemId = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    /** Customer-facing order id (e.g. 407-1298468-3682757). Unique when present. */
    orderNumber: { type: String, trim: true },
    addressSnapshot: { type: orderAddressSnapshotSchema, required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => Array.isArray(items) && items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0 },
    shippingCharge: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, uppercase: true, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
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

        if (Array.isArray(ret.items)) {
          ret.items = ret.items.map((item: Record<string, unknown>) => {
            if (item.productId) {
              item.productId = String(item.productId);
            }
            return item;
          });
        }

        return ret;
      },
    },
  },
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index(
  { orderNumber: 1 },
  {
    unique: true,
    sparse: true,
    name: 'orderNumber_sparse_unique',
  },
);
export const OrderModel = model('Order', orderSchema);

export type OrderItemDocument = {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sizeId: string;
  productNameSnapshot: string;
  productImageSnapshot?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type OrderAddressSnapshotDocument = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
};

export type OrderDocument = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  orderNumber?: string;
  addressSnapshot: OrderAddressSnapshotDocument;
  items: OrderItemDocument[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
};
