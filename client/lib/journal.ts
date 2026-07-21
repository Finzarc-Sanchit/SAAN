import type { Journal, JournalCategory } from '@/lib/types/journal';

/** Card shape used by storefront journal grids. */
export type StorefrontJournalCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: JournalCategory;
  image: string;
  imageAlt: string;
  date: string;
  readingTime: string;
};

export function formatJournalDate(value: string | null | undefined): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatJournalReadingTime(minutes: number): string {
  const safe = Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 1;
  return `${safe} min read`;
}

export function mapJournalToCard(journal: Journal): StorefrontJournalCard {
  return {
    id: journal.id,
    slug: journal.slug,
    title: journal.title,
    excerpt: journal.excerpt,
    category: journal.category,
    image: journal.imageUrl,
    imageAlt: journal.imageAlt || journal.title,
    date: formatJournalDate(journal.publishedAt),
    readingTime: formatJournalReadingTime(journal.readMinutes),
  };
}

export function journalArticleHref(slug: string): string {
  return `/journal/${slug}`;
}

/**
 * API journals win on slug collision; remaining static posts fill the list.
 * Sorted newest published first.
 */
export function mergeJournals(
  apiJournals: readonly Journal[],
  staticJournals: readonly Journal[],
): Journal[] {
  const bySlug = new Map<string, Journal>();

  for (const journal of apiJournals) {
    bySlug.set(journal.slug, journal);
  }
  for (const journal of staticJournals) {
    if (!bySlug.has(journal.slug)) {
      bySlug.set(journal.slug, journal);
    }
  }

  return [...bySlug.values()].sort((a, b) => {
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bTime - aTime;
  });
}

export function filterJournalsByCategory(
  journals: readonly Journal[],
  category: string | undefined,
): Journal[] {
  if (!category || category === 'all') {
    return [...journals];
  }
  return journals.filter((journal) => journal.category === category);
}
