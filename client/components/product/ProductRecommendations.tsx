import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/ui/ProductCard';
import { getProductHref } from '@/lib/product-url';
import { SHOP_PRODUCTS, type ShopProduct } from '@/lib/site-content';

type RelatedProductsProps = {
  product: ShopProduct;
};

const RELATED_PRODUCT_LIMIT = 4;

function getRelatedProducts(product: ShopProduct): ShopProduct[] {
  return SHOP_PRODUCTS.filter((item) => item.id !== product.id)
    .map((item, index) => ({
      item,
      index,
      relevance:
        (item.collection === product.collection ? 4 : 0) +
        (item.category === product.category ? 2 : 0) +
        (item.occasion.some((value) => product.occasion.includes(value)) ? 1 : 0),
    }))
    .sort((a, b) => b.relevance - a.relevance || a.index - b.index)
    .slice(0, RELATED_PRODUCT_LIMIT)
    .map(({ item }) => item);
}

export function RelatedProducts({ product }: RelatedProductsProps) {
  const related = getRelatedProducts(product);

  if (related.length === 0) return null;

  return (
    <section aria-label="Related products" className="section-py bg-neutral-100">
      <Container>
        <h2 className="text-h2 text-ink">You May Also Like</h2>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-8 md:gap-y-14">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} href={getProductHref(item)} />
          ))}
        </div>
      </Container>
    </section>
  );
}
