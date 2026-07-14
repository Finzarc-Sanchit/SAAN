import { OrderDetailPage } from '@/components/admin/orders/OrderDetailPage';

type AdminOrderDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailRoute({ params }: AdminOrderDetailRouteProps) {
  const { id } = await params;
  return <OrderDetailPage orderId={id} />;
}
