import { NextResponse } from 'next/server';
import { getActiveCampaigns } from '@/lib/data/campaigns';

export const revalidate = 60;

export async function GET() {
  const campaigns = await getActiveCampaigns();
  return NextResponse.json({ campaigns });
}
