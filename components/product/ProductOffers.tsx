import type { ProductOffer } from '@/lib/product-defaults';

type ProductOffersProps = {
  offers: ProductOffer[];
};

export function ProductOffers({ offers }: ProductOffersProps) {
  if (offers.length === 0) return null;

  return (
    <div className="mt-8">
      <span className="text-label-caps inline-block bg-saan-charcoal px-2 py-1 text-[10px] text-saan-bone">
        Offers
      </span>
      <div className="mt-3 space-y-2">
        {offers.map((offer) => (
          <div
            key={offer.label}
            className="flex items-center justify-between border border-saan-champagne/50 bg-white/50 px-4 py-3"
          >
            <div>
              <p className="font-display text-sm text-saan-maroon">{offer.label}</p>
              <p className="mt-0.5 font-body text-xs text-saan-ink/60">{offer.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
