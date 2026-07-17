import {
  Award,
  Globe,
  Heart,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { ProductWhyLove } from '@/lib/product-defaults';

const ICON_MAP: Record<ProductWhyLove['icon'], LucideIcon> = {
  fabric: Sparkles,
  comfort: Heart,
  silhouette: Globe,
  versatile: Award,
};

type ProductWhyLoveProps = {
  productName: string;
  items: ProductWhyLove[];
};

export function ProductWhyLoveSection({ productName, items }: ProductWhyLoveProps) {
  return (
    <section className="border-t border-saan-champagne/40 bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="font-display text-xl uppercase tracking-wide text-ink md:text-2xl">
          Why You&apos;ll Love This {productName.split(' ').slice(-2).join(' ')}
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <li key={item.text} className="flex items-start gap-3 text-left">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-saan-ink/35" strokeWidth={1.25} />
                <p className="font-body text-sm leading-relaxed text-saan-ink/70">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
