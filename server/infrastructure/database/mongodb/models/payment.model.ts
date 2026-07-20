import { Schema, model, type Types } from 'mongoose';

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    paymentMethod: { type: String, required: true, trim: true },
    paymentGateway: { type: String, required: true, trim: true },
    transactionId: { type: String, trim: true },
    gatewayOrderId: { type: String, trim: true, index: true },
    // Do not default to null — null values collide on a unique index.
    gatewayPaymentId: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, uppercase: true },
    status: {
      type: String,
      enum: ['created', 'pending', 'paid', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    paidAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;

        if (ret.orderId) {
          ret.orderId = String(ret.orderId);
        }

        return ret;
      },
    },
  },
);

// Unique only when a real Razorpay payment id exists (allows many unpaid rows).
paymentSchema.index(
  { gatewayPaymentId: 1 },
  {
    unique: true,
    name: 'gatewayPaymentId_partial_unique',
    partialFilterExpression: {
      gatewayPaymentId: { $exists: true, $type: 'string' },
    },
  },
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ paymentGateway: 1, createdAt: -1 });

export const PaymentModel = model('Payment', paymentSchema);

export type PaymentDocument = {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  paymentMethod: string;
  paymentGateway: string;
  transactionId: string | null;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  amount: number;
  currency: string;
  status: 'created' | 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
