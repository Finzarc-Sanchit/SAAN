import type { Address, CreateAddressInput, UpdateAddressInput } from './user.types';

export interface IUserRepository {
  findAddresses(userId: string): Promise<Address[]>;
  countAddresses(userId: string): Promise<number>;
  addAddress(userId: string, address: Address): Promise<Address>;
  updateAddress(userId: string, addressId: string, data: UpdateAddressInput): Promise<Address>;
  removeAddress(userId: string, addressId: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<Address>;
}

export type { CreateAddressInput };
