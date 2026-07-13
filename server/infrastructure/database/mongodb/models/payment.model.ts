import { Schema, model, type Types } from 'mongoose';

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    paymentMethod: { type: String, required: true, trim: true },
    paymentGateway: { type: String, required: true, trim: true },
    transactionId: { type: String, default: null, trim: true },
    gatewayOrderId: { type: String, default: null, trim: true, index: true },
    gatewayPaymentId: {
      type: String,
      default: null,
      trim: true,
      unique: true,
      sparse: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, uppercase: true },
    status: {
      type: String,
      enum: ['created', 'pending', 'paid', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    paidAt: { type: Date, default: null },
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
