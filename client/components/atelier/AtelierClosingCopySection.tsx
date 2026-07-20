import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ATELIER_COPY } from '@/lib/site-content';

export function AtelierClosingCopySection() {
  const { title, introduction, email, roles } = ATELIER_COPY.careers;

  return (
    <section
      aria-labelledby="atelier-careers-heading"
      className="section-py bg-saan-charcoal text-paper"
    >
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <ScrollReveal className="lg:col-span-5">
            <h2
              id="atelier-careers-heading"
              className="text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-medium tracking-[-0.045em] text-paper"
            >
              {title}
            </h2>
            <p className="mt-6 max-w-sm text-[clamp(1.25rem,2.5vw,1.625rem)] leading-snug text-paper/75 italic">
              “{introduction}”
            </p>
          </ScrollReveal>

          <div className="space-y-4 lg:col-span-7">
            {roles.map((role, index) => (
              <ScrollReveal
                as="article"
                key={role.title}
                delay={index * 0.08}
                className="border border-paper/15 p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h3 className="text-[clamp(1.25rem,2.5vw,1.625rem)] leading-tight font-medium text-paper">
                    {role.title}
                  </h3>
                  <span className="border border-ink/50 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-ink uppercase">
                    {role.status}
                  </span>
                </div>

                {role.description && (
                  <p className="mt-5 max-w-2xl text-sm leading-[1.75] font-light text-paper/70 sm:text-base">
                    {role.description}
                  </p>
                )}

                {role.responsibilities.length > 0 && (
                  <ul className="mt-5 space-y-2 text-sm font-light text-paper/65">
                    {role.responsibilities.map((responsibility) => (
                      <li key={responsibility} className="flex gap-3">
                        <span className="text-ink" aria-hidden>
                          ·
                        </span>
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {role.status === 'Open' && (
                  <div className="mt-7">
                    <CtaButton
                      href={`mailto:${email}?subject=${encodeURIComponent(`Application — ${role.title}`)}`}
                      variant="primary"
                      tone="light"
                      className="min-w-[12rem]"
                    >
                      Apply via email
                    </CtaButton>
                  </div>
                )}
              </ScrollReveal>
            ))}
            <p className="pt-2 text-xs tracking-[0.08em] text-paper/50 uppercase">
              {email}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
