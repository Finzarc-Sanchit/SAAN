import {
  JournalGridSection,
  JournalHeroSection,
} from '@/components/journal/JournalSections';
import { publicJournalListPath } from '@/lib/api/journal';
import { serverApiRequest } from '@/lib/auth/server-fetch';
import {
  filterJournalsByCategory,
  mapJournalToCard,
  mergeJournals,
} from '@/lib/journal';
import {
  JOURNAL_CATEGORIES,
  JOURNAL_COPY,
  JOURNAL_POSTS,
} from '@/lib/site-content';
import type { Journal } from '@/lib/types/journal';

export const metadata = {
  title: 'Journal — SAAN',
  description: JOURNAL_COPY.hero.description,
};

type JournalPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

async function loadPublishedJournals(): Promise<Journal[]> {
  try {
    return await serverApiRequest<Journal[]>(
      publicJournalListPath({ page: 1, limit: 100 }),
    );
  } catch {
    return [];
  }
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = searchParams ? await searchParams : {};
  const category = params.category;
  const activeCategory =
    category && JOURNAL_CATEGORIES.some((item) => item.id === category)
      ? category
      : 'all';

  const apiJournals = await loadPublishedJournals();
  const journals = filterJournalsByCategory(
    mergeJournals(apiJournals, JOURNAL_POSTS),
    activeCategory,
  );
  const posts = journals.map(mapJournalToCard);

  return (
    <main>
      <JournalHeroSection
        title={JOURNAL_COPY.hero.title}
        description={JOURNAL_COPY.hero.description}
        image={JOURNAL_COPY.hero.image}
      />
      {posts.length > 0 && <JournalGridSection posts={posts} />}
    </main>
  );
}
