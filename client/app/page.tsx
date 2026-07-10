import { CategorySection } from '@/components/home/CategorySection';
import { CampaignAnnouncementSection } from '@/components/home/CampaignAnnouncementSection';
import { AtelierStatsSection } from '@/components/home/AtelierStatsSection';
import { FeaturedCollectionSection } from '@/components/home/FeaturedCollectionSection';
import { HeroScrollContainer } from '@/components/home/HeroScrollContainer';
import { JournalSection } from '@/components/home/JournalSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { TrendingSection } from '@/components/home/TrendingSection';

export default function HomePage() {
  return (
    <main>
      <HeroScrollContainer />
      <CampaignAnnouncementSection className="-mt-[35vh] md:-mt-[55vh]" />
      <CategorySection className="-mt-[12vh] pt-[12vh] md:-mt-[24vh] md:pt-[24vh]" />
      <TrendingSection />
      <AtelierStatsSection />
      <JournalSection />
      <FeaturedCollectionSection />
      <TestimonialsSection />
    </main>
  );
}
