import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ATELIER_COPY, getJournalPostById, JOURNAL_POSTS } from '@/lib/site-content';

type JournalArticlePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return JOURNAL_POSTS.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: JournalArticlePageProps) {
  const { id } = await params;
  const post = getJournalPostById(id);
  if (!post) return { title: 'Journal — SAAN' };
  return {
    title: `${post.title} — SAAN Journal`,
    description: post.excerpt,
  };
}

export default async function JournalArticlePage({ params }: JournalArticlePageProps) {
  const { id } = await params;
  const post = getJournalPostById(id);
  if (!post) notFound();

  return (
    <main>
      <article>
        <header className="relative min-h-[60vh] overflow-hidden bg-midnight md:min-h-[70vh]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-midnight/40" aria-hidden />
          <div className="relative z-10 flex min-h-[60vh] flex-col justify-end px-6 pb-16 pt-32 md:min-h-[70vh] md:px-12 md:pb-24 lg:px-16">
            <ScrollReveal className="max-w-3xl">
              <h1 className="text-display-l text-paper">{post.title}</h1>
              <p className="text-caption mt-5 text-paper/70">
                {post.date}
                <span className="mx-2" aria-hidden>
                  ·
                </span>
                {post.readingTime}
              </p>
            </ScrollReveal>
          </div>
        </header>

        <Container className="section-py">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl space-y-6">
              <p className="text-body-l text-neutral-700">{post.excerpt}</p>
              {ATELIER_COPY.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 28)} className="text-body text-neutral-700">
                  {paragraph}
                </p>
              ))}
              <div className="pt-6">
                <CtaButton href="/journal" variant="primary" className="min-w-[12rem]">
                  Back to Journal
                </CtaButton>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </article>

      <section
        aria-label="More stories"
        className="border-t border-neutral-300 section-py bg-neutral-100"
      >
        <Container>
          <h2 className="text-h2 text-ink">Continue reading</h2>
          <ul className="mt-8 space-y-4">
            {JOURNAL_POSTS.filter((item) => item.id !== post.id).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/journal/${item.id}`}
                  className="text-body-l text-ink transition-opacity hover:opacity-70"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </main>
  );
}
