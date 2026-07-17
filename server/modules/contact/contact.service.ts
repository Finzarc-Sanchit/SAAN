import type { IEmailQueue } from '../../infrastructure/email/email-queue.interface';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { Paginated, Pagination } from '../../shared/types/pagination';
import type { IContactRepository } from './contact.repository.interface';
import type {
  Contact,
  ContactListFilter,
  ContactStatus,
  CreateContactInput,
} from './contact.types';

/** Coordinates contact persistence, administration, and transactional email jobs. */
export class ContactService {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly emailQueue: IEmailQueue,
  ) {}

  async createContact(input: CreateContactInput): Promise<Contact> {
    const contact = await this.contactRepository.create({
      ...input,
      email: input.email.trim().toLowerCase(),
    });

    await Promise.all([
      this.emailQueue.enqueue(
        {
          type: 'contact-confirmation',
          to: contact.email,
          name: contact.name,
          subject: contact.subject,
        },
        { deduplicationId: `contact-confirmation-${contact.id}` },
      ),
      this.emailQueue.enqueue(
        {
          type: 'contact-admin-notification',
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          subject: contact.subject,
          message: contact.message,
        },
        { deduplicationId: `contact-admin-${contact.id}` },
      ),
    ]);

    return contact;
  }

  listContacts(filter: ContactListFilter, pagination: Pagination): Promise<Paginated<Contact>> {
    return this.contactRepository.findMany(filter, pagination);
  }

  async getContact(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundError('Contact submission not found');
    }
    return contact;
  }

  updateStatus(id: string, status: ContactStatus): Promise<Contact> {
    return this.contactRepository.updateStatus(id, status);
  }

  deleteContact(id: string): Promise<void> {
    return this.contactRepository.delete(id);
  }
}
