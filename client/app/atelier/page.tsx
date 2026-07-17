import { AtelierBrandStorySection } from '@/components/atelier/AtelierBrandStorySection';
import { AtelierClassicStatementSection } from '@/components/atelier/AtelierClassicStatementSection';
import { AtelierClosingCopySection } from '@/components/atelier/AtelierClosingCopySection';
import { AtelierMadeToMeasureSection } from '@/components/atelier/AtelierMadeToMeasureSection';
import { AtelierVisitSection } from '@/components/atelier/AtelierVisitSection';
import { ATELIER_COPY } from '@/lib/site-content';

export const metadata = {
  title: 'Atelier — SAAN',
  description: ATELIER_COPY.intro[0],
};

export default function AtelierPage() {
  return (
    <main className="bg-paper">
      <AtelierBrandStorySection />
      <AtelierClassicStatementSection />
      <AtelierVisitSection />
      <AtelierMadeToMeasureSection />
      <AtelierClosingCopySection />
    </main>
  );
}
