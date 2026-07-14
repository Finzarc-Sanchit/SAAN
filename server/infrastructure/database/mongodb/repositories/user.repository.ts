import { Types } from 'mongoose';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import { USER_ROLES, type UserRole } from '../../../../shared/constants';
import type { IUserRepository } from '../../../../modules/user/user.repository.interface';
import type {
  AdminCustomerDetail,
  AdminCustomerListFilter,
  AdminCustomerListItem,
} from '../../../../modules/user/customer.admin.types';
import type { Address, UpdateAddressInput } from '../../../../modules/user/user.types';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
import { normalizePagination } from '../../../../shared/utils/pagination';
import { UserModel } from '../models/user.model';
import { OrderModel } from '../models/order.model';

type RawAddress = {
  addressId: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment?: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

function toDomainAddress(doc: RawAddress): Address {
  return {
    addressId: doc.addressId,
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,
    address: doc.address,
    apartment: doc.apartment ?? null,
    city: doc.city,
    state: doc.state,
    postalCode: doc.postalCode,
    isDefault: doc.isDefault,
  };
}

function findAddressInDoc(addresses: RawAddress[], addressId: string): Address {
  const found = addresses.find((entry) => entry.addressId === addressId);
  if (!found) {
    throw new NotFoundError('Address not found');
  }
  return toDomainAddress(found);
}

export class MongoUserRepository implements IUserRepository {
  async findAddresses(userId: string): Promise<Address[]> {
    const doc = await UserModel.findById(userId).select('addresses').lean().exec();

    if (!doc) {
      throw new NotFoundError('User not found');
    }

    return (doc.addresses ?? []).map((entry) => toDomainAddress(entry as RawAddress));
  }

  async countAddresses(userId: string): Promise<number> {
    const doc = await UserModel.findById(userId).select('addresses').lean().exec();

    if (!doc) {
      throw new NotFoundError('User not found');
    }

    return doc.addresses?.length ?? 0;
  }

  async addAddress(userId: string, address: Address): Promise<Address> {
    if (address.isDefault) {
      const doc = await UserModel.findOneAndUpdate(
        { _id: userId },
        [
          {
            $set: {
              addresses: {
                $concatArrays: [
                  {
                    $map: {
                      input: { $ifNull: ['$addresses', []] },
                      as: 'existing',
                      in: { $mergeObjects: ['$$existing', { isDefault: false }] },
                    },
                  },
                  [address],
                ],
              },
            },
          },
        ],
        { new: true },
      )
        .select('addresses')
        .lean()
        .exec();

      if (!doc) {
        throw new NotFoundError('User not found');
      }

      return findAddressInDoc((doc.addresses ?? []) as RawAddress[], address.addressId);
    }

    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true },
    )
      .select('addresses')
      .lean()
      .exec();

    if (!doc) {
      throw new NotFoundError('User not found');
    }

    return findAddressInDoc((doc.addresses ?? []) as RawAddress[], address.addressId);
  }

  async updateAddress(userId: string, addressId: string, data: UpdateAddressInput): Promise<Address> {
    const { isDefault, ...fields } = data;
    const setFields: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        setFields[`addresses.$[target].${key}`] = value;
      }
    }

    if (Object.keys(setFields).length > 0) {
      const doc = await UserModel.findOneAndUpdate(
        { _id: userId, 'addresses.addressId': addressId },
        { $set: setFields },
        {
          arrayFilters: [{ 'target.addressId': addressId }],
          new: true,
        },
      )
        .select('addresses')
        .lean()
        .exec();

      if (!doc) {
        throw new NotFoundError('Address not found');
      }
    }

    if (isDefault === true) {
      return this.setDefaultAddress(userId, addressId);
    }

    const addresses = await this.findAddresses(userId);
    const existing = addresses.find((entry) => entry.addressId === addressId);
    if (!existing) {
      throw new NotFoundError('Address not found');
    }

    return existing;
  }

  async removeAddress(userId: string, addressId: string): Promise<void> {
    const doc = await UserModel.findOneAndUpdate(
      { _id: userId, 'addresses.addressId': addressId },
      [
        {
          $set: {
            addresses: {
              $filter: {
                input: '$addresses',
                as: 'addr',
                cond: { $ne: ['$$addr.addressId', addressId] },
              },
            },
          },
        },
        {
          $set: {
            addresses: {
              $let: {
                vars: {
                  remaining: '$addresses',
                  hasDefault: {
                    $anyElementTrue: {
                      $map: {
                        input: '$addresses',
                        as: 'addr',
                        in: '$$addr.isDefault',
                      },
                    },
                  },
                },
                in: {
                  $cond: {
                    if: {
                      $and: [{ $gt: [{ $size: '$$remaining' }, 0] }, { $not: '$$hasDefault' }],
                    },
                    then: {
                      $map: {
                        input: '$$remaining',
                        as: 'addr',
                        in: {
                          $mergeObjects: [
                            '$$addr',
                            {
                              isDefault: {
                                $eq: [{ $indexOfArray: ['$$remaining', '$$addr'] }, 0],
                              },
                            },
                          ],
                        },
                      },
                    },
                    else: '$$remaining',
                  },
                },
              },
            },
          },
        },
      ],
      { new: true },
    )
      .select('addresses')
      .lean()
      .exec();

    if (!doc) {
      throw new NotFoundError('Address not found');
    }
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    const doc = await UserModel.findOneAndUpdate(
      { _id: userId, 'addresses.addressId': addressId },
      [
        {
          $set: {
            addresses: {
              $map: {
                input: '$addresses',
                as: 'addr',
                in: {
                  $mergeObjects: [
                    '$$addr',
                    { isDefault: { $eq: ['$$addr.addressId', addressId] } },
                  ],
                },
              },
            },
          },
        },
      ],
      { new: true },
    )
      .select('addresses')
      .lean()
      .exec();

    if (!doc) {
      throw new NotFoundError('Address not found');
    }

    return findAddressInDoc((doc.addresses ?? []) as RawAddress[], addressId);
  }

  async countUsersBetween(from: Date, to: Date, role?: UserRole): Promise<number> {
    const filter: Record<string, unknown> = {
      createdAt: { $gte: from, $lt: to },
    };

    if (role) {
      filter.role = role;
    }

    return UserModel.countDocuments(filter).exec();
  }

  async findCustomersAdmin(
    filter: AdminCustomerListFilter,
    pagination: Pagination,
  ): Promise<Paginated<AdminCustomerListItem>> {
    const match: Record<string, unknown> = {
      role: USER_ROLES.CUSTOMER,
    };

    if (filter.isVerified !== undefined) {
      match.isVerified = filter.isVerified;
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
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      match.$or = [{ email: regex }, { firstName: regex }, { lastName: regex }];
    }

    const { page, limit, skip } = normalizePagination(pagination);

    const [facet] = await UserModel.aggregate<{
      items: Array<{
        _id: Types.ObjectId;
        email: string;
        firstName: string;
        lastName: string;
        isVerified: boolean;
        createdAt: Date;
        orderCount: number;
        totalSpent: number;
      }>;
      total: Array<{ count: number }>;
    }>([
      { $match: match },
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
            {
              $group: {
                _id: null,
                orderCount: { $sum: 1 },
                totalSpent: {
                  $sum: {
                    $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0],
                  },
                },
              },
            },
          ],
          as: 'orderStats',
        },
      },
      {
        $addFields: {
          orderCount: {
            $ifNull: [{ $arrayElemAt: ['$orderStats.orderCount', 0] }, 0],
          },
          totalSpent: {
            $ifNull: [{ $arrayElemAt: ['$orderStats.totalSpent', 0] }, 0],
          },
        },
      },
      { $project: { orderStats: 0 } },
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
        email: row.email,
        firstName: row.firstName,
        lastName: row.lastName,
        isVerified: row.isVerified,
        orderCount: row.orderCount,
        totalSpent: row.totalSpent,
        createdAt: row.createdAt,
      })),
      page,
      limit,
      total,
    };
  }

  async findCustomerAdminById(id: string): Promise<AdminCustomerDetail | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const userObjectId = new Types.ObjectId(id);

    const [userDoc, orderStatsRows, recentOrderDocs] = await Promise.all([
      UserModel.findOne({ _id: userObjectId, role: USER_ROLES.CUSTOMER })
        .select('email firstName lastName isVerified addresses createdAt updatedAt')
        .lean()
        .exec(),
      OrderModel.aggregate<{ orderCount: number; totalSpent: number; lastOrderAt: Date | null }>([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            orderCount: { $sum: 1 },
            totalSpent: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0],
              },
            },
            lastOrderAt: { $max: '$createdAt' },
          },
        },
      ]).exec(),
      OrderModel.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('total status paymentStatus createdAt')
        .lean()
        .exec(),
    ]);

    if (!userDoc) {
      return null;
    }

    const orderStats = orderStatsRows[0];

    return {
      id: userDoc._id.toString(),
      email: userDoc.email,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      isVerified: userDoc.isVerified,
      addresses: (userDoc.addresses ?? []).map((entry) => toDomainAddress(entry as RawAddress)),
      orderCount: orderStats?.orderCount ?? 0,
      totalSpent: orderStats?.totalSpent ?? 0,
      lastOrderAt: orderStats?.lastOrderAt ?? null,
      recentOrders: recentOrderDocs.map((order) => ({
        id: order._id.toString(),
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      })),
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };
  }
}
