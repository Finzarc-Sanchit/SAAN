import Link from 'next/link';
import { cn } from '@/lib/utils';

type CtaButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'link';
  tone?: 'light' | 'dark';
  className?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
};

export function CtaButton({
  children,
  href,
  variant = 'primary',
  tone = 'dark',
  className,
  type = 'button',
  onClick,
  disabled = false,
}: CtaButtonProps) {
  const base =
    'inline-flex items-center justify-center text-label-caps transition-colors duration-300 ease-out';

  const variants = {
    primary: cn(
      'rounded-sm px-8 py-3.5 bg-saan-maroon text-white',
      'hover:bg-saan-gold hover:text-white'
    ),
    secondary: cn(
      'rounded-sm border px-8 py-3.5',
      tone === 'light'
        ? 'border-saan-bone/80 text-saan-bone hover:border-saan-gold hover:text-saan-gold'
        : 'border-saan-gold text-saan-maroon hover:bg-saan-gold hover:text-white'
    ),
    link: cn(
      'border-b pb-1 tracking-[0.1em]',
      tone === 'light'
        ? 'border-saan-bone/60 text-saan-bone hover:border-saan-gold hover:text-saan-gold'
        : 'border-saan-ink text-saan-ink hover:border-saan-maroon hover:text-saan-maroon'
    ),
  };

  const classes = cn(
    base,
    variants[variant],
    disabled && 'pointer-events-none opacity-50',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
