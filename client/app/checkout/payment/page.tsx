import type { Metadata } from 'next';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';

export const metadata: Metadata = {
  title: 'Payment | SAAN',
  description: 'Complete secure payment for your SAAN order.',
};

export default function CheckoutPaymentPage() {
  return <CheckoutPage step="payment" />;
}
