import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { serverApiRequest } from '@/lib/auth/server-fetch';
import { mapApiProductToDetail, type ProductDetail } from '@/lib/product-defaults';
import { buildShareMetadata } from '@/lib/seo';
import type { Product } from '@/lib/types/product';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

async function loadProductDetail(slug: string): Promise<ProductDetail | null> {
  try {
    const apiProduct = await serverApiRequest<Product>(
      `/api/v1/products/${encodeURIComponent(slug)}`,
    );
    return mapApiProductToDetail(apiProduct);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProductDetail(slug);
  if (!product) {
    return { title: 'Product — SAAN' };
  }

  const description =
    product.subtitle?.trim() ||
    product.description?.trim() ||
    `${product.name} by SAAN.`;
  const image = product.image || product.images[0] || null;

  return buildShareMetadata({
    title: `${product.name} — SAAN`,
    description,
    image,
    imageAlt: product.name,
    path: `/shop/${slug}`,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const detail = await loadProductDetail(slug);

  if (!detail) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-paper">
      <ProductDetailView product={detail} />
    </main>
  );
}
