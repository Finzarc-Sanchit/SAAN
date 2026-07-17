import {
  JournalCategoriesNav,
  JournalFeaturedSection,
  JournalGridSection,
  JournalHeroSection,
  JournalLatestSection,
  JournalQuoteBreak,
} from '@/components/journal/JournalSections';
import {
  JOURNAL_CATEGORIES,
  JOURNAL_COPY,
  JOURNAL_POSTS,
} from '@/lib/site-content';

export const metadata = {
  title: 'Journal — SAAN',
  description: JOURNAL_COPY.hero.description,
};

type JournalPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = searchParams ? await searchParams : {};
  const category = params.category;
  const activeCategory =
    category && JOURNAL_CATEGORIES.some((item) => item.id === category)
      ? category
      : 'all';

  const filteredPosts =
    activeCategory === 'all'
      ? JOURNAL_POSTS
      : JOURNAL_POSTS.filter((post) => post.category === activeCategory);

  const featured = filteredPosts[0] ?? JOURNAL_POSTS[0];
  const remaining = filteredPosts.filter((post) => post.id !== featured.id);
  const splitAt = Math.ceil(remaining.length / 2);
  const beforeQuote = remaining.slice(0, splitAt);
  const afterQuote = remaining.slice(splitAt);

  return (
    <main>
      <JournalHeroSection
        title={JOURNAL_COPY.hero.title}
        description={JOURNAL_COPY.hero.description}
        image={JOURNAL_COPY.hero.image}
      />
      <JournalCategoriesNav categories={JOURNAL_CATEGORIES} activeId={activeCategory} />
      <JournalFeaturedSection post={featured} ctaLabel={JOURNAL_COPY.featured.ctaLabel} />
      {beforeQuote.length > 0 && <JournalGridSection posts={beforeQuote} />}
      <JournalQuoteBreak text={JOURNAL_COPY.quote.text} image={JOURNAL_COPY.quote.image} />
      {afterQuote.length > 0 && (
        <JournalLatestSection
          posts={afterQuote}
          title={JOURNAL_COPY.latest.title}
        />
      )}
    </main>
  );
}
