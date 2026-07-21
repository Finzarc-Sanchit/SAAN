import { LegalPage } from '@/components/legal/LegalPage';
import { TERMS_AND_CONDITIONS } from '@/lib/site-policies';

export const metadata = {
  title: 'Terms & Conditions — SAAN',
  description: TERMS_AND_CONDITIONS.description,
};

export default function TermsPage() {
  return <LegalPage content={TERMS_AND_CONDITIONS} />;
}
