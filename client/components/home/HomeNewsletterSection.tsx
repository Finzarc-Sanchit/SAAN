import { Container } from '@/components/ui/Container';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { NEWSLETTER_COPY } from '@/lib/site-content';

export function HomeNewsletterSection() {
  return (
    <section aria-label="Newsletter" className="section-py bg-neutral-100">
      <Container className="max-w-2xl text-center">
        <h2 className="text-h2 text-ink">{NEWSLETTER_COPY.title}</h2>
        <p className="text-body mt-4 text-neutral-700">{NEWSLETTER_COPY.description}</p>
        <NewsletterForm source="home" className="mt-8" />
      </Container>
    </section>
  );
}
