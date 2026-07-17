export const CONTACT_STATUSES = ['new', 'in_progress', 'resolved'] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

/** Database-agnostic representation of a customer contact submission. */
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateContactInput = Pick<Contact, 'name' | 'email' | 'phone' | 'subject' | 'message'>;

export type ContactListFilter = {
  status?: ContactStatus;
  search?: string;
};
