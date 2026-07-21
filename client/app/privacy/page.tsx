import { LegalPage } from '@/components/legal/LegalPage';
import { PRIVACY_POLICY } from '@/lib/site-policies';

export const metadata = {
  title: 'Privacy Policy — SAAN',
  description: PRIVACY_POLICY.description,
};

export default function PrivacyPolicyPage() {
  return <LegalPage content={PRIVACY_POLICY} />;
}
