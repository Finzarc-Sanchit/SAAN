import type { Metadata } from 'next';
import { OrderConfirmationPage } from '@/components/checkout/OrderConfirmationPage';

export const metadata: Metadata = {
  title: 'Order confirmation | SAAN',
  description: 'Your SAAN order confirmation.',
};

export default function OrderConfirmationRoutePage() {
  return <OrderConfirmationPage />;
}
