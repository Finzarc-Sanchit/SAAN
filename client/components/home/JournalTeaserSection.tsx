import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { JOURNAL_POSTS } from '@/lib/site-content';

export function JournalTeaserSection() {
  const featured = JOURNAL_POSTS[0];

  return (
    <section aria-label="Journal" className="section-py bg-paper">
      <Container>
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-ui text-neutral-500">Journal</p>
            <h2 className="text-h2 mt-2 text-ink">Stories from the atelier</h2>
          </div>
          <CtaButton href="/journal" variant="primary" className="min-w-[12rem]">
            Read Journal
          </CtaButton>
        </div>

        <Link href={`/journal/${featured.id}`} className="group grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
            <Image
              src={featured.image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-opacity duration-500 group-hover:opacity-90"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-ui text-neutral-500">{featured.category}</p>
            <h3 className="text-h3 mt-3 text-ink group-hover:opacity-80">{featured.title}</h3>
          </div>
        </Link>
      </Container>
    </section>
  );
}
