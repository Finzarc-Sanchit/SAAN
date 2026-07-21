import type { Metadata } from 'next';
import { BRAND } from '@/lib/site-content';
import { toAbsoluteUrl } from '@/lib/site-url';

const DEFAULT_OG_IMAGE = '/images/og-default.png';

type ShareMetadataInput = {
  title: string;
  description: string;
  /** Path or absolute URL — product/journal images preferred when sharing. */
  image?: string | null;
  imageAlt?: string;
  path?: string;
  type?: 'website' | 'article';
};

/**
 * Builds title/description plus Open Graph + Twitter share cards.
 * Pass `image` for product (or editorial) previews; falls back to brand OG art.
 */
export function buildShareMetadata({
  title,
  description,
  image,
  imageAlt,
  path,
  type = 'website',
}: ShareMetadataInput): Metadata {
  const ogImage = toAbsoluteUrl(image?.trim() || DEFAULT_OG_IMAGE);
  const alt = imageAlt?.trim() || title;

  return {
    title,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: {
      title,
      description,
      type,
      siteName: BRAND.name,
      url: path ? toAbsoluteUrl(path) : undefined,
      images: [
        {
          url: ogImage,
          alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
