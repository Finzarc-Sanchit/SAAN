import { SizeGuidePageContent } from '@/components/legal/LegalPage';
import { SIZE_GUIDE_PAGE } from '@/lib/site-policies';

export const metadata = {
  title: 'Size Guide — SAAN',
  description: SIZE_GUIDE_PAGE.description,
};

export default function SizeGuidePage() {
  return (
    <SizeGuidePageContent
      title={SIZE_GUIDE_PAGE.title}
      description={SIZE_GUIDE_PAGE.description}
      charts={SIZE_GUIDE_PAGE.charts}
      note={SIZE_GUIDE_PAGE.note}
    />
  );
}
