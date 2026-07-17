import type { Paginated, Pagination } from '../../shared/types/pagination';
import type {
  Contact,
  ContactListFilter,
  ContactStatus,
  CreateContactInput,
} from './contact.types';

/** Persistence contract for contact submissions. */
export interface IContactRepository {
  create(data: CreateContactInput): Promise<Contact>;
  findById(id: string): Promise<Contact | null>;
  findMany(filter: ContactListFilter, pagination: Pagination): Promise<Paginated<Contact>>;
  updateStatus(id: string, status: ContactStatus): Promise<Contact>;
  delete(id: string): Promise<void>;
}
