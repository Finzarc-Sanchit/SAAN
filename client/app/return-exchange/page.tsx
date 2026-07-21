import { LegalPage } from '@/components/legal/LegalPage';
import { RETURN_EXCHANGE_POLICY } from '@/lib/site-policies';

export const metadata = {
  title: 'Return & Exchange Policy — SAAN',
  description: RETURN_EXCHANGE_POLICY.description,
};

export default function ReturnExchangePage() {
  return <LegalPage content={RETURN_EXCHANGE_POLICY} />;
}
