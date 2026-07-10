import { AtelierBrandStorySection } from '@/components/atelier/AtelierBrandStorySection';
import { AtelierClassicHeroSection } from '@/components/atelier/AtelierClassicHeroSection';
import { AtelierClosingCopySection } from '@/components/atelier/AtelierClosingCopySection';
import { ATELIER_COPY } from '@/lib/site-content';

export const metadata = {
  title: 'Atelier — SAAN',
  description: ATELIER_COPY.intro[0],
};

export default function AtelierPage() {
  return (
    <main className="bg-saan-bone">
      <AtelierBrandStorySection />
      <AtelierClassicHeroSection />
      <AtelierClosingCopySection />
    </main>
  );
}
