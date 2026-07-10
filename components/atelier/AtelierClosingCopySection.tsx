import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ATELIER_COPY } from '@/lib/site-content';

export function AtelierClosingCopySection() {
  const { paragraphs, cta } = ATELIER_COPY.closing;

  return (
    <section
      aria-labelledby="atelier-closing-heading"
      className="section-py border-t border-saan-charcoal/10 bg-saan-bone"
    >
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="atelier-closing-heading" className="sr-only">
              Our philosophy
            </h2>
            <div className="space-y-6 text-sm leading-relaxed font-light text-saan-ink/75 sm:text-[15px] sm:leading-relaxed">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-12">
              <CtaButton href={cta.href} variant="secondary">
                {cta.label}
              </CtaButton>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
