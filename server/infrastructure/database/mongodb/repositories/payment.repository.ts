import { Types, type PipelineStage } from 'mongoose';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type { IPaymentRepository } from '../../../../modules/payment/payment.repository.interface';
import type {
  AdminPaymentListFilter,
  AdminPaymentListItem,
  CreatePaymentInput,
  Payment,
  PaymentStatus,
  UpdatePaymentStatusOptions,
} from '../../../../modules/payment/payment.types';
import { ORDER_CONSTANTS } from '../../../../modules/order/order.constants';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
import { normalizePagination } from '../../../../shared/utils/pagination';
import { PaymentModel, type PaymentDocument } from '../models/payment.model';
import { OrderModel } from '../models/order.model';

const ORDER_NUMBER_RE = ORDER_CONSTANTS.ORDER_NUMBER_PATTERN;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

  async findManyAdmin(
    filter: AdminPaymentListFilter,
    pagination: Pagination,
  ): Promise<Paginated<AdminPaymentListItem>> {
    const match: Record<string, unknown> = {};

    if (filter.status) {
      match.status = filter.status;
    }

    if (filter.paymentMethod) {
      match.paymentMethod = filter.paymentMethod;
    }

    if (filter.paymentGateway) {
      match.paymentGateway = filter.paymentGateway;
    }

    if (filter.from || filter.to) {
      const createdAt: Record<string, Date> = {};
      if (filter.from) {
        createdAt.$gte = filter.from;
      }
      if (filter.to) {
        createdAt.$lt = filter.to;
      }
      match.createdAt = createdAt;
    }

    const searchTerm = filter.search?.trim();
    if (searchTerm) {
      if (Types.ObjectId.isValid(searchTerm) && searchTerm.length === 24) {
        match.$or = [
          { _id: new Types.ObjectId(searchTerm) },
          { orderId: new Types.ObjectId(searchTerm) },
        ];
      } else if (ORDER_NUMBER_RE.test(searchTerm)) {
        const order = await OrderModel.findOne({ orderNumber: searchTerm })
          .select('_id')
          .lean()
          .exec();
        if (!order) {
          const { page, limit } = normalizePagination(pagination);
          return { items: [], page, limit, total: 0 };
        }
        match.orderId = order._id;
      } else if (searchTerm.startsWith('pay_')) {
        match.gatewayPaymentId = searchTerm;
      } else if (searchTerm.startsWith('order_')) {
        match.gatewayOrderId = searchTerm;
      }
    }

    const { page, limit, skip } = normalizePagination(pagination);
    const emailRegex =
      searchTerm &&
      searchTerm.includes('@') &&
      !(Types.ObjectId.isValid(searchTerm) && searchTerm.length === 24) &&
      !ORDER_NUMBER_RE.test(searchTerm) &&
      !searchTerm.startsWith('pay_') &&
      !searchTerm.startsWith('order_')
        ? new RegExp(`^${escapeRegex(searchTerm)}$`, 'i')
        : null;

    const gatewayRegex =
      searchTerm &&
      !emailRegex &&
      !(Types.ObjectId.isValid(searchTerm) && searchTerm.length === 24) &&
      !ORDER_NUMBER_RE.test(searchTerm) &&
      !searchTerm.startsWith('pay_') &&
      !searchTerm.startsWith('order_') &&
      searchTerm.length >= 3
        ? new RegExp(escapeRegex(searchTerm), 'i')
        : null;

    const pipeline: PipelineStage[] = [{ $match: match }];

    pipeline.push(
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'orderDoc',
        },
      },
      {
        $addFields: {
          orderDoc: { $arrayElemAt: ['$orderDoc', 0] },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'orderDoc.userId',
          foreignField: '_id',
          as: 'customerUser',
        },
      },
      {
        $addFields: {
          customerUser: { $arrayElemAt: ['$customerUser', 0] },
        },
      },
    );

    if (emailRegex) {
      pipeline.push({
        $match: {
          'customerUser.email': emailRegex,
        },
      });
    } else if (gatewayRegex) {
      pipeline.push({
        $match: {
          $or: [
            { gatewayOrderId: gatewayRegex },
            { gatewayPaymentId: gatewayRegex },
            { transactionId: gatewayRegex },
            { 'orderDoc.orderNumber': gatewayRegex },
          ],
        },
      });
    }

    const [facet] = await PaymentModel.aggregate<{
      items: Array<{
        _id: Types.ObjectId;
        orderId: Types.ObjectId;
        paymentMethod: string;
        paymentGateway: string;
        transactionId: string | null;
        gatewayOrderId: string | null;
        gatewayPaymentId: string | null;
        amount: number;
        currency: string;
        status: PaymentStatus;
        paidAt: Date | null;
        createdAt: Date;
        orderDoc?: {
          orderNumber?: string;
        };
        customerUser?: {
          email?: string;
          firstName?: string;
          lastName?: string;
        };
      }>;
      total: Array<{ count: number }>;
    }>([
      ...pipeline,
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ]).exec();

    const rows = facet?.items ?? [];
    const total = facet?.total[0]?.count ?? 0;

    const items: AdminPaymentListItem[] = rows.map((row) => ({
      id: row._id.toString(),
      orderId: row.orderId.toString(),
      orderNumber: row.orderDoc?.orderNumber ?? '—',
      customerEmail: row.customerUser?.email ?? 'Unknown',
      customerName: row.customerUser
        ? `${row.customerUser.firstName ?? ''} ${row.customerUser.lastName ?? ''}`.trim() ||
          'Unknown'
        : 'Unknown',
      paymentMethod: row.paymentMethod,
      paymentGateway: row.paymentGateway,
      transactionId: row.transactionId ?? null,
      gatewayOrderId: row.gatewayOrderId ?? null,
      gatewayPaymentId: row.gatewayPaymentId ?? null,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      paidAt: row.paidAt ?? null,
      createdAt: row.createdAt,
    }));

    return {
      items,
      page,
      limit,
      total,
    };
  }
}
