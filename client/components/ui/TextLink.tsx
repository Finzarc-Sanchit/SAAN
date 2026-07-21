'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type TextLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
  external?: boolean;
};

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TextLink({
  href,
  children,
  className,
  onNavigate,
  external = false,
}: TextLinkProps) {
  const pathname = usePathname();
  const active = !external && isActive(pathname, href);
  const classes = cn(
    'link-underline text-ui text-ink transition-opacity duration-300 hover:opacity-70',
    active && 'is-active',
    className,
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={classes}
    >
      {children}
    </Link>
  );
}
