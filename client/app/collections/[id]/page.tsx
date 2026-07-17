import { notFound } from 'next/navigation';
import { CollectionHero } from '@/components/collections/CollectionHero';
import { CollectionProductGrid } from '@/components/collections/CollectionProductGrid';
import { COLLECTIONS, getCollectionById } from '@/lib/site-content';

type CollectionPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ id: collection.id }));
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { id } = await params;
  const collection = getCollectionById(id);
  if (!collection) return { title: 'Collection — SAAN' };
  return {
    title: `${collection.title} — SAAN`,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;
  const collection = getCollectionById(id);

  if (!collection) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-paper">
      <CollectionHero collection={collection} />
      <CollectionProductGrid
        collectionTitle={collection.title}
        collectionSlug={collection.id}
      />
    </main>
  );
}
