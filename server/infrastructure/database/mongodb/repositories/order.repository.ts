import { Types } from 'mongoose';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type { IOrderRepository } from '../../../../modules/order/order.repository.interface';
import type {
  CreateOrderInput,
  Order,
  OrderAddressSnapshot,
  OrderItem,
  OrderPaymentStatus,
  OrderStatus,
} from '../../../../modules/order/order.types';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
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
      return {
        items: [],
        page: pagination.page,
        limit: pagination.limit,
        total: 0,
      };
    }

    const query = { userId: new Types.ObjectId(userId) };
    const skip = (pagination.page - 1) * pagination.limit;

    const [docs, total] = await Promise.all([
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean<OrderDocument[]>()
        .exec(),
      OrderModel.countDocuments(query).exec(),
    ]);

    return {
      items: docs.map(toDomainOrder),
      page: pagination.page,
      limit: pagination.limit,
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
}
