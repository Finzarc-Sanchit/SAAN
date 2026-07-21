import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import {
  BRAND,
  FOOTER_APPOINTMENT_COPY,
  FOOTER_LINKS,
  NEWSLETTER_COPY,
} from '@/lib/site-content';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-midnight py-16 text-paper/70">
      <Container>
        <div className="mb-16 grid grid-cols-1 gap-10 border-b border-paper/10 pb-16 lg:grid-cols-12 lg:gap-12 lg:items-start">
          <div className="lg:col-span-7">
            <h2 className="text-h2 text-paper">{NEWSLETTER_COPY.title}</h2>
            <p className="text-body mt-4 max-w-xl font-light leading-relaxed">
              {NEWSLETTER_COPY.description}
            </p>
            <NewsletterForm
              variant="dark"
              source="footer"
              className="mt-8 max-w-lg"
            />
          </div>

          <div className="border-t border-paper/10 pt-10 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="text-ui tracking-[0.14em] text-paper/55">Atelier</p>
            <h2 className="text-h3 mt-3 text-paper">{FOOTER_APPOINTMENT_COPY.title}</h2>
            <p className="text-body mt-3 font-light leading-relaxed text-paper/70">
              {FOOTER_APPOINTMENT_COPY.description}
            </p>
            <CtaButton
              href={FOOTER_APPOINTMENT_COPY.href}
              variant="primary"
              tone="light"
              className="mt-6"
            >
              {FOOTER_APPOINTMENT_COPY.ctaLabel}
            </CtaButton>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="relative mb-6 block h-10 w-24">
              <Image
                src={BRAND.logo}
                alt={BRAND.name}
                fill
                className="object-contain object-left"
                sizes="96px"
              />
            </Link>
            <p className="mb-6 text-sm font-light leading-relaxed">{BRAND.description}</p>
            <div className="flex items-center gap-4">
              <a
                href={BRAND.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-paper/70 transition-colors hover:text-paper"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.25} aria-hidden />
              </a>
              <a
                href={BRAND.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-paper/70 transition-colors hover:text-paper"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.25} aria-hidden />
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
          <FooterColumn title="Discover" links={FOOTER_LINKS.discover} />
          <FooterColumn title="Information" links={FOOTER_LINKS.information} />
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-8 text-sm font-light md:flex-row">
          <p>
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <p className="text-paper/50">{BRAND.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h4 className="text-ui mb-6 text-paper">{title}</h4>
      <ul className="space-y-3 text-sm font-light">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-paper">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
