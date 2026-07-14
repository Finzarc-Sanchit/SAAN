import type { UserRole } from '../../shared/constants';
import type { Paginated, Pagination } from '../../shared/types/pagination';
import type {
  AdminCustomerDetail,
  AdminCustomerListFilter,
  AdminCustomerListItem,
} from './customer.admin.types';
import type { Address, CreateAddressInput, UpdateAddressInput } from './user.types';

export interface IUserRepository {
  findAddresses(userId: string): Promise<Address[]>;
  countAddresses(userId: string): Promise<number>;
  addAddress(userId: string, address: Address): Promise<Address>;
  updateAddress(userId: string, addressId: string, data: UpdateAddressInput): Promise<Address>;
  removeAddress(userId: string, addressId: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<Address>;

  /** Count of users created in [from, to). Optionally filter by role. */
  countUsersBetween(from: Date, to: Date, role?: UserRole): Promise<number>;

  findCustomersAdmin(
    filter: AdminCustomerListFilter,
    pagination: Pagination,
  ): Promise<Paginated<AdminCustomerListItem>>;

  findCustomerAdminById(id: string): Promise<AdminCustomerDetail | null>;
}

export type { CreateAddressInput };
