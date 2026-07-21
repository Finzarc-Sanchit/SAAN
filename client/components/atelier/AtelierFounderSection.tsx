import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { ATELIER_COPY } from '@/lib/site-content';

export function AtelierFounderSection() {
  const { founder } = ATELIER_COPY;
  const [founderLead, ...founderRest] = founder.body;

  return (
    <section
      aria-labelledby="atelier-founder-heading"
      className="overflow-hidden bg-saan-champagne/25 py-20 sm:py-24 lg:py-28"
    >
      <Container>
        <div className="mx-auto flex w-full max-w-[58rem] flex-col gap-10 sm:gap-12 lg:flex-row lg:items-start lg:justify-center lg:gap-8 xl:max-w-[64rem] xl:gap-10">
          <ScrollReveal className="mx-auto w-[22rem] shrink-0 sm:w-[25rem] lg:mx-0 lg:mt-14 lg:w-[28rem] xl:mt-16">
            <figure>
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-saan-champagne/30">
                <Image
                  src={founder.image.src}
                  alt={founder.image.alt}
                  fill
                  sizes="(max-width: 640px) 22rem, (max-width: 1023px) 25rem, 28rem"
                  className="object-cover object-[center_18%]"
                />
              </div>
            </figure>
          </ScrollReveal>

          <div className="flex min-w-0 flex-1 flex-col gap-8 sm:gap-9 lg:max-w-[34rem] lg:gap-8">
            <div>
              <ScrollReveal delay={0.1}>
                <h2
                  id="atelier-founder-heading"
                  className="max-w-[10ch] text-[clamp(2.85rem,7.5vw,5.5rem)] leading-[0.88] font-medium tracking-[-0.055em] text-saan-charcoal"
                >
                  {founder.title}
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.16}>
                <p className="mt-4 max-w-[24ch] text-[clamp(1.15rem,1.9vw,1.45rem)] leading-snug text-ink italic sm:mt-5">
                  {founder.role}
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.22}>
              <p className="max-w-[38ch] text-[clamp(1.25rem,2.2vw,1.65rem)] leading-[1.42] font-normal tracking-[-0.012em] text-saan-charcoal">
                {founderLead}
              </p>
            </ScrollReveal>

            {founderRest.length > 0 ? (
              <ScrollReveal delay={0.28}>
                <div className="max-w-[40ch] space-y-6 text-[clamp(1rem,1.35vw,1.1rem)] leading-[1.88] font-light text-saan-ink/70 sm:space-y-7">
                  {founderRest.map((paragraph) => (
                    <p key={paragraph.slice(0, 28)}>{paragraph}</p>
                  ))}
                </div>
              </ScrollReveal>
            ) : null}

            <ScrollReveal delay={0.34}>
              <figure className="relative max-w-[40ch]">
                <span
                  className="pointer-events-none absolute -top-8 left-0 select-none text-[clamp(4rem,10vw,6.5rem)] leading-none font-light text-ink/[0.05] sm:-top-10"
                  aria-hidden
                >
                  “
                </span>
                <blockquote className="relative pt-3 text-[clamp(1.15rem,2.2vw,1.65rem)] leading-[1.45] font-normal tracking-[-0.015em] text-saan-charcoal italic sm:pt-4">
                  {founder.quote}
                </blockquote>
                <figcaption className="mt-8 sm:mt-10" aria-hidden>
                  <span className="block h-px w-20 bg-saan-charcoal/15" />
                </figcaption>
              </figure>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
