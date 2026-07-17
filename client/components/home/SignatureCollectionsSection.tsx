'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { TextLink } from '@/components/ui/TextLink';
import { HOME_COPY, SIGNATURE_COLLECTIONS } from '@/lib/site-content';

export function SignatureCollectionsSection() {
  const copy = HOME_COPY.signatureCollections;

  return (
    <section aria-labelledby="signature-collections-heading" className="section-py bg-paper">
      <Container>
        <ScrollReveal className="mb-12 md:mb-16">
          <h2 id="signature-collections-heading" className="text-display-l text-ink">
            {copy.title}
          </h2>
          <p className="text-body-l mt-5 max-w-lg text-neutral-700">{copy.subtitle}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-px bg-neutral-300 md:grid-cols-2">
          {SIGNATURE_COLLECTIONS.map((collection, index) => (
            <ScrollReveal key={collection.id} delay={index * 0.08}>
              <Link
                href={collection.href}
                className="group relative block aspect-[4/5] overflow-hidden bg-neutral-100 md:aspect-[3/4]"
              >
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-opacity duration-700 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-midnight/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 lg:p-10">
                  <h3 className="text-h2 text-paper">{collection.title}</h3>
                  <p className="text-body mt-2 max-w-xs text-paper/80">{collection.description}</p>
                  <p className="text-caption mt-3 text-paper/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {collection.tagline}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-10 flex justify-center md:mt-12">
          <TextLink href="/collections">View all collections</TextLink>
        </ScrollReveal>
      </Container>
    </section>
  );
}
