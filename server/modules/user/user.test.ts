import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictError } from '../../shared/errors/conflict-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { IUserRepository } from './user.repository.interface';
import { USER_ADDRESS_CONSTANTS } from './user.constants';
import { UserService } from './user.service';
import type { Address } from './user.types';

function createAddress(overrides: Partial<Address> = {}): Address {
  return {
    addressId: overrides.addressId ?? 'addr-1',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '+1 555 123 4567',
    address: '123 Main St',
    apartment: null,
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    isDefault: false,
    ...overrides,
  };
}

function createMockRepository(): jest.Mocked<IUserRepository> {
  return {
    findAddresses: jest.fn(),
    countAddresses: jest.fn(),
    addAddress: jest.fn(),
    updateAddress: jest.fn(),
    removeAddress: jest.fn(),
    setDefaultAddress: jest.fn(),
  };
}

describe('UserService', () => {
  let repository: jest.Mocked<IUserRepository>;
  let service: UserService;

  beforeEach(() => {
    repository = createMockRepository();
    service = new UserService(repository);
    jest.clearAllMocks();
  });

  describe('addAddress', () => {
    it('throws ConflictError when the address cap is reached', async () => {
      repository.countAddresses.mockResolvedValue(USER_ADDRESS_CONSTANTS.MAX_ADDRESSES_PER_USER);

      await expect(
        service.addAddress('user-1', {
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '+1 555 123 4567',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
        }),
      ).rejects.toThrow(ConflictError);

      expect(repository.addAddress).not.toHaveBeenCalled();
    });

    it('marks the first address as default automatically', async () => {
      repository.countAddresses.mockResolvedValue(0);
      repository.addAddress.mockImplementation(async (_userId, address) => address);

      const result = await service.addAddress('user-1', {
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+1 555 123 4567',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
      });

      expect(result.isDefault).toBe(true);
      expect(repository.addAddress).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ isDefault: true }),
      );
    });
  });

  describe('setDefaultAddress', () => {
    it('delegates to the repository to unset other defaults atomically', async () => {
      const updated = createAddress({ addressId: 'addr-2', isDefault: true });
      repository.setDefaultAddress.mockResolvedValue(updated);

      const result = await service.setDefaultAddress('user-1', 'addr-2');

      expect(result).toEqual(updated);
      expect(repository.setDefaultAddress).toHaveBeenCalledWith('user-1', 'addr-2');
    });

    it('propagates NotFoundError when the address does not exist', async () => {
      repository.setDefaultAddress.mockRejectedValue(new NotFoundError('Address not found'));

      await expect(service.setDefaultAddress('user-1', 'missing')).rejects.toThrow(NotFoundError);
    });
  });
});

describe('MongoUserRepository.setDefaultAddress', () => {
  it('unsets isDefault on all other addresses in a single update', async () => {
    const { MongoUserRepository } = await import(
      '../../infrastructure/database/mongodb/repositories/user.repository'
    );
    const { UserModel } = await import('../../infrastructure/database/mongodb/models/user.model');

    const execMock = jest.fn<() => Promise<{ addresses: Address[] }>>();
    execMock.mockResolvedValue({
      addresses: [
        createAddress({ addressId: 'addr-1', isDefault: false }),
        createAddress({ addressId: 'addr-2', isDefault: true }),
      ],
    });

    const updateSpy = jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: execMock,
        }),
      }),
    } as never);

    const repository = new MongoUserRepository();
    const result = await repository.setDefaultAddress('user-1', 'addr-2');

    expect(result.isDefault).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith(
      { _id: 'user-1', 'addresses.addressId': 'addr-2' },
      expect.arrayContaining([
        expect.objectContaining({
          $set: expect.objectContaining({
            addresses: expect.objectContaining({
              $map: expect.any(Object),
            }),
          }),
        }),
      ]),
      { new: true },
    );

    updateSpy.mockRestore();
  });
});
