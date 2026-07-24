import Image from 'next/image';
import { AtelierHeroStatCard } from '@/components/atelier/AtelierHeroStatCard';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { ATELIER_COPY, ATELIER_LANDING_COPY } from '@/lib/site-content';
import { SAANLABEL_COLLECTIONS } from '@/lib/saanlabel-images';

const HERO_MOSAIC = {
  primary: {
    src: SAANLABEL_COLLECTIONS.ethnicWear,
    alt: ATELIER_COPY.founder.image.alt,
  },
  secondary: {
    src: ATELIER_COPY.visit.image.src,
    alt: ATELIER_COPY.visit.image.alt,
  },
  tertiary: {
    src: "/images/atelier-hero-3.webp",
    alt: ATELIER_COPY.classicStatement.portrait.alt,
  },
} as const;

export function AtelierHeroSection() {
  const { hero } = ATELIER_COPY;
  const [statPrimary, statSecondary] = ATELIER_LANDING_COPY.stats;

  return (
    <section
      aria-labelledby="atelier-hero-heading"
      className="overflow-hidden bg-paper pt-10 pb-10 sm:pt-12 sm:pb-14 lg:pt-14 lg:pb-16"
    >
      <Container>
        {/* Centered editorial headline */}
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <h1
            id="atelier-hero-heading"
            className="text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.045em] text-saan-charcoal"
          >
            {hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[clamp(1rem,1.6vw,1.2rem)] leading-[1.65] font-light text-saan-ink/65 sm:mt-8">
            {hero.statement}
          </p>
        </ScrollReveal>

        {/*
          Mosaic mirrors the reference rhythm:
          tall portrait | figure + image | image + figure
          Soft radius kept restrained for SAAN.
        */}
        <div className="mt-14 grid grid-cols-1 gap-3 sm:mt-16 lg:mt-20 lg:grid-cols-3 lg:gap-4 xl:gap-5">
          {/* Left — tall portrait */}
          <ScrollReveal delay={0.06}>
            <div className="relative min-h-[24rem] overflow-hidden rounded-2xl bg-saan-champagne/40 sm:min-h-[28rem] lg:h-full lg:min-h-[34rem] xl:min-h-[38rem]">
              <Image
                src={HERO_MOSAIC.primary.src}
                alt={HERO_MOSAIC.primary.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-[center_20%]"
              />
            </div>
          </ScrollReveal>

          {/* Middle — figure panel + image */}
          <div className="grid grid-rows-[auto_1fr] gap-3 sm:grid-cols-2 sm:grid-rows-1 lg:grid-cols-1 lg:grid-rows-[auto_1fr] lg:gap-4 xl:gap-5">
            <ScrollReveal delay={0.1}>
              <AtelierHeroStatCard
                value={statPrimary.value}
                suffix={statPrimary.suffix}
                label={statPrimary.label}
                tone="midnight"
              />
            </ScrollReveal>

            <ScrollReveal delay={0.14}>
              <div className="relative min-h-[14rem] overflow-hidden rounded-2xl bg-saan-champagne/40 sm:min-h-[14rem] lg:h-full lg:min-h-[18rem]">
                <Image
                  src={HERO_MOSAIC.secondary.src}
                  alt={HERO_MOSAIC.secondary.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center"
                />
              </div>
            </ScrollReveal>
          </div>

          {/* Right — image + figure panel */}
          <div className="grid grid-rows-[1fr_auto] gap-3 sm:grid-cols-2 sm:grid-rows-1 lg:grid-cols-1 lg:grid-rows-[1fr_auto] lg:gap-4 xl:gap-5">
            <ScrollReveal delay={0.16}>
              <div className="relative min-h-[14rem] overflow-hidden rounded-2xl bg-saan-champagne/40 sm:min-h-[14rem] lg:h-full lg:min-h-[18rem]">
                <Image
                  src={HERO_MOSAIC.tertiary.src}
                  alt={HERO_MOSAIC.tertiary.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-[center_25%]"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <AtelierHeroStatCard
                value={statSecondary.value}
                suffix={statSecondary.suffix}
                label={statSecondary.label}
                tone="ink"
              />
            </ScrollReveal>
          </div>
        </div>

        <ScrollReveal delay={0.24}>
          <p className="mt-10 text-center text-[10px] font-semibold tracking-[0.2em] text-saan-ink/40 uppercase sm:mt-12">
            {hero.signature}
          </p>
        </ScrollReveal>
      </Container>
    </section>
  );
}
