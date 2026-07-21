import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import type { StorefrontJournalCard } from '@/lib/journal';
import { journalArticleHref } from '@/lib/journal';
import { cn } from '@/lib/utils';

type JournalArticleCardProps = {
  post: StorefrontJournalCard;
  className?: string;
};

export function JournalArticleCard({ post, className }: JournalArticleCardProps) {
  return (
    <article className={cn('group', className)}>
      <Link
        href={journalArticleHref(post.slug)}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-[1.015] motion-reduce:transition-none"
          />
        </div>
        <div className="mt-5 border-t border-neutral-300 pt-4">
          <p className="text-caption text-neutral-500">
            {post.date}
            {post.date && post.readingTime ? (
              <span className="mx-2" aria-hidden>
                /
              </span>
            ) : null}
            {post.readingTime}
          </p>
          <h3 className="text-h3 mt-3 text-ink transition-opacity duration-300 group-hover:opacity-65">
            {post.title}
          </h3>
          <p className="text-body mt-3 line-clamp-2 max-w-md text-neutral-700">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}

type JournalHeroSectionProps = {
  title: string;
  description: string;
  image: { src: string; alt: string };
};

export function JournalHeroSection({ title, description, image }: JournalHeroSectionProps) {
  const titleWords = title.trim().split(/\s+/);
  const titleLead = titleWords.slice(0, -1).join(' ');
  const titleFinal = titleWords.at(-1) ?? title;

  return (
    <section
      aria-labelledby="journal-hero-heading"
      className="bg-paper"
    >
      <div className="flex min-h-[min(100svh,58rem)] flex-col lg:min-h-[94vh]">
        <div className="relative min-h-[56vh] flex-[1.2] overflow-hidden bg-neutral-100 sm:min-h-[60vh] lg:min-h-[68vh]">
          <ScrollReveal className="absolute inset-0">
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover object-[center_28%] scale-[1.04] motion-reduce:scale-100"
              />
            </div>
          </ScrollReveal>
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute inset-x-0 -top-20 h-20 bg-gradient-to-t from-paper to-transparent lg:-top-28 lg:h-28"
            aria-hidden
          />

          <Container className="relative -mt-8 pb-16 pt-4 sm:-mt-10 sm:pb-20 lg:-mt-16 lg:pb-24 lg:pt-0">
            <ScrollReveal delay={0.1} className="max-w-3xl">
              <p className="text-caption tracking-[0.22em] text-neutral-500 uppercase">
                Journal
              </p>

              <h1
                id="journal-hero-heading"
                className="mt-7 font-display text-[clamp(3.5rem,10vw,8rem)] leading-[0.86] tracking-[-0.05em] text-ink sm:mt-8 lg:mt-10"
              >
                {titleLead ? (
                  <>
                    <span className="block">{titleLead}</span>
                    <span className="mt-1 block sm:mt-2">{titleFinal}</span>
                  </>
                ) : (
                  title
                )}
              </h1>

              <p className="text-body mt-8 max-w-[38ch] text-neutral-700 sm:mt-10 lg:mt-12">
                {description}
              </p>
            </ScrollReveal>
          </Container>
        </div>
      </div>
    </section>
  );
}

type JournalFeaturedSectionProps = {
  post: StorefrontJournalCard;
  ctaLabel: string;
};

export function JournalFeaturedSection({ post, ctaLabel }: JournalFeaturedSectionProps) {
  const href = journalArticleHref(post.slug);

  return (
    <section aria-labelledby="journal-featured-heading" className="bg-paper py-20 md:py-32">
      <Container>
        <ScrollReveal>
          <article className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-caption text-neutral-500">
                {post.date}
                <span className="mx-2" aria-hidden>
                  /
                </span>
                {post.readingTime}
              </p>
              <h2
                id="journal-featured-heading"
                className="text-display-l mt-5 text-ink"
              >
                <Link
                  href={href}
                  className="transition-opacity duration-300 hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-body-l mt-6 text-neutral-700">{post.excerpt}</p>
              <CtaButton href={href} variant="primary" className="mt-9 min-w-[12rem]">
                {ctaLabel}
              </CtaButton>
            </div>

            <Link
              href={href}
              className="group relative aspect-[16/11] overflow-hidden bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink lg:col-span-8"
            >
              <Image
                src={post.image}
                alt={post.imageAlt || post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover object-center transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-[1.01] motion-reduce:transition-none"
              />
            </Link>
          </article>
        </ScrollReveal>
      </Container>
    </section>
  );
}

type JournalGridSectionProps = {
  posts: readonly StorefrontJournalCard[];
  title?: string;
  id?: string;
};

export function JournalGridSection({
  posts,
  title,
  id = 'journal-grid-heading',
}: JournalGridSectionProps) {
  return (
    <section
      aria-labelledby={title ? id : undefined}
      className="border-y border-neutral-300 bg-neutral-100 py-20 md:py-28"
    >
      <Container>
        {title && (
          <ScrollReveal className="mb-12 md:mb-16">
            <h2 id={id} className="text-display-l text-ink">
              {title}
            </h2>
          </ScrollReveal>
        )}
        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
          {posts.map((post, index) => (
            <ScrollReveal key={post.id} delay={index * 0.05}>
              <JournalArticleCard post={post} />
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

type JournalLatestSectionProps = {
  posts: readonly StorefrontJournalCard[];
  title: string;
};

/** Asymmetric editorial grid — distinct from the standard 3-column layout. */
export function JournalLatestSection({ posts, title }: JournalLatestSectionProps) {
  const [lead, ...rest] = posts;

  return (
    <section aria-labelledby="journal-latest-heading" className="bg-paper py-20 md:py-32">
      <Container>
        <ScrollReveal className="mb-12 flex items-end justify-between border-b border-neutral-300 pb-5 md:mb-16">
          <h2 id="journal-latest-heading" className="text-display-l text-ink">
            {title}
          </h2>
        </ScrollReveal>

        {lead && (
          <ScrollReveal className="mb-14">
            <Link
              href={journalArticleHref(lead.slug)}
              className="group grid grid-cols-1 gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink lg:grid-cols-12 lg:gap-14"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 lg:col-span-7 lg:order-2">
                <Image
                  src={lead.image}
                  alt={lead.imageAlt || lead.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-[1.01] motion-reduce:transition-none"
                />
              </div>
              <div className="flex flex-col justify-center lg:col-span-5 lg:order-1">
                <p className="text-caption text-neutral-500">
                  {lead.date}
                  {lead.date && lead.readingTime ? (
                    <span className="mx-2" aria-hidden>
                      /
                    </span>
                  ) : null}
                  {lead.readingTime}
                </p>
                <h3 className="text-display-l mt-5 text-ink transition-opacity duration-300 group-hover:opacity-70">
                  {lead.title}
                </h3>
                <p className="text-body-l mt-5 text-neutral-700">{lead.excerpt}</p>
              </div>
            </Link>
          </ScrollReveal>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
            {rest.map((post, index) => (
              <ScrollReveal key={post.id} delay={index * 0.05}>
                <JournalArticleCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

type JournalQuoteBreakProps = {
  text: string;
  image: { src: string; alt: string; };
};

export function JournalQuoteBreak({ text, image }: JournalQuoteBreakProps) {
  return (
    <section aria-label="Editorial quote" className="bg-ink">
      <div className="grid min-h-[66vh] grid-cols-1 md:grid-cols-2">
        <div className="relative min-h-[52vh] overflow-hidden bg-neutral-900 md:min-h-[66vh]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center grayscale"
          />
        </div>
        <div className="flex items-center px-6 py-16 md:px-12 lg:px-20">
          <ScrollReveal>
            <blockquote className="max-w-xl">
              <p className="font-display text-h2 leading-snug text-paper md:text-display-l">
                &ldquo;{text}&rdquo;
              </p>
            </blockquote>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

type JournalCategoriesNavProps = {
  categories: readonly { id: string; label: string; }[];
  activeId?: string;
};

export function JournalCategoriesNav({
  categories,
  activeId = 'all',
}: JournalCategoriesNavProps) {
  return (
    <nav
      aria-label="Journal categories"
      className="sticky top-0 z-20 border-b border-neutral-300 bg-paper/95 backdrop-blur-sm"
    >
      <Container>
        <ul className="flex gap-8 overflow-x-auto py-5 scrollbar-hide md:justify-center md:gap-12">
          {categories.map((category) => {
            const isActive = category.id === activeId;
            return (
              <li key={category.id} className="shrink-0">
                <Link
                  href={
                    category.id === 'all'
                      ? '/journal'
                      : `/journal?category=${encodeURIComponent(category.id)}`
                  }
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'text-ui border-b pb-1 transition-colors duration-300',
                    isActive
                      ? 'border-ink text-ink'
                      : 'border-transparent text-neutral-500 hover:text-ink'
                  )}
                >
                  {category.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
