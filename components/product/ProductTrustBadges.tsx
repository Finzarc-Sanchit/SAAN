import {
  BadgeCheck,
  HandCoins,
  ThumbsUp,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import type { ProductTrustBadge } from '@/lib/product-defaults';

const ICON_MAP: Record<ProductTrustBadge['icon'], LucideIcon> = {
  satisfaction: ThumbsUp,
  cod: HandCoins,
  quality: BadgeCheck,
  shipping: Truck,
};

type ProductTrustBadgesProps = {
  badges: ProductTrustBadge[];
};

export function ProductTrustBadges({ badges }: ProductTrustBadgesProps) {
  return (
    <div className="border-t border-saan-champagne/40 bg-white/40 py-10">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4">
        {badges.map((badge) => {
          const Icon = ICON_MAP[badge.icon];
          return (
            <div
              key={badge.label}
              className="flex flex-col items-center gap-2 border border-saan-champagne/50 bg-saan-bone px-3 py-5 text-center"
            >
              <Icon className="h-6 w-6 text-saan-ink/40" strokeWidth={1.25} />
              <span className="font-body text-[10px] uppercase tracking-widest text-saan-ink/60">
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
