'use client';

import { Suspense } from 'react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfoAccordions } from '@/components/product/ProductInfoAccordions';
import { RelatedProducts } from '@/components/product/ProductRecommendations';
import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection';
import { Container } from '@/components/ui/Container';
import type { ProductDetail } from '@/lib/product-defaults';

type ProductDetailViewProps = {
  product: ProductDetail;
};

export function ProductDetailView({ product }: ProductDetailViewProps) {
  return (
    <>
      <section className="bg-paper py-8 md:py-12 lg:py-16">
        <Container>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            <div className="min-w-0 self-start lg:sticky lg:top-24">
              <ProductGallery images={product.images} productName={product.name} />
            </div>
            <div>
              <Suspense fallback={null}>
                <ProductPurchasePanel product={product} />
              </Suspense>
              <ProductInfoAccordions product={product} />
            </div>
          </div>
        </Container>
      </section>

      <ProductReviewsSection product={product} />
      <RelatedProducts product={product} />
    </>
  );
}
