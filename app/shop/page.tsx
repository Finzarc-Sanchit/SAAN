import { ShopHeroScrollContainer } from '@/components/shop/ShopHeroScrollContainer';
import { ShopCatalog } from '@/components/shop/ShopCatalog';

export const metadata = {
  title: 'Shop — SAAN',
  description: 'Explore the latest luxury couture collections from SAAN.',
};

export default function ShopPage() {
  return (
    <main className="relative min-h-screen bg-saan-bone">
      {/* Sticky Hero Section */}
      <ShopHeroScrollContainer />

      {/* Scroll-over Catalog Section */}
      <div className="-mt-[30vh] md:-mt-[45vh] relative z-10 bg-saan-bone">
        <ShopCatalog />
      </div>
    </main>
  );
}
