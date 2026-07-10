import { CampaignAnnouncementRotator } from '@/components/campaign/CampaignAnnouncementRotator';
import { getActiveCampaigns } from '@/lib/data/campaigns';

type CampaignAnnouncementSectionProps = {
  className?: string;
};

export async function CampaignAnnouncementSection({
  className,
}: CampaignAnnouncementSectionProps) {
  const campaigns = await getActiveCampaigns();

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <CampaignAnnouncementRotator initialCampaigns={campaigns} className={className} />
  );
}
