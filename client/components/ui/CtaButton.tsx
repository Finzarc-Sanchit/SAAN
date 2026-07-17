import Link from 'next/link';
import { cn } from '@/lib/utils';

type CtaButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'link';
  tone?: 'light' | 'dark';
  className?: string;
  type?: 'button' | 'submit';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
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
  const base = 'inline-flex cursor-pointer items-center justify-center text-ui transition-colors duration-300 ease-out disabled:cursor-not-allowed';

  const variants = {
    primary: cn(
      tone === 'light' ? 'btn-primary-fill-light' : 'btn-primary-fill',
      'px-4 py-2 text-[0.6875rem] tracking-[0.1em] md:px-8 md:py-3.5 md:text-ui',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
    ),
    secondary: cn(
      'border px-4 py-2 text-[0.6875rem] tracking-[0.1em] md:px-8 md:py-3.5 md:text-ui',
      tone === 'light'
        ? 'border-white/80 text-white hover:border-ink hover:text-ink'
        : 'border-neutral-700 text-ink hover:border-ink'
    ),
    link: cn(
      'link-underline pb-0.5',
      tone === 'light' ? 'text-white' : 'text-ink'
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
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      <span>{children}</span>
    </button>
  );
}
