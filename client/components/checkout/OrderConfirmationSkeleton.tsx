import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';

function ConfirmationShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-paper">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(11,10,9,0.04), transparent 60%)',
        }}
        aria-hidden
      />
      {children}
    </main>
  );
}

function ConfirmationHeader() {
  return (
    <header className="border-b border-neutral-300">
      <Container className="flex items-center justify-between py-5 md:py-6">
        <Link
          href="/"
          className="text-caption font-medium tracking-[0.28em] text-ink transition-opacity hover:opacity-70"
        >
          SAAN
        </Link>
        <Link
          href="/account/orders"
          className="text-caption uppercase tracking-[0.14em] text-neutral-600 underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          Order history
        </Link>
      </Container>
    </header>
  );
}

export function OrderConfirmationSkeleton() {
  return (
    <ConfirmationShell>
      <ConfirmationHeader />

      <Container className="py-14 md:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl" aria-busy="true" aria-live="polite">
          <div className="flex items-center gap-3">
            <Skeleton className="h-1.5 w-1.5 rounded-full" label="Loading order status" />
            <Skeleton className="h-3 w-20" label="" />
          </div>

          <Skeleton className="mt-5 h-12 w-[min(100%,28rem)] md:h-14" label="" />
          <Skeleton className="mt-5 h-12 w-[min(100%,28rem)] md:h-14" label="" />
          <Skeleton className="mt-5 h-5 w-[min(100%,24rem)]" label="" />
          <Skeleton className="mt-3 h-4 w-48" label="" />

          <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-14 xl:gap-20">
            <div className="space-y-12">
              <section aria-hidden>
                <Skeleton className="h-3 w-16" label="" />
                <div className="mt-5 divide-y divide-neutral-300 border-y border-neutral-300">
                  <div className="flex gap-5 py-6 sm:gap-6">
                    <Skeleton className="h-24 w-20 shrink-0" label="" />
                    <div className="flex min-w-0 flex-1 justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" label="" />
                        <Skeleton className="h-3 w-24" label="" />
                      </div>
                      <Skeleton className="h-4 w-16 shrink-0" label="" />
                    </div>
                  </div>
                </div>
              </section>

              <section aria-hidden>
                <Skeleton className="h-3 w-20" label="" />
                <div className="mt-5 space-y-2">
                  <Skeleton className="h-4 w-40" label="" />
                  <Skeleton className="h-4 w-full max-w-md" label="" />
                  <Skeleton className="h-4 w-full max-w-sm" label="" />
                  <Skeleton className="h-4 w-32" label="" />
                </div>
              </section>
            </div>

            <div className="space-y-8 lg:sticky lg:top-10 lg:self-start">
              <div className="border border-neutral-300 bg-paper/80 p-6 md:p-8" aria-hidden>
                <Skeleton className="h-3 w-20" label="" />
                <div className="mt-6 space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex justify-between gap-6">
                      <Skeleton className="h-4 w-20" label="" />
                      <Skeleton className="h-4 w-24" label="" />
                    </div>
                  ))}
                  <Skeleton className="h-4 w-full" label="" />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col" aria-hidden>
                <Skeleton className="h-12 w-full" label="" />
                <Skeleton className="h-12 w-full" label="" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </ConfirmationShell>
  );
}
