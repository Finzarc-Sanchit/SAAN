import { CollectionFormPage } from '@/components/admin/collections/CollectionFormPage';

type AdminEditCollectionRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditCollectionRoute({
  params,
}: AdminEditCollectionRouteProps) {
  const { id } = await params;
  return <CollectionFormPage mode="edit" collectionId={id} />;
}
