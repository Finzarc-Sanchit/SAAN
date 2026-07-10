import {
  Camera,
  Circle,
  RefreshCw,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import type { ProductFeature } from '@/lib/product-defaults';

const ICON_MAP: Record<ProductFeature['icon'], LucideIcon> = {
  shipping: Truck,
  exchange: RefreshCw,
  camera: Camera,
  comfort: Circle,
};

type ProductFeaturesListProps = {
  features: ProductFeature[];
};

export function ProductFeaturesList({ features }: ProductFeaturesListProps) {
  return (
    <ul className="mt-8 divide-y divide-saan-champagne/50 border-t border-saan-champagne/50">
      {features.map((feature) => {
        const Icon = ICON_MAP[feature.icon];
        return (
          <li key={feature.title} className="flex gap-4 py-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-saan-ink/40" strokeWidth={1.25} />
            <div>
              <p className="text-label-caps text-[10px] text-saan-charcoal">{feature.title}</p>
              <p className="mt-1 font-body text-xs leading-relaxed text-saan-ink/60">
                {feature.description}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
