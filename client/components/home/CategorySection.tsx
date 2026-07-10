'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { EditorialSectionHeading } from '@/components/ui/EditorialSectionHeading';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  LUXURY_EASE,
  collectionSlideLeft,
  collectionSlideRight,
} from '@/lib/motion';
import { COLLECTIONS, SECTION_COPY } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type CategorySectionProps = {
  className?: string;
};

type Collection = (typeof COLLECTIONS)[number];

type CollectionCardProps = {
  collection: Collection;
  featured?: boolean;
};

function CollectionCard({ collection, featured = false }: CollectionCardProps) {
  return (
    <Link
      href={collection.href}
      className={cn(
        'group relative block w-full overflow-hidden border border-transparent transition-colors duration-500 hover:border-saan-gold',
        featured ? 'h-[55vh] lg:h-[80vh]' : 'h-[38vh] lg:h-[calc(40vh-0.75rem)]'
      )}
    >
      <Image
        src={collection.image}
        alt={collection.title}
        fill
        sizes={
          featured
            ? '(max-width: 1024px) 100vw, 50vw'
            : '(max-width: 1024px) 50vw, 25vw'
        }
        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-colors duration-500 group-hover:from-black/70" />
      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 lg:p-8">
        <h3
          className={cn(
            'font-display text-white',
            featured ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-lg md:text-xl lg:text-2xl'
          )}
        >
          {collection.title}
        </h3>
        <p className="mt-1 font-body text-sm font-light text-white/80">{collection.description}</p>
        <p className="mt-2 font-body font-light italic text-white/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          {collection.tagline}
        </p>
      </div>
    </Link>
  );
}

type AnimatedCardProps = {
  children: React.ReactNode;
  direction: 'left' | 'right';
  delay?: number;
  className?: string;
};

function AnimatedCard({ children, direction, delay = 0, className }: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = direction === 'left' ? collectionSlideLeft : collectionSlideRight;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={variants}
      transition={{ duration: 0.8, ease: [...LUXURY_EASE], delay }}
    >
      {children}
    </motion.div>
  );
}

export function CategorySection({ className }: CategorySectionProps) {
  const [featured, ...gridCollections] = COLLECTIONS;
  const copy = SECTION_COPY.collections;

  return (
    <section
      aria-labelledby="collections-heading"
      className={cn('section-surface-champagne relative z-10 section-py', className)}
    >
      <Container className="max-w-[1600px]">
        <ScrollReveal ease={LUXURY_EASE} className="mb-12 md:mb-16">
          <EditorialSectionHeading
            id="collections-heading"
            title={`${copy.title}${copy.titleAccent}`}
            titleAccent={copy.titleAccent}
            subtitle={copy.subtitle}
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
          <AnimatedCard direction="left">
            <CollectionCard collection={featured} featured />
          </AnimatedCard>

          <div className="grid grid-cols-2 grid-rows-2 gap-4 lg:gap-6">
            {gridCollections.map((collection, index) => (
              <AnimatedCard
                key={collection.id}
                direction={index % 2 === 0 ? 'right' : 'left'}
                delay={index * 0.1}
              >
                <CollectionCard collection={collection} />
              </AnimatedCard>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
