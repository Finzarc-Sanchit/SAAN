import { apiRequest, apiRequestWithMeta } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/types/api';
import type {
  AdminJournalListParams,
  CreateJournalInput,
  Journal,
  JournalCategory,
  UpdateJournalInput,
} from '@/lib/types/journal';

const PUBLIC_JOURNAL_BASE = '/api/v1/journal';
const ADMIN_JOURNAL_BASE = '/api/v1/admin/journal';

export type PublicJournalListParams = {
  page?: number;
  limit?: number;
  category?: JournalCategory;
  featured?: boolean;
};

export const journalQueryKeys = {
  all: ['admin', 'journal'] as const,
  list: (params: AdminJournalListParams) =>
    [...journalQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...journalQueryKeys.all, 'detail', id] as const,
  public: {
    all: ['journal'] as const,
    list: (params: PublicJournalListParams) =>
      ['journal', 'list', params] as const,
    detail: (slug: string) => ['journal', 'detail', slug] as const,
  },
};

function buildPublicListQuery(params: PublicJournalListParams): string {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.featured !== undefined) search.set('featured', String(params.featured));
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : '';
}

function buildListQuery(params: AdminJournalListParams): string {
  const search = new URLSearchParams();
  if (params.search) search.set('search', params.search);
  if (params.status) search.set('status', params.status);
  if (params.category) search.set('category', params.category);
  if (params.featured !== undefined) search.set('featured', String(params.featured));
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : '';
}

export type AdminJournalListResult = {
  items: Journal[];
  meta: PaginationMeta;
};

export async function listAdminJournals(
  params: AdminJournalListParams = {},
): Promise<AdminJournalListResult> {
  const { data, meta } = await apiRequestWithMeta<Journal[]>(
    `${ADMIN_JOURNAL_BASE}${buildListQuery(params)}`,
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

export async function getAdminJournal(id: string): Promise<Journal> {
  return apiRequest<Journal>(`${ADMIN_JOURNAL_BASE}/${id}`);
}

export async function createJournal(input: CreateJournalInput): Promise<Journal> {
  return apiRequest<Journal>(ADMIN_JOURNAL_BASE, {
    method: 'POST',
    body: input,
  });
}

export async function updateJournal(
  id: string,
  input: UpdateJournalInput,
): Promise<Journal> {
  return apiRequest<Journal>(`${ADMIN_JOURNAL_BASE}/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export async function deleteJournal(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`${ADMIN_JOURNAL_BASE}/${id}`, {
    method: 'DELETE',
  });
}

export type PublicJournalListResult = {
  items: Journal[];
  meta: PaginationMeta;
};

/** Browser-side public list (e.g. client components). Prefer server fetch on RSC pages. */
export async function listPublishedJournals(
  params: PublicJournalListParams = {},
): Promise<PublicJournalListResult> {
  const { data, meta } = await apiRequestWithMeta<Journal[]>(
    `${PUBLIC_JOURNAL_BASE}${buildPublicListQuery(params)}`,
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

export async function getPublishedJournalBySlug(slug: string): Promise<Journal> {
  return apiRequest<Journal>(`${PUBLIC_JOURNAL_BASE}/${encodeURIComponent(slug)}`);
}

export function publicJournalListPath(params: PublicJournalListParams = {}): string {
  return `${PUBLIC_JOURNAL_BASE}${buildPublicListQuery(params)}`;
}

export function publicJournalDetailPath(slug: string): string {
  return `${PUBLIC_JOURNAL_BASE}/${encodeURIComponent(slug)}`;
}
