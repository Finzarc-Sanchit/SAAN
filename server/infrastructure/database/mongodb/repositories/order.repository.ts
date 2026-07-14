import { Types } from 'mongoose';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type {
  AnalyticsPeriod,
  AnalyticsTimeSeriesMetric,
  AnalyticsTimeSeriesPoint,
  IOrderRepository,
  MonthlySalesBucket,
  TopProductSalesResult,
} from '../../../../modules/order/order.repository.interface';
import type {
  AdminOrderListFilter,
  AdminOrderListItem,
  CreateOrderInput,
  Order,
  OrderAddressSnapshot,
  OrderItem,
  OrderPaymentStatus,
  OrderStatus,
} from '../../../../modules/order/order.types';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
import { normalizePagination } from '../../../../shared/utils/pagination';
import {
  OrderModel,
  type OrderAddressSnapshotDocument,
  type OrderDocument,
  type OrderItemDocument,
} from '../models/order.model';

function toDomainAddressSnapshot(doc: OrderAddressSnapshotDocument): OrderAddressSnapshot {
  return {
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,
    address: doc.address,
    apartment: doc.apartment,
    city: doc.city,
    state: doc.state,
    postalCode: doc.postalCode,
  };
}

function toDomainOrderItem(doc: OrderItemDocument): OrderItem {
  return {
    orderItemId: doc._id.toString(),
    productId: doc.productId.toString(),
    sizeId: doc.sizeId,
    productNameSnapshot: doc.productNameSnapshot,
    quantity: doc.quantity,
    unitPrice: doc.unitPrice,
    totalPrice: doc.totalPrice,
  };
}

function toDomainOrder(doc: OrderDocument): Order {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    addressSnapshot: toDomainAddressSnapshot(doc.addressSnapshot),
    items: doc.items.map(toDomainOrderItem),
    subtotal: doc.subtotal,
    discount: doc.discount,
    shippingCharge: doc.shippingCharge,
    total: doc.total,
    currency: doc.currency,
    status: doc.status,
    paymentStatus: doc.paymentStatus,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function dateTruncUnit(period: AnalyticsPeriod): 'month' | 'quarter' | 'year' {
  if (period === 'quarterly') {
    return 'quarter';
  }
  if (period === 'annually') {
    return 'year';
  }
  return 'month';
}

export class MongoOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await OrderModel.findById(id).lean<OrderDocument>().exec();
    return doc ? toDomainOrder(doc) : null;
  }

  async findByUser(userId: string, pagination: Pagination): Promise<Paginated<Order>> {
    if (!Types.ObjectId.isValid(userId)) {
      const { page, limit } = normalizePagination(pagination);
      return {
        items: [],
        page,
        limit,
        total: 0,
      };
    }

    const query = { userId: new Types.ObjectId(userId) };
    const { page, limit, skip } = normalizePagination(pagination);

    const [docs, total] = await Promise.all([
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<OrderDocument[]>()
        .exec(),
      OrderModel.countDocuments(query).exec(),
    ]);

    return {
      items: docs.map(toDomainOrder),
      page,
      limit,
      total,
    };
  }

  async create(data: CreateOrderInput): Promise<Order> {
    if (!Types.ObjectId.isValid(data.userId)) {
      throw new NotFoundError('User not found');
    }

    const doc = await OrderModel.create({
      userId: new Types.ObjectId(data.userId),
      addressSnapshot: data.addressSnapshot,
      items: data.items.map((item) => ({
        productId: new Types.ObjectId(item.productId),
        sizeId: item.sizeId,
        productNameSnapshot: item.productNameSnapshot,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      subtotal: data.subtotal,
      discount: data.discount,
      shippingCharge: data.shippingCharge,
      total: data.total,
      currency: data.currency,
      status: data.status,
      paymentStatus: data.paymentStatus,
    });

    return toDomainOrder(doc.toObject() as OrderDocument);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Order not found');
    }

    const doc = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    )
      .lean<OrderDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Order not found');
    }

    return toDomainOrder(doc);
  }

  async updatePaymentStatus(id: string, paymentStatus: OrderPaymentStatus): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Order not found');
    }

    const doc = await OrderModel.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true, runValidators: true },
    )
      .lean<OrderDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Order not found');
    }

    return toDomainOrder(doc);
  }

  async getMonthlySales(year: number): Promise<MonthlySalesBucket[]> {
    const from = new Date(Date.UTC(year, 0, 1));
    const to = new Date(Date.UTC(year + 1, 0, 1));

    const rows = await OrderModel.aggregate<{ _id: number; total: number }>([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: from, $lt: to },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec();

    return rows.map((row) => ({
      month: row._id,
      total: row.total,
    }));
  }

  async getRevenueBetween(from: Date, to: Date): Promise<number> {
    const rows = await OrderModel.aggregate<{ total: number }>([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: from, $lt: to },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]).exec();

    return rows[0]?.total ?? 0;
  }

  async countOrdersBetween(from: Date, to: Date): Promise<number> {
    return OrderModel.countDocuments({
      createdAt: { $gte: from, $lt: to },
    }).exec();
  }

  async getTimeSeries(
    period: AnalyticsPeriod,
    from: Date,
    to: Date,
    metric: AnalyticsTimeSeriesMetric = 'revenue',
  ): Promise<AnalyticsTimeSeriesPoint[]> {
    const match =
      metric === 'revenue'
        ? {
            paymentStatus: 'paid' as const,
            createdAt: { $gte: from, $lt: to },
          }
        : {
            createdAt: { $gte: from, $lt: to },
          };

    const rows = await OrderModel.aggregate<{ _id: Date; total: number }>([
      { $match: match },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$createdAt',
              unit: dateTruncUnit(period),
            },
          },
          total: metric === 'revenue' ? { $sum: '$total' } : { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec();

    return rows.map((row) => ({
      date: row._id,
      total: row.total,
    }));
  }

  async getTopSellingProducts(limit: number): Promise<TopProductSalesResult> {
    const safeLimit = Math.max(1, Math.min(limit, 50));

    const [facet] = await OrderModel.aggregate<{
      top: Array<{ _id: unknown; unitsSold: number; productName: string }>;
      totals: Array<{ totalUnitsSold: number }>;
    }>([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $facet: {
          top: [
            {
              $group: {
                _id: '$items.productId',
                unitsSold: { $sum: '$items.quantity' },
                productName: { $first: '$items.productNameSnapshot' },
              },
            },
            { $sort: { unitsSold: -1 } },
            { $limit: safeLimit },
          ],
          totals: [
            {
              $group: {
                _id: null,
                totalUnitsSold: { $sum: '$items.quantity' },
              },
            },
          ],
        },
      },
    ]).exec();

    const items = (facet?.top ?? []).map((row) => ({
      productId: String(row._id),
      productName: row.productName,
      unitsSold: row.unitsSold,
    }));

    return {
      items,
      totalUnitsSold: facet?.totals[0]?.totalUnitsSold ?? 0,
    };
  }

  async findRecent(limit: number): Promise<Order[]> {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const docs = await OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean<OrderDocument[]>()
      .exec();

    return docs.map(toDomainOrder);
  }

  async findManyAdmin(
    filter: AdminOrderListFilter,
    pagination: Pagination,
  ): Promise<Paginated<AdminOrderListItem>> {
    const match: Record<string, unknown> = {};

    if (filter.status) {
      match.status = filter.status;
    }

    if (filter.paymentStatus) {
      match.paymentStatus = filter.paymentStatus;
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
    if (searchTerm && Types.ObjectId.isValid(searchTerm)) {
      match._id = new Types.ObjectId(searchTerm);
    }

    const { page, limit, skip } = normalizePagination(pagination);
    const emailRegex =
      searchTerm && !Types.ObjectId.isValid(searchTerm)
        ? new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        : null;

    const pipeline: Record<string, unknown>[] = [{ $match: match }];

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'customerUser',
        },
      },
      {
        $addFields: {
          customerUser: { $arrayElemAt: ['$customerUser', 0] },
          itemCount: { $size: '$items' },
        },
      },
    );

    if (emailRegex) {
      pipeline.push({
        $match: {
          'customerUser.email': emailRegex,
        },
      });
    }

    const [facet] = await OrderModel.aggregate<{
      items: Array<{
        _id: Types.ObjectId;
        userId: Types.ObjectId;
        customerUser?: {
          email?: string;
          firstName?: string;
          lastName?: string;
        };
        itemCount: number;
        total: number;
        currency: string;
        status: OrderStatus;
        paymentStatus: OrderPaymentStatus;
        createdAt: Date;
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

    return {
      items: rows.map((row) => ({
        id: row._id.toString(),
        userId: row.userId.toString(),
        customerEmail: row.customerUser?.email ?? 'Unknown',
        customerName: row.customerUser
          ? `${row.customerUser.firstName ?? ''} ${row.customerUser.lastName ?? ''}`.trim() ||
            'Unknown'
          : 'Unknown',
        itemCount: row.itemCount,
        total: row.total,
        currency: row.currency,
        status: row.status,
        paymentStatus: row.paymentStatus,
        createdAt: row.createdAt,
      })),
      page,
      limit,
      total,
    };
  }
}
