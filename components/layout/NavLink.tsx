'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavLinkProps = {
  href: string;
  label: string;
  onNavigate?: () => void;
};

function isActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({ href, label, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-xs uppercase tracking-[0.2em] text-saan-ink transition-opacity duration-300 hover:opacity-60',
        active && 'border-b border-saan-charcoal pb-0.5'
      )}
    >
      {label}
    </Link>
  );
}
