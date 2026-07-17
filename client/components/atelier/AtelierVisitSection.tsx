import Image from 'next/image';
import { CalendarDays, MapPin, Phone } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ATELIER_COPY } from '@/lib/site-content';

const VISIT_ICONS = {
  address: MapPin,
  hours: CalendarDays,
  book: Phone,
} as const;

export function AtelierVisitSection() {
  const { title, introduction, image, details, cta } = ATELIER_COPY.visit;

  return (
    <section
      aria-labelledby="atelier-visit-heading"
      className="overflow-hidden bg-paper py-16 sm:py-20 lg:py-28"
    >
      <Container>
        <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-0">
          <ScrollReveal className="lg:col-span-7">
            <div className="relative min-h-[32rem] overflow-hidden sm:min-h-[42rem] lg:h-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-saan-charcoal/35 via-transparent to-transparent"
                aria-hidden
              />
              <p className="absolute right-6 bottom-6 left-6 max-w-md text-[clamp(1.35rem,2.5vw,2rem)] leading-snug text-white italic">
                {introduction}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal
            className="flex bg-white lg:col-span-5 lg:-my-6 lg:items-center"
            delay={0.1}
          >
            <div className="w-full px-6 py-12 sm:px-10 lg:px-12 lg:py-16 xl:px-16">
              <h2
                id="atelier-visit-heading"
                className="max-w-md text-[clamp(2.75rem,5vw,4.75rem)] leading-[0.95] font-medium tracking-[-0.05em] text-saan-charcoal"
              >
                {title}
              </h2>

              <dl className="mt-10 border-t border-saan-charcoal/15">
                {details.map((detail) => {
                  const Icon = VISIT_ICONS[detail.id];

                  return (
                    <div
                      key={detail.id}
                      className="grid grid-cols-[1.5rem_1fr] gap-4 border-b border-saan-charcoal/15 py-6"
                    >
                      <Icon
                        className="mt-0.5 h-4 w-4 text-ink"
                        strokeWidth={1.25}
                        aria-hidden
                      />
                      <div>
                        <dt className="text-[11px] font-semibold tracking-[0.16em] text-saan-charcoal uppercase">
                          {detail.title}
                        </dt>
                        <dd className="mt-3 space-y-1 text-sm leading-relaxed font-light text-saan-ink/65">
                          {detail.lines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </dl>

              <div className="mt-9">
                <CtaButton href={cta.href} variant="primary">
                  {cta.label}
                </CtaButton>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
