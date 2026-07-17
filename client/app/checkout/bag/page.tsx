import type { Metadata } from 'next';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';

export const metadata: Metadata = {
  title: 'Shopping bag | SAAN',
  description: 'Review your SAAN shopping bag.',
};

export default function CheckoutBagPage() {
  return <CheckoutPage step="cart" />;
}
