import { notFound } from 'next/navigation';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { enrichShopProduct } from '@/lib/product-defaults';
import { getShopProductById, SHOP_PRODUCTS } from '@/lib/site-content';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return SHOP_PRODUCTS.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getShopProductById(id);
  if (!product) return { title: 'Product — SAAN' };
  return {
    title: `${product.name} — SAAN`,
    description: product.subtitle,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getShopProductById(id);

  if (!product) {
    notFound();
  }

  const detail = enrichShopProduct(product);

  return (
    <main className="min-h-screen bg-saan-bone">
      <ProductDetailView product={detail} />
    </main>
  );
}
