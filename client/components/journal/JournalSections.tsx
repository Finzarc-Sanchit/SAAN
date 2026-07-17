import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import type { JournalPost } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type JournalArticleCardProps = {
  post: JournalPost;
  className?: string;
};

export function JournalArticleCard({ post, className }: JournalArticleCardProps) {
  return (
    <article className={cn('group', className)}>
      <Link
        href={`/journal/${post.id}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-[1.015] motion-reduce:transition-none"
          />
        </div>
        <div className="mt-5 border-t border-neutral-300 pt-4">
          <p className="text-caption text-neutral-500">
            {post.date}
            <span className="mx-2" aria-hidden>
              /
            </span>
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
  return (
    <section
      aria-labelledby="journal-hero-heading"
      className="border-b border-neutral-300 bg-paper"
    >
      <Container className="grid min-h-[72vh] grid-cols-1 gap-10 py-14 md:grid-cols-12 md:items-center md:gap-12 md:py-20">
        <ScrollReveal className="md:col-span-5">
          <div className="max-w-xl">
            <h1
              id="journal-hero-heading"
              className="font-display text-[clamp(3.5rem,8vw,8rem)] leading-[0.86] tracking-[-0.045em] text-ink"
            >
              {title}
            </h1>
            <p className="text-body-l mt-8 max-w-sm text-neutral-700">{description}</p>
            <div className="mt-10 h-px w-20 bg-ink" aria-hidden />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08} className="md:col-span-7">
          <div className="relative aspect-[4/5] max-h-[72vh] overflow-hidden bg-neutral-100 md:ml-auto md:w-[88%]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover object-center"
            />
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

type JournalFeaturedSectionProps = {
  post: JournalPost;
  ctaLabel: string;
};

export function JournalFeaturedSection({ post, ctaLabel }: JournalFeaturedSectionProps) {
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
                  href={`/journal/${post.id}`}
                  className="transition-opacity duration-300 hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-body-l mt-6 text-neutral-700">{post.excerpt}</p>
              <Link
                href={`/journal/${post.id}`}
                className="text-ui mt-9 inline-flex items-center gap-3 border-b border-ink pb-1 text-ink transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                {ctaLabel}
                <span aria-hidden>→</span>
              </Link>
            </div>

            <Link
              href={`/journal/${post.id}`}
              className="group relative aspect-[16/11] overflow-hidden bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink lg:col-span-8"
            >
              <Image
                src={post.image}
                alt={post.title}
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
  posts: readonly JournalPost[];
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
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 md:gap-x-12">
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
  posts: readonly JournalPost[];
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
              href={`/journal/${lead.id}`}
              className="group grid grid-cols-1 gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink lg:grid-cols-12 lg:gap-14"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 lg:col-span-7 lg:order-2">
                <Image
                  src={lead.image}
                  alt={lead.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-[1.01] motion-reduce:transition-none"
                />
              </div>
              <div className="flex flex-col justify-center lg:col-span-5 lg:order-1">
                <p className="text-caption text-neutral-500">
                  {lead.date}
                  <span className="mx-2" aria-hidden>
                    /
                  </span>
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
  image: { src: string; alt: string };
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
  categories: readonly { id: string; label: string }[];
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
