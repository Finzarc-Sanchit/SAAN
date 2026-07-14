import { ProductFormPage } from '@/components/admin/products/ProductFormPage';

type AdminEditProductRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductRoute({ params }: AdminEditProductRouteProps) {
  const { id } = await params;
  return <ProductFormPage mode="edit" productId={id} />;
}
