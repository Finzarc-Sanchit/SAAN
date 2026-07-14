import { CampaignFormPage } from '@/components/admin/campaigns/CampaignFormPage';

type AdminEditCampaignRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditCampaignRoute({ params }: AdminEditCampaignRouteProps) {
  const { id } = await params;
  return <CampaignFormPage mode="edit" campaignId={id} />;
}
