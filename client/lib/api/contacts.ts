import { apiRequest, apiRequestWithMeta } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/types/api';
import type {
  AdminContactListParams,
  Contact,
  ContactFormValues,
  UpdateContactStatusInput,
} from '@/lib/types/contact.schemas';

const PUBLIC_CONTACTS_BASE = '/api/v1/contact';
const ADMIN_CONTACTS_BASE = '/api/v1/admin/contacts';

export const contactsQueryKeys = {
  all: ['admin', 'contacts'] as const,
  list: (params: AdminContactListParams) => [...contactsQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...contactsQueryKeys.all, 'detail', id] as const,
};

function buildListQuery(params: AdminContactListParams): string {
  const search = new URLSearchParams();
  if (params.search) search.set('search', params.search);
  if (params.status) search.set('status', params.status);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : '';
}

export type AdminContactListResult = {
  items: Contact[];
  meta: PaginationMeta;
};

export async function submitContact(input: ContactFormValues): Promise<Contact> {
  return apiRequest<Contact>(PUBLIC_CONTACTS_BASE, {
    method: 'POST',
    body: input,
    skipAuthRefresh: true,
  });
}

export async function listAdminContacts(
  params: AdminContactListParams = {},
): Promise<AdminContactListResult> {
  const { data, meta } = await apiRequestWithMeta<Contact[]>(
    `${ADMIN_CONTACTS_BASE}${buildListQuery(params)}`,
  );

  return {
    items: data,
    meta: meta ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: data.length,
    },
  };
}

export async function getAdminContact(id: string): Promise<Contact> {
  return apiRequest<Contact>(`${ADMIN_CONTACTS_BASE}/${id}`);
}

export async function updateAdminContactStatus(
  id: string,
  input: UpdateContactStatusInput,
): Promise<Contact> {
  return apiRequest<Contact>(`${ADMIN_CONTACTS_BASE}/${id}/status`, {
    method: 'PATCH',
    body: input,
  });
}

export async function deleteAdminContact(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`${ADMIN_CONTACTS_BASE}/${id}`, {
    method: 'DELETE',
  });
}
