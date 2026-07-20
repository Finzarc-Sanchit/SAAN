import { OrderHistorySection } from '@/components/account/OrderHistorySection';

export const metadata = {
  title: 'Order History — SAAN',
  description: 'Review your SAAN orders, fulfilment status, and past purchases.',
};

export default function AccountOrdersPage() {
  return <OrderHistorySection />;
}
