import Image from 'next/image';
import type { JournalContentBlock } from '@/lib/types/journal';
import { cn } from '@/lib/utils';

type JournalArticleBodyProps = {
  blocks: readonly JournalContentBlock[];
  className?: string;
};

function ParagraphBlock({ value }: { value: string }) {
  return <p className="text-body text-neutral-700">{value}</p>;
}

function HeadingBlock({ value, level }: { value: string; level: 2 | 3 }) {
  if (level === 3) {
    return <h3 className="text-h3 pt-4 text-ink">{value}</h3>;
  }
  return <h2 className="text-h2 pt-6 text-ink">{value}</h2>;
}

function ImageBlock({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="py-4">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 sm:aspect-[3/2]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 42rem"
          className="object-cover object-center"
        />
      </div>
      {caption ? (
        <figcaption className="text-caption mt-3 text-neutral-500">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

function QuoteBlock({ value }: { value: string }) {
  return (
    <blockquote className="border-l border-ink/30 py-2 pl-6 md:pl-8">
      <p className="font-display text-h3 leading-snug text-ink md:text-h2">&ldquo;{value}&rdquo;</p>
    </blockquote>
  );
}

function renderBlock(block: JournalContentBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      if (!block.value?.trim()) return null;
      return <ParagraphBlock key={`p-${index}`} value={block.value} />;
    case 'heading':
      if (!block.value?.trim()) return null;
      return (
        <HeadingBlock
          key={`h-${index}`}
          value={block.value}
          level={block.level === 3 ? 3 : 2}
        />
      );
    case 'image':
      if (!block.src) return null;
      return (
        <ImageBlock
          key={`img-${index}`}
          src={block.src}
          alt={block.alt?.trim() || 'Journal image'}
          caption={block.caption}
        />
      );
    case 'blockquote':
      if (!block.value?.trim()) return null;
      return <QuoteBlock key={`q-${index}`} value={block.value} />;
    default:
      return null;
  }
}

export function JournalArticleBody({ blocks, className }: JournalArticleBodyProps) {
  if (blocks.length === 0) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
