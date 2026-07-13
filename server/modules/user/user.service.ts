import { randomUUID } from 'crypto';
import { ConflictError } from '../../shared/errors/conflict-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { CreateAddressDto, UpdateAddressDto } from './address.dto';
import { USER_ADDRESS_CONSTANTS } from './user.constants';
import type { IUserRepository } from './user.repository.interface';
import type { Address } from './user.types';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async listAddresses(userId: string): Promise<Address[]> {
    return this.userRepository.findAddresses(userId);
  }

  async getAddressById(userId: string, addressId: string): Promise<Address> {
    const addresses = await this.userRepository.findAddresses(userId);
    const address = addresses.find((entry) => entry.addressId === addressId);

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    return address;
  }

  async addAddress(userId: string, input: CreateAddressDto): Promise<Address> {
    const count = await this.userRepository.countAddresses(userId);

    if (count >= USER_ADDRESS_CONSTANTS.MAX_ADDRESSES_PER_USER) {
      throw new ConflictError(
        `You can save up to ${USER_ADDRESS_CONSTANTS.MAX_ADDRESSES_PER_USER} addresses`,
      );
    }

    const isDefault = count === 0 ? true : (input.isDefault ?? false);

    const address: Address = {
      addressId: randomUUID(),
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      address: input.address,
      apartment: input.apartment ?? null,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      isDefault,
    };

    return this.userRepository.addAddress(userId, address);
  }

  async updateAddress(userId: string, addressId: string, input: UpdateAddressDto): Promise<Address> {
    return this.userRepository.updateAddress(userId, addressId, input);
  }

  async removeAddress(userId: string, addressId: string): Promise<void> {
    await this.userRepository.removeAddress(userId, addressId);
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    return this.userRepository.setDefaultAddress(userId, addressId);
  }
}
