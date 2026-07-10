import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ATELIER_COPY, type AtelierPillar } from '@/lib/site-content';

function PillarMeta({ meta }: { meta: AtelierPillar['meta'] }) {
  return (
    <dl className="mt-6 border-t border-saan-charcoal/15">
      {meta.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-4 border-b border-saan-charcoal/15 py-3"
        >
          <dt className="text-[10px] font-semibold tracking-[0.18em] text-saan-ink/50 uppercase sm:text-[11px]">
            {row.label}
          </dt>
          <dd className="text-right text-[11px] font-medium tracking-[0.12em] text-saan-charcoal uppercase sm:text-xs">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PillarCard({ pillar, featured = false }: { pillar: AtelierPillar; featured?: boolean }) {
  return (
    <article className="flex flex-col">
      <Link href={pillar.href} className="group block overflow-hidden">
        <div
          className={
            featured
              ? 'relative aspect-[4/3] w-full lg:aspect-[16/11]'
              : 'relative aspect-[4/3] w-full'
          }
        >
          <Image
            src={pillar.image}
            alt={pillar.title}
            fill
            sizes={
              featured
                ? '(max-width: 1024px) 100vw, 55vw'
                : '(max-width: 1024px) 100vw, 40vw'
            }
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
      </Link>
      <div className="pt-6">
        <h3 className="text-sm font-bold tracking-[0.08em] text-saan-charcoal uppercase sm:text-base">
          {pillar.title}
        </h3>
        <p className="mt-3 max-w-prose text-sm leading-relaxed font-light text-saan-ink/70">
          {pillar.description}
        </p>
        <PillarMeta meta={pillar.meta} />
        <Link
          href={pillar.href}
          className="mt-6 inline-block text-[10px] font-semibold tracking-[0.2em] text-saan-charcoal uppercase underline-offset-4 transition-colors hover:text-saan-maroon hover:underline sm:text-[11px]"
        >
          View Full Collection →
        </Link>
      </div>
    </article>
  );
}

export function AtelierBrandStorySection() {
  const { eyebrow, headline, intro, cta, inViewLabel, pillars } = ATELIER_COPY;
  const featured = pillars.find((p) => p.featured) ?? pillars[0];
  const gridPillars = pillars.filter((p) => !p.featured);

  return (
    <section
      aria-labelledby="atelier-brand-story-heading"
      className="atelier-grid-bg section-py relative overflow-hidden"
    >
      <Container className="max-w-[1600px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <ScrollReveal className="lg:col-span-5 lg:pt-4">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-saan-ink/50 uppercase sm:text-[11px]">
              {eyebrow}
            </p>
            <h1
              id="atelier-brand-story-heading"
              className="mt-6 text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.05] font-bold tracking-tight text-saan-charcoal uppercase"
            >
              {headline}
            </h1>
            <div className="mt-8 space-y-5 text-sm leading-relaxed font-light text-saan-ink/75 sm:text-[15px]">
              {intro.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-10">
              <CtaButton href={cta.href} variant="link">
                {cta.label} →
              </CtaButton>
            </div>
            <p
              aria-hidden
              className="mt-16 text-2xl font-bold tracking-tight text-saan-charcoal sm:mt-20 sm:text-3xl"
            >
              {inViewLabel}
            </p>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-7" delay={0.1}>
            <PillarCard pillar={featured} featured />
          </ScrollReveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-10 lg:mt-24 lg:gap-14">
          {gridPillars.map((pillar, index) => (
            <ScrollReveal key={pillar.id} delay={index * 0.08}>
              <PillarCard pillar={pillar} />
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
