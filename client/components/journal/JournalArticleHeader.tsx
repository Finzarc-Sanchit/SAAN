import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { cn } from '@/lib/utils';

type JournalArticleHeaderProps = {
  title: string;
  imageUrl: string;
  imageAlt: string;
  publishedLabel: string;
  readingLabel: string;
  category: string;
  className?: string;
};

function MetaSeparator() {
  return (
    <span className="mx-2 text-neutral-400" aria-hidden>
      ·
    </span>
  );
}

export function JournalArticleHeader({
  title,
  imageUrl,
  imageAlt,
  publishedLabel,
  readingLabel,
  category,
  className,
}: JournalArticleHeaderProps) {
  const metaParts = [publishedLabel, readingLabel, category].filter(Boolean);

  return (
    <header className={cn('pt-6 md:pt-8', className)}>
      <ScrollReveal className="mx-auto max-w-4xl text-center">
        <h1 className="font-display text-[clamp(2.35rem,5.8vw,4.75rem)] leading-[1.08] tracking-[-0.035em] text-ink text-balance">
          {title}
        </h1>

        {metaParts.length > 0 ? (
          <p className="text-caption mt-6 text-neutral-600 md:mt-7">
            {metaParts.map((part, index) => (
              <span key={`${part}-${index}`}>
                {index > 0 ? <MetaSeparator /> : null}
                <span className={index === 1 ? 'font-normal text-neutral-500' : 'text-ink/80'}>
                  {part}
                </span>
              </span>
            ))}
          </p>
        ) : null}
      </ScrollReveal>

      <ScrollReveal delay={0.08} className="mx-auto mt-10 max-w-5xl md:mt-14">
        <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-neutral-100 md:rounded-xl">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 64rem"
            className="object-cover object-center"
          />
        </div>
      </ScrollReveal>
    </header>
  );
}
