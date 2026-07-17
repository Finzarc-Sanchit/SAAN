import { Types } from 'mongoose';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type { IPaymentRepository } from '../../../../modules/payment/payment.repository.interface';
import type {
  CreatePaymentInput,
  Payment,
  UpdatePaymentStatusOptions,
} from '../../../../modules/payment/payment.types';
import { PaymentModel, type PaymentDocument } from '../models/payment.model';

function toDomainPayment(doc: PaymentDocument): Payment {
  return {
    id: doc._id.toString(),
    orderId: doc.orderId.toString(),
    paymentMethod: doc.paymentMethod,
    paymentGateway: doc.paymentGateway,
    transactionId: doc.transactionId ?? null,
    gatewayOrderId: doc.gatewayOrderId ?? null,
    gatewayPaymentId: doc.gatewayPaymentId ?? null,
    amount: doc.amount,
    currency: doc.currency,
    status: doc.status,
    paidAt: doc.paidAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoPaymentRepository implements IPaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await PaymentModel.findById(id).lean<PaymentDocument>().exec();
    return doc ? toDomainPayment(doc) : null;
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    if (!Types.ObjectId.isValid(orderId)) {
      return [];
    }

    const docs = await PaymentModel.find({ orderId })
      .sort({ createdAt: -1 })
      .lean<PaymentDocument[]>()
      .exec();

    return docs.map(toDomainPayment);
  }

  async findByGatewayPaymentId(gatewayPaymentId: string): Promise<Payment | null> {
    const doc = await PaymentModel.findOne({ gatewayPaymentId })
      .lean<PaymentDocument>()
      .exec();

    return doc ? toDomainPayment(doc) : null;
  }

  async findByGatewayOrderId(gatewayOrderId: string): Promise<Payment | null> {
    const doc = await PaymentModel.findOne({ gatewayOrderId })
      .lean<PaymentDocument>()
      .exec();

    return doc ? toDomainPayment(doc) : null;
  }

  async create(data: CreatePaymentInput): Promise<Payment> {
    const doc = await PaymentModel.create({
      orderId: data.orderId,
      paymentMethod: data.paymentMethod,
      paymentGateway: data.paymentGateway,
      gatewayOrderId: data.gatewayOrderId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
    });

    return toDomainPayment(doc.toObject() as PaymentDocument);
  }

  async updateStatus(
    id: string,
    status: Payment['status'],
    options: UpdatePaymentStatusOptions = {},
  ): Promise<Payment> {
    const update: Record<string, unknown> = { status };

    if (options.paidAt !== undefined) {
      update.paidAt = options.paidAt;
    }

    if (options.gatewayPaymentId !== undefined) {
      update.gatewayPaymentId = options.gatewayPaymentId;
    }

    if (options.transactionId !== undefined) {
      update.transactionId = options.transactionId;
    }

    const doc = await PaymentModel.findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean<PaymentDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Payment not found');
    }

    return toDomainPayment(doc);
  }
}
