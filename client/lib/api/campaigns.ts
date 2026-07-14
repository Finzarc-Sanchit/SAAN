import { apiRequest } from '@/lib/api/client';
import type {
  AdminCampaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from '@/lib/types/campaign';

const CAMPAIGNS_BASE = '/api/v1/campaigns';

export const campaignsQueryKeys = {
  all: ['admin', 'campaigns'] as const,
  list: () => [...campaignsQueryKeys.all] as const,
  detail: (id: string) => [...campaignsQueryKeys.all, 'detail', id] as const,
};

export async function listCampaigns(): Promise<AdminCampaign[]> {
  return apiRequest<AdminCampaign[]>(CAMPAIGNS_BASE);
}

export async function getCampaign(id: string): Promise<AdminCampaign> {
  return apiRequest<AdminCampaign>(`${CAMPAIGNS_BASE}/${id}`);
}

export async function createCampaign(input: CreateCampaignInput): Promise<AdminCampaign> {
  return apiRequest<AdminCampaign>(CAMPAIGNS_BASE, {
    method: 'POST',
    body: input,
  });
}

export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput,
): Promise<AdminCampaign> {
  return apiRequest<AdminCampaign>(`${CAMPAIGNS_BASE}/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export async function deleteCampaign(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`${CAMPAIGNS_BASE}/${id}`, {
    method: 'DELETE',
  });
}
