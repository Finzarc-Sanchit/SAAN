import { Types } from 'mongoose';
import type { IContactRepository } from '../../../../modules/contact/contact.repository.interface';
import type {
  Contact,
  ContactListFilter,
  ContactStatus,
  CreateContactInput,
} from '../../../../modules/contact/contact.types';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
import { normalizePagination } from '../../../../shared/utils/pagination';
import { ContactModel, type ContactDocument } from '../models/contact.model';

function toDomainContact(doc: ContactDocument): Contact {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    subject: doc.subject,
    message: doc.message,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildQuery(filter: ContactListFilter): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (filter.status) {
    query.status = filter.status;
  }
  if (filter.search) {
    const search = new RegExp(escapeRegex(filter.search.trim()), 'i');
    query.$or = [{ name: search }, { email: search }, { phone: search }, { subject: search }];
  }
  return query;
}

export class MongoContactRepository implements IContactRepository {
  async create(data: CreateContactInput): Promise<Contact> {
    const doc = await ContactModel.create({
      ...data,
      email: data.email.trim().toLowerCase(),
      status: 'new',
    });
    return toDomainContact(doc.toObject() as ContactDocument);
  }

  async findById(id: string): Promise<Contact | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await ContactModel.findById(id).lean<ContactDocument>().exec();
    return doc ? toDomainContact(doc) : null;
  }

  async findMany(filter: ContactListFilter, pagination: Pagination): Promise<Paginated<Contact>> {
    const { page, limit, skip } = normalizePagination(pagination);
    const query = buildQuery(filter);
    const [docs, total] = await Promise.all([
      ContactModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<ContactDocument[]>()
        .exec(),
      ContactModel.countDocuments(query).exec(),
    ]);
    return { items: docs.map(toDomainContact), page, limit, total };
  }

  async updateStatus(id: string, status: ContactStatus): Promise<Contact> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Contact submission not found');
    }
    const doc = await ContactModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    )
      .lean<ContactDocument>()
      .exec();
    if (!doc) {
      throw new NotFoundError('Contact submission not found');
    }
    return toDomainContact(doc);
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Contact submission not found');
    }
    const doc = await ContactModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundError('Contact submission not found');
    }
  }
}
