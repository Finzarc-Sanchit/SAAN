import { OrderDetailPage } from '@/components/account/OrderDetailPage';

export const metadata = {
  title: 'Order Details — SAAN',
  description: 'View your SAAN order status, pieces, delivery details, and summary.',
};

export default function AccountOrderDetailPage() {
  return <OrderDetailPage />;
}
