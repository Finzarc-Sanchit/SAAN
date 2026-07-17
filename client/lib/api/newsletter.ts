import { apiRequest, apiRequestWithMeta } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/types/api';
import type {
  AdminNewsletterCampaignListParams,
  AdminNewsletterListParams,
  NewsletterCampaign,
  NewsletterSubscriber,
  NewsletterSubscribeInput,
  SendNewsletterCampaignInput,
  UpdateNewsletterStatusInput,
} from '@/lib/types/newsletter.schemas';

const PUBLIC_NEWSLETTER_BASE = '/api/v1/newsletter';
const ADMIN_NEWSLETTER_BASE = '/api/v1/admin/newsletter';

export const newsletterQueryKeys = {
  all: ['admin', 'newsletter'] as const,
  list: (params: AdminNewsletterListParams) =>
    [...newsletterQueryKeys.all, 'list', params] as const,
  campaigns: (params: AdminNewsletterCampaignListParams) =>
    [...newsletterQueryKeys.all, 'campaigns', params] as const,
};

function buildListQuery(params: AdminNewsletterListParams): string {
  const search = new URLSearchParams();
  if (params.search) search.set('search', params.search);
  if (params.status) search.set('status', params.status);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : '';
}

export type AdminNewsletterListResult = {
  items: NewsletterSubscriber[];
  meta: PaginationMeta;
};

export async function subscribeToNewsletter(
  input: NewsletterSubscribeInput,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(PUBLIC_NEWSLETTER_BASE, {
    method: 'POST',
    body: input,
    skipAuthRefresh: true,
  });
}

export async function listAdminNewsletter(
  params: AdminNewsletterListParams = {},
): Promise<AdminNewsletterListResult> {
  const { data, meta } = await apiRequestWithMeta<NewsletterSubscriber[]>(
    `${ADMIN_NEWSLETTER_BASE}${buildListQuery(params)}`,
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

export async function updateAdminNewsletterStatus(
  id: string,
  input: UpdateNewsletterStatusInput,
): Promise<NewsletterSubscriber> {
  return apiRequest<NewsletterSubscriber>(`${ADMIN_NEWSLETTER_BASE}/${id}/status`, {
    method: 'PATCH',
    body: input,
  });
}

export async function deleteAdminNewsletter(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`${ADMIN_NEWSLETTER_BASE}/${id}`, {
    method: 'DELETE',
  });
}

export type AdminNewsletterCampaignListResult = {
  items: NewsletterCampaign[];
  meta: PaginationMeta;
};

export async function sendAdminNewsletterCampaign(
  input: SendNewsletterCampaignInput,
): Promise<NewsletterCampaign> {
  return apiRequest<NewsletterCampaign>(
    `${ADMIN_NEWSLETTER_BASE}/campaigns/send`,
    {
      method: 'POST',
      body: input,
    },
  );
}

export async function listAdminNewsletterCampaigns(
  params: AdminNewsletterCampaignListParams = {},
): Promise<AdminNewsletterCampaignListResult> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  const { data, meta } = await apiRequestWithMeta<NewsletterCampaign[]>(
    `${ADMIN_NEWSLETTER_BASE}/campaigns${query ? `?${query}` : ''}`,
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
