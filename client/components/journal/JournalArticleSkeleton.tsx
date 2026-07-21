import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';

/** Mirrors the individual journal article header layout while content loads. */
export function JournalArticleSkeleton() {
  return (
    <main className="min-h-screen bg-paper" aria-busy="true" aria-live="polite">
      <Container className="pb-20 pt-6 md:pb-28 md:pt-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center">
          <Skeleton
            label="Loading article title"
            className="h-10 w-[min(100%,22rem)] rounded-full md:h-14 md:w-[min(100%,34rem)]"
          />
          <Skeleton className="mt-3 h-10 w-[min(92%,18rem)] rounded-full md:mt-4 md:h-12 md:w-[min(88%,28rem)]" />
          <Skeleton className="mt-3 h-10 w-[min(78%,14rem)] rounded-full md:mt-4 md:h-12 md:w-[min(70%,20rem)]" />

          <Skeleton
            label="Loading article details"
            className="mt-7 h-3 w-56 rounded-full md:mt-8 md:w-72"
          />
        </div>

        <div className="mx-auto mt-10 max-w-5xl md:mt-14">
          <Skeleton
            label="Loading cover image"
            className="aspect-[3/2] w-full rounded-lg md:rounded-xl"
          />
        </div>

        <div className="mx-auto mt-14 max-w-2xl space-y-4 md:mt-20" aria-hidden>
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-5/6 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-2/3 rounded-full" />
        </div>
      </Container>
    </main>
  );
}
