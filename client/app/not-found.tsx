import Link from 'next/link';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return (
    <main className="section-py flex min-h-[70vh] items-center pt-28">
      <Container className="max-w-lg text-center">
        <p className="text-label-caps text-saan-ink/45">404</p>
        <h1 className="mt-3 font-display text-3xl text-saan-charcoal md:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 font-body text-sm leading-relaxed text-saan-ink/60">
          The page you are looking for does not exist, or you do not have access to
          view it.
        </p>
        <Link
          href="/"
          className="text-label-caps mt-8 inline-block text-ink underline-offset-4 hover:underline"
        >
          Return home
        </Link>
      </Container>
    </main>
  );
}
