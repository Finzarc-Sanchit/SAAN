import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ATELIER_COPY } from '@/lib/site-content';

export function AtelierMadeToMeasureSection() {
  const { title, description, cta, steps } = ATELIER_COPY.madeToMeasure;

  return (
    <section
      aria-labelledby="atelier-made-to-measure-heading"
      className="section-py bg-white"
    >
      <Container>
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
          <ScrollReveal className="lg:col-span-5 lg:sticky lg:top-32">
            <h2
              id="atelier-made-to-measure-heading"
              className="text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-medium tracking-[-0.045em] text-saan-charcoal"
            >
              {title}
            </h2>
            <p className="mt-7 max-w-lg text-[clamp(1rem,1.5vw,1.125rem)] leading-[1.75] font-light text-saan-ink/75">
              {description}
            </p>
            <div className="mt-9">
              <CtaButton href={cta.href} variant="link">
                {cta.label} →
              </CtaButton>
            </div>
          </ScrollReveal>

          <div className="border-t border-saan-charcoal/15 lg:col-span-7">
            {steps.map((step, index) => (
              <ScrollReveal
                as="article"
                key={step.number}
                delay={index * 0.07}
                className="grid grid-cols-[3.5rem_1fr] gap-5 border-b border-saan-charcoal/15 py-7 sm:grid-cols-[5rem_1fr] sm:py-9"
              >
                <span
                  className="text-[clamp(1.5rem,3vw,2rem)] leading-none font-light text-ink"
                  aria-hidden
                >
                  {step.number}
                </span>
                <div>
                  <h3 className="text-[clamp(1.25rem,2.5vw,1.625rem)] leading-tight font-medium text-saan-charcoal">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed font-light text-saan-ink/65 sm:text-base">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
