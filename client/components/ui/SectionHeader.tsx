import { cn } from '@/lib/utils';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
  align?: 'left' | 'center';
};

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  className,
  align = 'left',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-12',
        align === 'center' && 'text-center',
        className
      )}
    >
      {eyebrow && (
        <p className="text-label-caps mb-3 text-ink">{eyebrow}</p>
      )}
      <h2 className="text-display-lg text-ink">{title}</h2>
      <div
        className={cn(
          'mt-4 h-px w-16 bg-ink',
          align === 'center' && 'mx-auto'
        )}
      />
      {subtitle && (
        <p className="mt-4 max-w-xl font-light leading-relaxed text-saan-ink/70">
          {subtitle}
        </p>
      )}
    </div>
  );
}
