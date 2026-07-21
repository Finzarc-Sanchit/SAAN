'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { TestimonialCard } from '@/components/home/TestimonialCard';
import { Container } from '@/components/ui/Container';
import { TESTIMONIALS, TESTIMONIALS_COPY } from '@/lib/site-content';
import { cn } from '@/lib/utils';

export function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const copy = TESTIMONIALS_COPY;

  function scrollBy(direction: 'left' | 'right') {
    const track = trackRef.current;
    if (!track) return;
    const amount = direction === 'left' ? -360 : 360;
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="section-py relative z-10 overflow-hidden bg-paper"
    >
      <Container>
        <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="testimonials-heading" className="text-h2 text-ink">
              {copy.title}
              {copy.titleAccent}
            </h2>
            <p className="text-body mt-4 max-w-md text-neutral-700">{copy.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => scrollBy('left')}
              className={cn(
                'flex h-11 w-11 items-center justify-center border border-neutral-300 bg-paper text-ink',
                'transition-colors hover:border-ink'
              )}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => scrollBy('right')}
              className={cn(
                'flex h-11 w-11 items-center justify-center border border-neutral-300 bg-paper text-ink',
                'transition-colors hover:border-ink'
              )}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.25} />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 md:gap-6"
        >
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </Container>
    </section>
  );
}
