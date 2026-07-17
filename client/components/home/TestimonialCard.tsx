import Image from 'next/image';
import { cn } from '@/lib/utils';

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  image: string;
  accent: 'maroon' | 'champagne' | 'gold';
};

const accentGradients = {
  maroon: 'from-midnight/90 via-signature/40 to-transparent',
  champagne: 'from-midnight/85 via-neutral-700/40 to-transparent',
  gold: 'from-midnight/90 via-ink/30 to-transparent',
} as const;

type TestimonialCardProps = {
  testimonial: Testimonial;
  className?: string;
};

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <article
      className={cn(
        'relative h-[420px] w-[min(80vw,340px)] shrink-0 snap-center overflow-hidden bg-neutral-100 md:w-[360px]',
        className
      )}
    >
      <Image
        src={testimonial.image}
        alt={testimonial.name}
        fill
        sizes="360px"
        className="object-cover object-center"
      />
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t',
          accentGradients[testimonial.accent]
        )}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <blockquote className="text-body text-paper/95">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <footer className="mt-4 border-t border-paper/20 pt-4">
          <p className="text-h3 text-paper">{testimonial.name}</p>
          <p className="text-ui mt-1 text-paper/70">{testimonial.role}</p>
        </footer>
      </div>
    </article>
  );
}
