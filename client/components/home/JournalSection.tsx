'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { journalArticleHref, mapJournalToCard } from '@/lib/journal';
import { JOURNAL_POSTS } from '@/lib/site-content';

export function JournalSection() {
  const posts = [
    ...JOURNAL_POSTS.map(mapJournalToCard),
    ...JOURNAL_POSTS.map(mapJournalToCard),
  ];

  return (
    <section
      aria-labelledby="journal-heading"
      className="section-surface-maroon section-py relative z-10 overflow-hidden"
    >
      <Container className="mb-12">
        <ScrollReveal>
          <div className="flex flex-col items-start justify-between gap-4 border-b border-saan-champagne/60 pb-4 md:flex-row md:items-end">
            <div>
              <h2 id="journal-heading" className="font-display text-4xl text-ink">
                The SAAN Journal
              </h2>
              <p className="mt-2 font-light tracking-wide text-saan-ink/60">
                Stories of style, heritage, and modern living.
              </p>
            </div>
            <Link
              href="/journal"
              className="text-label-caps hidden text-ink transition-colors hover:text-ink md:inline-block"
            >
              Read All Stories
            </Link>
          </div>
        </ScrollReveal>
      </Container>

      <div className="marquee-container w-full py-4">
        <div className="journal-track animate-marquee-fast">
          {posts.map((post, index) => (
            <Link
              key={`${post.id}-${index}`}
              href={journalArticleHref(post.slug)}
              className="journal-card group mx-4 cursor-pointer"
            >
              <div className="mb-4 aspect-[4/3] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  width={350}
                  height={263}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="text-label-caps mb-2 text-ink">{post.category}</p>
              <h3 className="font-display text-xl text-saan-ink transition-colors group-hover:text-ink">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
