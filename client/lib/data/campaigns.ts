import type { ApiResponse } from '@/lib/types/api';
import type { Campaign } from '@/lib/types/campaign';
import { getBackendOrigin } from '@/lib/api/config';

export function isCampaignActive(campaign: Campaign, now = Date.now()): boolean {
  const start = new Date(campaign.startDate).getTime();
  const end = new Date(campaign.endDate).getTime();
  return now >= start && now < end;
}

/** Keep backend campaigns in storefront display order. */
function prepareCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns
    .filter((campaign) => isCampaignActive(campaign))
    .sort((a, b) => a.priority - b.priority);
}

async function parseActiveCampaignsResponse(response: Response): Promise<Campaign[]> {
  if (!response.ok) {
    return [];
  }

  const json = (await response.json()) as ApiResponse<Campaign[]>;
  if (!json.success || !Array.isArray(json.data)) {
    return [];
  }

  return json.data;
}

async function fetchFromBackend(
  url: string,
  init?: RequestInit,
): Promise<Campaign[]> {
  try {
    const response = await fetch(url, init);
    return await parseActiveCampaignsResponse(response);
  } catch {
    return [];
  }
}

/** Browser: `GET /api/v1/campaigns/active` via the Next rewrite. */
export async function fetchActiveCampaignsClient(): Promise<Campaign[]> {
  const fromApi = await fetchFromBackend('/api/v1/campaigns/active', {
    cache: 'no-store',
  });
  return prepareCampaigns(fromApi);
}

/** Server Component: Express `GET /api/v1/campaigns/active`. */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  let fromApi: Campaign[] = [];

  try {
    const origin = getBackendOrigin();
    fromApi = await fetchFromBackend(`${origin}/api/v1/campaigns/active`, {
      // Short ISR window so the homepage does not wait on a cold API every request.
      next: { revalidate: 60 },
    });
  } catch {
    fromApi = [];
  }

  return prepareCampaigns(fromApi);
}
