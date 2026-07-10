import Link from 'next/link';

export function SaanLogo() {
  return (
    <Link href="/" className="relative inline-block font-display text-2xl tracking-[0.08em] text-saan-charcoal md:text-[1.75rem]">
      <span
        aria-hidden
        className="absolute -top-1 left-[0.62em] h-1 w-1 rounded-full bg-saan-gold md:h-1.5 md:w-1.5"
      />
      SAAN
    </Link>
  );
}
