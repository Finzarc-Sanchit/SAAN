import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type { IUserRepository } from '../../../../modules/user/user.repository.interface';
import type { Address, UpdateAddressInput } from '../../../../modules/user/user.types';
import { UserModel } from '../models/user.model';

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
}
