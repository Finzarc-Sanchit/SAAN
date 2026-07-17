'use client';

import { useState } from 'react';
import type { ProductDetail } from '@/lib/product-defaults';
import { ProductAccordion } from '@/components/product/ProductAccordion';

const PRODUCT_DISCLAIMER =
  'The colour of the actual product may vary slightly from the images shown due to different device or monitor screen settings and photography lighting conditions.';

type ProductInfoSection =
  | 'description'
  | 'fit'
  | 'materials'
  | 'disclaimer';

type ProductInfoAccordionsProps = {
  product: ProductDetail;
};

export function ProductInfoAccordions({ product }: ProductInfoAccordionsProps) {
  const [openSection, setOpenSection] = useState<ProductInfoSection | null>(null);

  function toggleSection(section: ProductInfoSection) {
    setOpenSection((current) => (current === section ? null : section));
  }

  return (
    <div className="mt-10 space-y-0 border-t border-neutral-300">
      <ProductAccordion
        title="Description"
        isOpen={openSection === 'description'}
        onToggle={() => toggleSection('description')}
      >
        <div className="space-y-4">
          <p className="text-body leading-relaxed text-neutral-700">{product.description}</p>
          <p className="text-body text-neutral-700">
            <span className="text-body-medium text-ink">Occasion: </span>
            {Array.isArray(product.occasion)
              ? product.occasion.join(', ')
              : product.occasion}
          </p>
        </div>
      </ProductAccordion>

      <ProductAccordion
        title="Comfort & Fit"
        isOpen={openSection === 'fit'}
        onToggle={() => toggleSection('fit')}
      >
        <p className="text-body leading-relaxed text-neutral-700">{product.fitNotes}</p>
      </ProductAccordion>

      <ProductAccordion
        title="Materials & Care"
        isOpen={openSection === 'materials'}
        onToggle={() => toggleSection('materials')}
      >
        <div className="space-y-1">
          <p className="text-body text-ink">{product.fabric}</p>
          <ul>
            {product.care.map((item) => (
              <li key={item} className="text-body text-neutral-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </ProductAccordion>

      <ProductAccordion
        title="Disclaimer"
        isOpen={openSection === 'disclaimer'}
        onToggle={() => toggleSection('disclaimer')}
      >
        <p className="text-body leading-relaxed text-neutral-700">{PRODUCT_DISCLAIMER}</p>
      </ProductAccordion>
    </div>
  );
}
