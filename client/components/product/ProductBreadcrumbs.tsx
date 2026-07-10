import Link from 'next/link';

type ProductBreadcrumbsProps = {
  productName: string;
  collectionLabel: string;
  collectionId: string;
};

export function ProductBreadcrumbs({
  productName,
  collectionLabel,
  collectionId,
}: ProductBreadcrumbsProps) {
  const collectionHref =
    collectionId === 'shaila' ? '/collections/shells' : `/collections/${collectionId}`;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 font-body text-[10px] uppercase tracking-widest text-saan-ink/45">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/shop" className="transition-colors hover:text-saan-maroon">Shop</Link>
        </li>
        <li aria-hidden className="text-saan-ink/25">/</li>
        <li>
          <Link href={collectionHref} className="transition-colors hover:text-saan-maroon">
            {collectionLabel}
          </Link>
        </li>
        <li aria-hidden className="text-saan-ink/25">/</li>
        <li className="text-saan-ink/60">{productName}</li>
      </ol>
    </nav>
  );
}
