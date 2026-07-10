import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { BRAND, FOOTER_LINKS, NEWSLETTER_COPY } from '@/lib/site-content';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-saan-charcoal py-16 text-saan-bone/70">
      <Container>
        <div className="mb-16 border-b border-white/10 pb-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl text-saan-bone md:text-3xl">
              {NEWSLETTER_COPY.title}
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed">
              {NEWSLETTER_COPY.description}
            </p>
            <NewsletterForm variant="dark" className="mx-auto mt-8 max-w-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <Link href="/" className="relative mb-6 block h-10 w-24">
              <Image
                src={BRAND.logo}
                alt={BRAND.name}
                fill
                className="object-contain brightness-0 invert"
                sizes="96px"
              />
            </Link>
            <p className="mb-6 text-sm font-light leading-relaxed">{BRAND.description}</p>
            <div className="flex gap-4">
              <a
                href={BRAND.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-sm uppercase tracking-wider transition-colors hover:text-saan-bone"
              >
                Instagram
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
          <FooterColumn title="Support" links={FOOTER_LINKS.support} />
          <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm font-light md:flex-row">
          <p>
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <p className="text-saan-bone/50">{BRAND.tagline}</p>
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
      <h4 className="mb-6 text-sm font-medium uppercase tracking-wider text-saan-bone">{title}</h4>
      <ul className="space-y-3 text-sm font-light">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-saan-bone">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
