import { cn } from '@/lib/utils';

type EditorialSectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  className?: string;
};

export function EditorialSectionHeading({
  id,
  eyebrow,
  title,
  titleAccent,
  subtitle,
  className,
}: EditorialSectionHeadingProps) {
  const titleParts = titleAccent ? title.split(titleAccent) : [title];

  return (
    <div className={cn('max-w-3xl', className)}>
      {eyebrow && (
        <p className="text-label-caps mb-4 text-saan-gold">{eyebrow}</p>
      )}
      <h2
        id={id}
        className="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.02em]"
      >
        {titleAccent && titleParts.length > 1 ? (
          <>
            <span className="text-saan-maroon">{titleParts[0]}</span>
            <span className="text-saan-gold">{titleAccent}</span>
            {titleParts[1] && (
              <span className="text-saan-maroon">{titleParts[1]}</span>
            )}
          </>
        ) : (
          <span className="text-saan-maroon">{title}</span>
        )}
      </h2>
      <div className="mt-5 flex items-center gap-3">
        <span className="h-px w-12 bg-saan-maroon" aria-hidden />
        <span className="h-1 w-1 rounded-full bg-saan-gold" aria-hidden />
        <span className="h-px w-6 bg-saan-gold" aria-hidden />
      </div>
      {subtitle && (
        <p className="mt-5 font-body text-lg font-normal tracking-wide text-saan-charcoal/80">
          {subtitle}
        </p>
      )}
    </div>
  );
}
