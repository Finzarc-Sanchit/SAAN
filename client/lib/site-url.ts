/**
 * Absolute site origin for Open Graph, canonical URLs, and metadataBase.
 * Prefer NEXT_PUBLIC_SITE_URL in production (e.g. https://saanlabel.com).
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${host}`;
  }

  return 'http://localhost:3000';
}

/** Resolve a path or absolute URL to an absolute URL for social previews. */
export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${path}`;
}
