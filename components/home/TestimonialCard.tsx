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
  maroon: 'from-saan-maroon/90 via-saan-maroon/40 to-transparent',
  champagne: 'from-saan-charcoal/85 via-saan-champagne/30 to-transparent',
  gold: 'from-saan-charcoal/90 via-saan-gold/35 to-transparent',
} as const;

type TestimonialCardProps = {
  testimonial: Testimonial;
  className?: string;
};

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <article
      className={cn(
        'relative h-[420px] w-[320px] shrink-0 snap-center overflow-hidden rounded-2xl',
        className
      )}
    >
      <Image
        src={testimonial.image}
        alt={testimonial.name}
        fill
        sizes="320px"
        className="object-cover object-center"
      />
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t',
          accentGradients[testimonial.accent]
        )}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <blockquote className="font-body text-sm leading-relaxed text-saan-bone/95">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <footer className="mt-4 border-t border-saan-bone/20 pt-4">
          <p className="font-display text-base text-saan-bone">{testimonial.name}</p>
          <p className="text-label-caps mt-1 text-saan-bone/70">{testimonial.role}</p>
        </footer>
      </div>
    </article>
  );
}
