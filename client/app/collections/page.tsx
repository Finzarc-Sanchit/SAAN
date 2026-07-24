import { Container } from '@/components/ui/Container';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { CtaButton } from '@/components/ui/CtaButton';
import { COLLECTIONS } from '@/lib/site-content';

export const metadata = {
  title: 'Collections — SAAN',
  description: 'Five lines, one philosophy. Explore SAAN collections.',
};

export default function CollectionsIndexPage() {
  return (
    <main className="min-h-screen bg-paper section-py">
      <Container className="max-w-[1600px]">
        <div className="mb-12 md:mb-16">
          <h1 className="font-display text-4xl text-ink md:text-5xl">
            Our Collections
          </h1>
          <p className="mt-4 font-body text-lg text-saan-ink/70">
            Five lines, one philosophy.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {COLLECTIONS.map((collection) => (
            <div
              key={collection.id}
              className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <CollectionCard collection={collection} />
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <CtaButton href="/shop" variant="primary" className="min-w-[12rem]">
            View All in Shop
          </CtaButton>
        </div>
      </Container>
    </main>
  );
}
