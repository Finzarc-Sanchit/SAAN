'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { TestimonialCard } from '@/components/home/TestimonialCard';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { EditorialSectionHeading } from '@/components/ui/EditorialSectionHeading';
import { TESTIMONIALS, TESTIMONIALS_COPY } from '@/lib/site-content';
import { cn } from '@/lib/utils';

export function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const copy = TESTIMONIALS_COPY;

  function scrollBy(direction: 'left' | 'right') {
    const track = trackRef.current;
    if (!track) return;
    const amount = direction === 'left' ? -340 : 340;
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="section-py relative z-10 overflow-hidden bg-saan-bone"
    >
      <Container>
        <ScrollReveal>
          <div className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
            <EditorialSectionHeading
              id="testimonials-heading"
              eyebrow={copy.eyebrow}
              title={`${copy.title}${copy.titleAccent}`}
              titleAccent={copy.titleAccent}
            />
            <div className="flex flex-col items-start gap-6 lg:pb-2">
              <p className="font-body max-w-md text-base leading-relaxed text-saan-charcoal/80">
                {copy.description}
              </p>
              <CtaButton href={copy.cta.href} variant="primary">
                {copy.cta.label}
              </CtaButton>
            </div>
          </div>
        </ScrollReveal>

        <div className="relative">
          <div
            ref={trackRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
          >
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => scrollBy('left')}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border border-saan-champagne',
                'bg-saan-bone text-saan-charcoal transition-colors',
                'hover:border-saan-maroon hover:bg-saan-maroon hover:text-saan-bone'
              )}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => scrollBy('right')}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border border-saan-champagne',
                'bg-saan-bone text-saan-charcoal transition-colors',
                'hover:border-saan-maroon hover:bg-saan-maroon hover:text-saan-bone'
              )}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
