import { Suspense } from 'react';
import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Skeleton } from '@/components/ui/Skeleton';

function ShopCatalogFallback() {
  return (
    <section className="section-py bg-paper">
      <div className="mx-auto max-w-[var(--container-max)] px-5 md:px-8">
        <Skeleton className="h-10 w-48" />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

export const metadata = {
  title: 'Shop — SAAN',
  description: 'Explore the latest luxury couture collections from SAAN.',
};

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Suspense fallback={<ShopCatalogFallback />}>
        <ShopCatalog />
      </Suspense>
    </main>
  );
}
