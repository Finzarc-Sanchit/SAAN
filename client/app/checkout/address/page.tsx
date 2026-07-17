import type { Metadata } from 'next';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';

export const metadata: Metadata = {
  title: 'Delivery address | SAAN',
  description: 'Choose a delivery address for your SAAN order.',
};

export default function CheckoutAddressPage() {
  return <CheckoutPage step="address" />;
}
