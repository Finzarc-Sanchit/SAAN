import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import type { Collection } from '@/lib/site-content';

type CollectionHeroProps = {
  collection: Collection;
};

export function CollectionHero({ collection }: CollectionHeroProps) {
  return (
    <section className="relative min-h-[50vh] lg:min-h-[65vh]">
      <Image
        src={collection.image}
        alt={collection.title}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      <Container className="relative flex min-h-[50vh] lg:min-h-[65vh] max-w-[1600px] items-end pb-12 md:pb-16">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl text-white md:text-5xl lg:text-6xl">
            {collection.title}
          </h1>
          <p className="mt-3 font-body text-lg font-light text-white/85">
            {collection.description}
          </p>
          <p className="mt-2 font-body text-sm font-light italic text-white/70">
            {collection.tagline}
          </p>
        </div>
      </Container>
    </section>
  );
}
