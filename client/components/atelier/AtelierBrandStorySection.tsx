import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { ATELIER_COPY } from '@/lib/site-content';

export function AtelierBrandStorySection() {
  const { hero, headline, intro, closing, founder } = ATELIER_COPY;

  return (
    <>
      <section
        aria-labelledby="atelier-hero-heading"
        className="relative flex min-h-[72svh] items-end overflow-hidden bg-saan-maroon text-paper"
      >
        <div
          className="pointer-events-none absolute -top-[35%] right-[-20%] aspect-square w-[75vw] rounded-full border border-paper/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-[12%] right-[14%] h-2.5 w-2.5 rounded-full bg-ink"
          aria-hidden
        />
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-end gap-14 lg:grid-cols-12">
            <ScrollReveal className="lg:col-span-8">
              <h1
                id="atelier-hero-heading"
                className="text-[clamp(5rem,15vw,12rem)] leading-[0.76] font-semibold tracking-[-0.075em]"
              >
                {hero.title}
              </h1>
            </ScrollReveal>
            <ScrollReveal className="lg:col-span-4 lg:pb-2" delay={0.12}>
              <blockquote className="max-w-md text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.25] font-light italic">
                “{hero.statement}”
              </blockquote>
              <p className="mt-8 text-[10px] font-semibold tracking-[0.2em] text-paper/55 uppercase sm:text-[11px]">
                {hero.signature}
              </p>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="atelier-brand-story-heading"
        className="section-py bg-paper"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <ScrollReveal className="lg:col-span-4">
              <h2
                id="atelier-brand-story-heading"
                className="text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.92] font-medium tracking-[-0.055em] text-saan-charcoal"
              >
                {headline}
              </h2>
              <span
                className="mt-9 block h-2.5 w-2.5 rounded-full bg-saan-maroon"
                aria-hidden
              />
            </ScrollReveal>

            <ScrollReveal className="lg:col-span-7 lg:col-start-6" delay={0.08}>
              <div className="space-y-7 text-[clamp(1rem,1.6vw,1.2rem)] leading-[1.8] font-light text-saan-ink/75">
                {intro.map((paragraph, index) => (
                  <p
                    key={paragraph.slice(0, 28)}
                    className={
                      index === 0
                        ? 'text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.35] font-normal text-saan-charcoal'
                        : undefined
                    }
                  >
                    {paragraph}
                  </p>
                ))}
                {closing.paragraphs.slice(0, 2).map((paragraph) => (
                  <p key={paragraph.slice(0, 28)}>{paragraph}</p>
                ))}
              </div>
              <blockquote className="mt-12 border-y border-saan-charcoal/15 py-8 text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.3] font-normal text-ink italic">
                {closing.paragraphs[2]}
              </blockquote>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="atelier-founder-heading"
        className="bg-saan-champagne/30 py-16 sm:py-20 lg:py-28"
      >
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
            <ScrollReveal className="lg:col-span-6">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={founder.image.src}
                  alt={founder.image.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-saan-charcoal/25 via-transparent to-transparent"
                  aria-hidden
                />
              </div>
            </ScrollReveal>

            <ScrollReveal className="lg:col-span-5 lg:col-start-8" delay={0.1}>
              <h2
                id="atelier-founder-heading"
                className="text-[clamp(2.75rem,5vw,4.75rem)] leading-[0.98] font-medium tracking-[-0.05em] text-saan-charcoal"
              >
                {founder.title}
              </h2>
              <p className="mt-3 text-[clamp(1.25rem,2vw,1.625rem)] text-ink italic">
                {founder.role}
              </p>
              <div className="mt-8 space-y-5 text-[clamp(1rem,1.4vw,1.125rem)] leading-[1.75] font-light text-saan-ink/70">
                {founder.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 28)}>{paragraph}</p>
                ))}
              </div>
              <blockquote className="mt-10 border-l border-saan-maroon/35 pl-6 text-[clamp(1.35rem,2.5vw,1.75rem)] leading-[1.4] text-saan-charcoal italic">
                “{founder.quote}”
              </blockquote>
            </ScrollReveal>
          </div>
        </Container>
      </section>
    </>
  );
}
