import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';

import { SAANLABEL_COLLECTIONS } from '@/lib/saanlabel-images';

const CATEGORY_TILES = [
  {
    label: 'Co-ord Sets',
    href: '/shop?category=Co-ords',
    image: SAANLABEL_COLLECTIONS.coordSets,
  },
  {
    label: 'Western Wear',
    href: '/shop?category=Dresses',
    image: SAANLABEL_COLLECTIONS.westernWear,
  },
  {
    label: 'Ethnic Wear',
    href: '/shop?category=Anarkalis',
    image: SAANLABEL_COLLECTIONS.ethnicWear,
  },
] as const;

export function CategoryTilesSection() {
  return (
    <section aria-label="Shop by category" className="section-py bg-paper">
      <Container>
        <h2 className="text-h2 mb-10 text-ink">Shop by Category</h2>
        <div className="grid grid-cols-1 gap-px bg-neutral-300 md:grid-cols-3">
          {CATEGORY_TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group relative flex flex-col bg-paper"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-opacity duration-500 group-hover:opacity-85"
                />
              </div>
              <span className="px-4 py-5 text-ui text-ink">{tile.label}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
