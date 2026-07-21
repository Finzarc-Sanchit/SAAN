import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { ATELIER_COPY } from '@/lib/site-content';

const STORY_IMAGES = {
  left: {
    src: "/images/brand-story-1.webp",
    alt: ATELIER_COPY.visit.image.alt,
  },
  right: {
    src: ATELIER_COPY.classicStatement.portrait.src,
    alt: ATELIER_COPY.classicStatement.portrait.alt,
  },
} as const;

export function AtelierBrandStorySection() {
  const { headline, intro, closing } = ATELIER_COPY;
  const [opening, ...bodyIntro] = intro;
  const [closingLead, closingClose, pullQuote] = closing.paragraphs;

  return (
    <section
      aria-labelledby="atelier-brand-story-heading"
      className="bg-paper pb-24 pt-14 sm:pb-32 sm:pt-18 lg:pb-40 lg:pt-20"
    >
      <Container>
        {/*
          Desktop: narrow | wide | narrow (side columns equal).
          Brand Story title lives in the left column with its image.
        */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,0.8fr)] lg:items-stretch lg:gap-8">
          {/* Left — title + centered image */}
          <aside className="order-2 lg:order-1">
            <ScrollReveal>
              <h2
                id="atelier-brand-story-heading"
                className="max-w-[8ch] text-[clamp(3rem,6.5vw,5.75rem)] leading-[0.9] font-medium tracking-[-0.055em] text-saan-charcoal"
              >
                {headline}
              </h2>
            </ScrollReveal>

            <ScrollReveal className="mt-12 sm:mt-14 lg:mt-16" delay={0.1}>
              <div className="relative mx-auto aspect-[3/4] w-[min(100%,17rem)] overflow-hidden bg-saan-champagne/40 sm:w-[min(100%,19rem)] lg:w-[21rem]">
                <Image
                  src={STORY_IMAGES.left.src}
                  alt={STORY_IMAGES.left.alt}
                  fill
                  sizes="(max-width: 1023px) 19rem, 21rem"
                  className="object-cover object-center"
                />
              </div>
            </ScrollReveal>
          </aside>

          {/* Middle — reading column (wider) */}
          <div className="order-1 lg:order-2">
            <ScrollReveal delay={0.08}>
              <p className="max-w-[22ch] text-[clamp(1.65rem,3.2vw,2.5rem)] leading-[1.28] font-normal tracking-[-0.02em] text-saan-charcoal sm:max-w-[28ch]">
                {opening}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.12}>
              <div className="mt-16 space-y-10 text-[clamp(1rem,1.45vw,1.125rem)] leading-[1.85] font-light text-saan-ink/70 sm:mt-20 sm:space-y-12">
                {bodyIntro.map((paragraph) => (
                  <p key={paragraph.slice(0, 28)}>{paragraph}</p>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.14}>
              <div className="mt-14 space-y-8 text-[clamp(1rem,1.45vw,1.125rem)] leading-[1.85] font-light text-saan-ink/70 sm:mt-16">
                <p>{closingLead}</p>
                <p>{closingClose}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.16}>
              <figure className="relative mt-20 sm:mt-28 lg:mt-32">
                <span
                  className="pointer-events-none absolute -top-10 left-0 select-none text-[clamp(6rem,14vw,11rem)] leading-none font-light text-saan-charcoal/[0.06] sm:-top-14"
                  aria-hidden
                >
                  “
                </span>
                <blockquote className="relative pt-4 text-[clamp(1.75rem,3.8vw,3rem)] leading-[1.22] font-normal tracking-[-0.025em] text-saan-charcoal italic sm:pt-6">
                  {pullQuote}
                </blockquote>
                <figcaption className="mt-10">
                  <span
                    className="block h-px w-16 bg-saan-charcoal/15"
                    aria-hidden
                  />
                </figcaption>
              </figure>
            </ScrollReveal>
          </div>

          {/* Right — bottom-aligned image, slightly above section base */}
          <div className="order-3 lg:flex lg:flex-col lg:justify-end lg:pb-10">
            <ScrollReveal className="mt-12 lg:mt-0" delay={0.18}>
              <div className="relative mx-auto aspect-[3/4] w-[min(100%,17rem)] overflow-hidden bg-saan-champagne/40 sm:w-[min(100%,19rem)] lg:w-[21rem]">
                <Image
                  src={STORY_IMAGES.right.src}
                  alt={STORY_IMAGES.right.alt}
                  fill
                  sizes="(max-width: 1023px) 19rem, 21rem"
                  className="object-cover object-[center_20%]"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
