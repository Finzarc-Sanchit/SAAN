import { NotFoundError } from '../../shared/errors/not-found-error';
import type { IUserRepository } from './user.repository.interface';
import type {
  AdminCustomerDetail,
  AdminCustomerListFilter,
  AdminCustomerListItem,
} from './customer.admin.types';
import type { Paginated, Pagination } from '../../shared/types/pagination';

export class CustomerAdminService {
  constructor(private readonly userRepository: IUserRepository) {}

  async listCustomers(
    filter: AdminCustomerListFilter,
    pagination: Pagination,
  ): Promise<Paginated<AdminCustomerListItem>> {
    return this.userRepository.findCustomersAdmin(filter, pagination);
  }

  async getCustomerById(id: string): Promise<AdminCustomerDetail> {
    const customer = await this.userRepository.findCustomerAdminById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    return customer;
  }
}
