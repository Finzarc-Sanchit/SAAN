import type { ApiResponse } from '@/lib/types/api';
import type { Campaign } from '@/lib/types/campaign';
import { getBackendOrigin } from '@/lib/api/config';

/** Temporary static slides — always included until CMS content fully replaces them. */
const STATIC_CAMPAIGNS: Campaign[] = [
  {
    id: 'fallback-resort-2026',
    tag: 'Resort 2026',
    title: 'Where Stillness Becomes Statement',
    description:
      'In the hush between seasons, craft speaks loudest. Hand-finished zari, sun-warmed silks, and silhouettes shaped for women who need not announce their arrival.',
    image: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHSPN01s9mjYK9yweYgW2_FOPfS4lCuM7sXNi6Itmr7J7m3xy8gIqGv7y2aRqYCoFMy1u3UAgqpzlmKNWsqVq5ZAptrbvZCSuetmx1lvc9Gbu_uLNuDecZNPDzP-V0nbj4JZ9ygBIJzI3SZWpEjQ2HWDCPv5h4PT2nCnpyj4VUaQ7Cqamn1hfLzXQCTIZ5sgnB-PshpAYmwZYYLp01lrMehUvyZtr9pM8RxUbPHpX_m31RRCRSufeJRHOplRD8vglty-7hN-JKLTp0',
      alt: 'Model in SAAN resort couture against sunlit architecture',
    },
    discountPercent: null,
    cta: { label: 'Discover the Edit', href: '/collections/resort-2026' },
    startDate: '2020-01-01T00:00:00.000Z',
    endDate: '2030-12-31T23:59:59.000Z',
    priority: 0,
  },
  {
    id: 'fallback-ek-sunheri-dopahar',
    tag: 'Now Live',
    title: 'Ek Sunheri Dopahar',
    description:
      'Sun-warmed silks and gilded threadwork for the woman who moves through light with unhurried grace. An edit shaped for long afternoons and longer memories.',
    image: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdPy7cYr0PWZvju_YY7-sEr1LXrZE5ZEeXMHbN5PWFqaBQ-Ykl0tkIQpUPHi5ZxUgIFwPHCf5sQbGoxhZNW8zTMXnZhGWJyd3ixOhpiobAHozL3n3LGOJW4LdrL-G7GLBoQJMBg3_jT2LbyeQ10heJQ6hAdFcXKFQcSQ4ALk-2L0SMXLutedN34niL65A2b49abt3wBwDUCbQMnX_SNxBX8FeagweCRNhBj4ECc0WHlv-IW95Q9vao2MDZ7q8bBC-hYI4LEm4QZ8hj',
      alt: 'Models in SAAN golden afternoon collection',
    },
    discountPercent: 30,
    cta: { label: 'Explore the Collection', href: '/collections/ek-sunheri-dopahar' },
    startDate: '2020-01-01T00:00:00.000Z',
    endDate: '2030-12-31T23:59:59.000Z',
    priority: 1,
  },
];

export function isCampaignActive(campaign: Campaign, now = Date.now()): boolean {
  const start = new Date(campaign.startDate).getTime();
  const end = new Date(campaign.endDate).getTime();
  return now >= start && now < end;
}

function getStaticCampaigns(): Campaign[] {
  return STATIC_CAMPAIGNS.filter((campaign) => isCampaignActive(campaign));
}

/**
 * Merge static + API campaigns. Backend entries win on matching `id`.
 * Sorted by priority (ascending).
 */
function mergeCampaigns(staticCampaigns: Campaign[], fromApi: Campaign[]): Campaign[] {
  const byId = new Map<string, Campaign>();

  for (const campaign of staticCampaigns) {
    byId.set(campaign.id, campaign);
  }

  for (const campaign of fromApi) {
    byId.set(campaign.id, campaign);
  }

  return [...byId.values()]
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

async function fetchFromBackend(url: string): Promise<Campaign[]> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    return await parseActiveCampaignsResponse(response);
  } catch {
    return [];
  }
}

/** Browser: static slides + `GET /api/v1/campaigns/active` (via Next rewrite). */
export async function fetchActiveCampaignsClient(): Promise<Campaign[]> {
  const fromApi = await fetchFromBackend('/api/v1/campaigns/active');
  return mergeCampaigns(getStaticCampaigns(), fromApi);
}

/** Server Component: static slides + Express `/api/v1/campaigns/active`. */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  let fromApi: Campaign[] = [];

  try {
    const origin = getBackendOrigin();
    fromApi = await fetchFromBackend(`${origin}/api/v1/campaigns/active`);
  } catch {
    fromApi = [];
  }

  return mergeCampaigns(getStaticCampaigns(), fromApi);
}
