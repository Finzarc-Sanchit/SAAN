'use client';

import { motion } from 'framer-motion';
import { ProductBreadcrumbs } from '@/components/product/ProductBreadcrumbs';
import { ProductAccordion } from '@/components/product/ProductAccordion';
import { ProductDetailAccordions } from '@/components/product/ProductDetailAccordions';
import { ProductFeaturesList } from '@/components/product/ProductFeaturesList';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductOffers } from '@/components/product/ProductOffers';
import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { Container } from '@/components/ui/Container';
import { LUXURY_EASE } from '@/lib/motion';
import type { ProductDetail } from '@/lib/product-defaults';
import { getDiscountPercent } from '@/lib/site-content';

type ProductDetailViewProps = {
  product: ProductDetail;
};

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const discount = getDiscountPercent(product.price, product.mrp);

  return (
    <section className="bg-saan-bone py-8 md:py-12 lg:py-14">
      <Container className="max-w-[1200px]">
        <ProductBreadcrumbs
          productName={product.name}
          collectionLabel={product.collectionLabel}
          collectionId={product.collection}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10 xl:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: LUXURY_EASE }}
            className="lg:max-w-[420px]"
          >
            <ProductGallery
              images={product.images}
              productName={product.name}
              discountPercent={discount}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: LUXURY_EASE, delay: 0.1 }}
          >
            <ProductPurchasePanel product={product} />

            <ProductFeaturesList features={product.features} />
            <ProductOffers offers={product.offers} />

            <ProductAccordion title="Description" defaultOpen={false} className="mt-6">
              <p className="font-body text-sm leading-relaxed text-saan-ink/70">
                {product.description}
              </p>
            </ProductAccordion>

            <ProductDetailAccordions product={product} />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
