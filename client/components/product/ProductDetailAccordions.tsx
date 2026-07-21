'use client';

import { Star } from 'lucide-react';
import type { ProductDetail } from '@/lib/product-defaults';
import { ProductAccordion } from '@/components/product/ProductAccordion';
import { cn } from '@/lib/utils';

type ProductDetailAccordionsProps = {
  product: ProductDetail;
};

export function ProductDetailAccordions({ product }: ProductDetailAccordionsProps) {
  return (
    <div className="mt-4 space-y-3">
      <ProductAccordion title="Fabric & Embellishment">
        <div className="space-y-5">
          <div>
            <p className="text-label-caps text-[10px] text-saan-ink/45">Fabric</p>
            <p className="mt-1 font-body text-sm leading-relaxed text-saan-charcoal">
              {product.fabric}
            </p>
          </div>
          <div>
            <p className="text-label-caps text-[10px] text-saan-ink/45">Embellishment</p>
            <p className="mt-1 font-body text-sm leading-relaxed text-saan-charcoal">
              {product.embellishment}
            </p>
          </div>
          <div>
            <p className="text-label-caps text-[10px] text-saan-ink/45">Occasion</p>
            <p className="mt-1 font-body text-sm leading-relaxed text-saan-charcoal">
              {product.occasionDetail}
            </p>
          </div>
        </div>
      </ProductAccordion>

      <ProductAccordion title="Care">
        <ul className="space-y-2.5">
          {product.care.map((item) => (
            <li key={item} className="font-body text-sm leading-relaxed text-saan-ink/70">
              {item}
            </li>
          ))}
        </ul>
      </ProductAccordion>

      <ProductAccordion title="Making">
        <p className="font-body text-sm leading-relaxed text-saan-ink/70">{product.making}</p>
      </ProductAccordion>

      <ProductAccordion title={`Reviews (${product.reviewCount})`}>
        <div className="space-y-5">
          {product.reviews.map((review) => (
            <article key={review.id} className="border-b border-saan-champagne/25 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3 w-3',
                        i < review.rating
                          ? 'fill-saan-rating text-saan-rating'
                          : 'text-ink/30'
                      )}
                      strokeWidth={1.25}
                    />
                  ))}
                </div>
                <span className="font-body text-xs text-saan-ink/45">{review.date}</span>
              </div>
              <p className="mt-2 font-body text-sm font-medium text-saan-charcoal">
                {review.author}
              </p>
              <p className="mt-1 font-body text-sm leading-relaxed text-saan-ink/70">
                {review.text}
              </p>
            </article>
          ))}
        </div>
      </ProductAccordion>
    </div>
  );
}
