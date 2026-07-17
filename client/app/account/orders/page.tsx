import { OrderHistorySection } from '@/components/account/OrderHistorySection';

export const metadata = {
  title: 'Order History — SAAN',
  description: 'Review your SAAN order history and fulfilment status.',
};

export default function AccountOrdersPage() {
  return <OrderHistorySection />;
}
