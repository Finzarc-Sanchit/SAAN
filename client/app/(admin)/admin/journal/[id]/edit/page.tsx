import { JournalFormPage } from '@/components/admin/journal/JournalFormPage';

type AdminEditJournalRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditJournalRoute({
  params,
}: AdminEditJournalRouteProps) {
  const { id } = await params;
  return <JournalFormPage mode="edit" journalId={id} />;
}
