import Image from 'next/image';
import Link from 'next/link';
import type { Collection } from '@/lib/site-content';

type CollectionCardProps = {
  collection: Collection;
};

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={collection.href}
      className="group relative block aspect-[4/5] overflow-hidden border border-transparent transition-colors duration-500 hover:border-saan-gold"
    >
      <Image
        src={collection.image}
        alt={collection.title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <h2 className="font-display text-2xl text-white">{collection.title}</h2>
        <p className="mt-1 font-body text-sm font-light text-white/80">{collection.description}</p>
      </div>
    </Link>
  );
}
