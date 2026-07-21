import { LegalPage } from '@/components/legal/LegalPage';
import { SHIPPING_POLICY } from '@/lib/site-policies';

export const metadata = {
  title: 'Shipping Policy — SAAN',
  description: SHIPPING_POLICY.description,
};

export default function ShippingPolicyPage() {
  return <LegalPage content={SHIPPING_POLICY} />;
}
