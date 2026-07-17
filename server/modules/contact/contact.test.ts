import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IEmailQueue } from '../../infrastructure/email/email-queue.interface';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { IContactRepository } from './contact.repository.interface';
import { ContactService } from './contact.service';
import type { Contact, CreateContactInput } from './contact.types';

const contact: Contact = {
  id: 'contact-1',
  name: 'Aarav Mehta',
  email: 'aarav@example.com',
  phone: '+919876543210',
  subject: 'Order enquiry',
  message: 'I would like help with my recent order.',
  status: 'new',
  createdAt: new Date('2026-07-17T10:00:00Z'),
  updatedAt: new Date('2026-07-17T10:00:00Z'),
};

const input: CreateContactInput = {
  name: contact.name,
  email: '  AARAV@EXAMPLE.COM ',
  phone: contact.phone,
  subject: contact.subject,
  message: contact.message,
};

function repositoryMock(): jest.Mocked<IContactRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };
}

function queueMock(): jest.Mocked<IEmailQueue> {
  return { enqueue: jest.fn<IEmailQueue['enqueue']>().mockResolvedValue(undefined) };
}

describe('ContactService', () => {
  let repository: jest.Mocked<IContactRepository>;
  let queue: jest.Mocked<IEmailQueue>;
  let service: ContactService;

  beforeEach(() => {
    repository = repositoryMock();
    queue = queueMock();
    service = new ContactService(repository, queue);
  });

  it('persists a normalized submission and enqueues both email jobs', async () => {
    repository.create.mockResolvedValue(contact);
    queue.enqueue.mockResolvedValue();

    await expect(service.createContact(input)).resolves.toEqual(contact);

    expect(repository.create).toHaveBeenCalledWith({
      ...input,
      email: 'aarav@example.com',
    });
    expect(queue.enqueue).toHaveBeenCalledTimes(2);
    expect(queue.enqueue).toHaveBeenCalledWith(
      {
        type: 'contact-confirmation',
        to: contact.email,
        name: contact.name,
        subject: contact.subject,
      },
      { deduplicationId: 'contact-confirmation-contact-1' },
    );
    expect(queue.enqueue).toHaveBeenCalledWith(
      {
        type: 'contact-admin-notification',
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message,
      },
      { deduplicationId: 'contact-admin-contact-1' },
    );
  });

  it('propagates queue failures after persistence', async () => {
    const outage = new Error('Queue unavailable');
    repository.create.mockResolvedValue(contact);
    queue.enqueue.mockRejectedValue(outage);

    await expect(service.createContact(input)).rejects.toBe(outage);
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it('throws when an admin requests a missing contact', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getContact('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('delegates status updates and deletion', async () => {
    const resolved = { ...contact, status: 'resolved' as const };
    repository.updateStatus.mockResolvedValue(resolved);
    repository.delete.mockResolvedValue();

    await expect(service.updateStatus(contact.id, 'resolved')).resolves.toEqual(resolved);
    await expect(service.deleteContact(contact.id)).resolves.toBeUndefined();
  });
});
