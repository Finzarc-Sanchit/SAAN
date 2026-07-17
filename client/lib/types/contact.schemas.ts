import { z } from 'zod';

export const CONTACT_STATUSES = ['new', 'in_progress', 'resolved'] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120, 'Name is too long'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email')
    .max(254, 'Email address is too long'),
  phone: z
    .string()
    .trim()
    .min(10, 'Please enter a valid phone number')
    .max(20, 'Please enter a valid phone number'),
  subject: z
    .string()
    .trim()
    .min(2, 'Please enter a subject')
    .max(200, 'Subject is too long'),
  message: z
    .string()
    .trim()
    .min(10, 'Please share a little more in your message')
    .max(5_000, 'Message must be 5,000 characters or fewer'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export type Contact = ContactFormValues & {
  id: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminContactListParams = {
  search?: string;
  status?: ContactStatus;
  page?: number;
  limit?: number;
};

export type UpdateContactStatusInput = {
  status: ContactStatus;
};
