import { CustomerDetailPage } from '@/components/admin/customers/CustomerDetailPage';

type AdminCustomerDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerDetailRoute({
  params,
}: AdminCustomerDetailRouteProps) {
  const { id } = await params;
  return <CustomerDetailPage customerId={id} />;
}
