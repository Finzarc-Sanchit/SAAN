import { BrandStatementSection } from '@/components/home/BrandStatementSection';
import { BestSellersSection } from '@/components/home/BestSellersSection';
import { CampaignAnnouncementSection } from '@/components/home/CampaignAnnouncementSection';
import { CampaignHeroSection } from '@/components/home/CampaignHeroSection';
import { CommunitySection } from '@/components/home/CommunitySection';
import { CraftStorySection } from '@/components/home/CraftStorySection';
import { EditorialCampaignSection } from '@/components/home/EditorialCampaignSection';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';
import { ShopByOccasionSection } from '@/components/home/ShopByOccasionSection';
import { SignatureCollectionsSection } from '@/components/home/SignatureCollectionsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

export default function HomePage() {
  return (
    <main>
      <CampaignHeroSection />
      <CampaignAnnouncementSection />
      <NewArrivalsSection />
      <BrandStatementSection />
      <SignatureCollectionsSection />
      <EditorialCampaignSection />
      <ShopByOccasionSection />
      <BestSellersSection />
      <TestimonialsSection />
      <CraftStorySection />
      <CommunitySection />
    </main>
  );
}
