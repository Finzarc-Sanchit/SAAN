import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JournalArticleBody } from '@/components/journal/JournalArticleBody';
import { JournalArticleHeader } from '@/components/journal/JournalArticleHeader';
import { JournalGridSection } from '@/components/journal/JournalSections';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import {
  publicJournalDetailPath,
  publicJournalListPath,
} from '@/lib/api/journal';
import { serverApiRequest } from '@/lib/auth/server-fetch';
import {
  formatJournalDate,
  formatJournalReadingTime,
  mapJournalToCard,
  mergeJournals,
} from '@/lib/journal';
import { buildShareMetadata } from '@/lib/seo';
import { JOURNAL_POSTS, getStaticJournalBySlug } from '@/lib/site-content';
import type { Journal } from '@/lib/types/journal';

type JournalArticlePageProps = {
  params: Promise<{ id: string }>;
};

async function loadPublishedJournal(slug: string): Promise<Journal | null> {
  try {
    return await serverApiRequest<Journal>(publicJournalDetailPath(slug));
  } catch {
    return null;
  }
}

async function loadJournal(slug: string): Promise<Journal | null> {
  const fromApi = await loadPublishedJournal(slug);
  if (fromApi) return fromApi;
  return getStaticJournalBySlug(slug) ?? null;
}

async function loadRelatedJournals(
  current: Journal,
  limit = 4,
): Promise<ReturnType<typeof mapJournalToCard>[]> {
  let apiItems: Journal[] = [];
  try {
    apiItems = await serverApiRequest<Journal[]>(
      publicJournalListPath({ page: 1, limit: 100 }),
    );
  } catch {
    apiItems = [];
  }

  return mergeJournals(apiItems, JOURNAL_POSTS)
    .filter((item) => item.id !== current.id && item.slug !== current.slug)
    .slice(0, limit)
    .map(mapJournalToCard);
}

export async function generateMetadata({
  params,
}: JournalArticlePageProps): Promise<Metadata> {
  const { id: slug } = await params;
  const article = await loadJournal(slug);
  if (!article) return { title: 'Journal — SAAN' };

  return buildShareMetadata({
    title: `${article.title} — SAAN Journal`,
    description: article.excerpt,
    image: article.imageUrl,
    imageAlt: article.imageAlt || article.title,
    path: `/journal/${article.slug}`,
    type: 'article',
  });
}

export default async function JournalArticlePage({ params }: JournalArticlePageProps) {
  const { id: slug } = await params;
  const article = await loadJournal(slug);
  if (!article) notFound();

  const related = await loadRelatedJournals(article);
  const publishedLabel = formatJournalDate(article.publishedAt);
  const readingLabel = formatJournalReadingTime(article.readMinutes);

  return (
    <main className="bg-paper">
      <article>
        <Container className="pb-16 md:pb-24">
          <JournalArticleHeader
            title={article.title}
            imageUrl={article.imageUrl}
            imageAlt={article.imageAlt || article.title}
            publishedLabel={publishedLabel}
            readingLabel={readingLabel}
            category={article.category}
          />

          <ScrollReveal>
            <div className="mx-auto mt-14 max-w-2xl md:mt-20">
              <p className="text-body-l text-neutral-700">{article.excerpt}</p>
              <JournalArticleBody blocks={article.blocks} className="mt-10" />
              <div className="pt-12">
                <CtaButton href="/journal" variant="primary" className="min-w-[12rem]">
                  Back to Journal
                </CtaButton>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </article>

      {related.length > 0 ? (
        <JournalGridSection title="Continue reading" posts={related} />
      ) : null}
    </main>
  );
}
