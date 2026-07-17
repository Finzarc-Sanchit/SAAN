import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ContactForm } from '@/components/contact/ContactForm';
import { Container } from '@/components/ui/Container';
import { TextLink } from '@/components/ui/TextLink';
import { CONTACT_COPY } from '@/lib/site-content';

export function ContactHeroSection() {
  const { title, description, image } = CONTACT_COPY.hero;

  return (
    <section aria-labelledby="contact-hero-heading" className="relative">
      <div className="relative min-h-[65vh] overflow-hidden bg-midnight md:min-h-[75vh]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-midnight/40" aria-hidden />
        <div className="relative z-10 flex min-h-[65vh] flex-col justify-end px-6 pb-16 pt-32 md:min-h-[75vh] md:px-12 md:pb-24 lg:px-16">
          <ScrollReveal className="max-w-2xl">
            <h1 id="contact-hero-heading" className="text-display-l text-paper">
              {title}
            </h1>
            <p className="text-body-l mt-6 max-w-lg text-paper/85">{description}</p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export function ContactInfoSection() {
  const { email, phone, hours, address, social } = CONTACT_COPY.info;

  return (
    <section aria-labelledby="contact-info-heading" className="section-py bg-paper">
      <Container>
        <ScrollReveal>
          <h2 id="contact-info-heading" className="sr-only">
            Contact information
          </h2>
          <dl className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            <div>
              <dt className="text-ui text-neutral-500">{email.label}</dt>
              <dd className="text-body-l mt-3 text-ink">
                <a href={email.href} className="transition-opacity hover:opacity-70">
                  {email.value}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-ui text-neutral-500">{phone.label}</dt>
              <dd className="text-body-l mt-3 text-ink">
                <a href={phone.href} className="transition-opacity hover:opacity-70">
                  {phone.value}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-ui text-neutral-500">{hours.label}</dt>
              <dd className="text-body-l mt-3 text-ink">{hours.value}</dd>
              <dd className="text-body mt-1 text-neutral-700">{hours.detail}</dd>
            </div>
            <div>
              <dt className="text-ui text-neutral-500">{address.label}</dt>
              <dd className="text-body-l mt-3 text-ink">
                {address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
              <dd className="text-body mt-1 text-neutral-700">{address.detail}</dd>
            </div>
            <div>
              <dt className="text-ui text-neutral-500">{social.label}</dt>
              <dd className="mt-3">
                <TextLink href={social.href} external>
                  {social.value}
                </TextLink>
              </dd>
            </div>
          </dl>
        </ScrollReveal>
      </Container>
    </section>
  );
}

export function ContactFormSection() {
  const { title, description } = CONTACT_COPY.form;

  return (
    <section aria-labelledby="contact-form-heading" className="section-py bg-neutral-100">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <ScrollReveal className="lg:col-span-4">
            <h2 id="contact-form-heading" className="text-display-l text-ink">
              {title}
            </h2>
            <p className="text-body-l mt-5 max-w-sm text-neutral-700">{description}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="lg:col-span-8">
            <ContactForm />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

export function ContactStudioSection() {
  const { title, body, image } = CONTACT_COPY.studio;

  return (
    <section aria-labelledby="contact-studio-heading" className="section-py bg-paper">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <ScrollReveal className="lg:col-span-5 lg:order-2">
            <div className="max-w-md lg:ml-auto">
              <h2 id="contact-studio-heading" className="text-display-l text-ink">
                {title}
              </h2>
              <p className="text-body-l mt-6 text-neutral-700">{body}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="lg:col-span-7 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 lg:aspect-[5/4]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center"
              />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

export function ContactSupportSection() {
  const { title, items, image } = CONTACT_COPY.support;

  return (
    <section aria-labelledby="contact-support-heading" className="section-py bg-neutral-100">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <ScrollReveal className="lg:col-span-5">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-200">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center"
              />
            </div>
          </ScrollReveal>
          <div className="lg:col-span-7">
            <ScrollReveal className="mb-12 md:mb-16">
              <h2 id="contact-support-heading" className="text-display-l text-ink">
                {title}
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-10 md:gap-12">
              {items.map((item, index) => (
                <ScrollReveal key={item.title} delay={index * 0.06}>
                  <h3 className="text-h3 text-ink">{item.title}</h3>
                  <p className="text-body mt-4 max-w-md text-neutral-700">{item.description}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function ContactClosingSection() {
  const { statement, image } = CONTACT_COPY.closing;

  return (
    <section aria-labelledby="contact-closing-heading" className="relative">
      <div className="relative min-h-[55vh] overflow-hidden bg-midnight md:min-h-[65vh]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-midnight/45" aria-hidden />
        <div className="relative z-10 flex min-h-[55vh] items-end px-6 pb-16 pt-24 md:min-h-[65vh] md:px-12 md:pb-24 lg:px-16">
          <ScrollReveal className="max-w-2xl">
            <h2 id="contact-closing-heading" className="sr-only">
              Closing note
            </h2>
            <p className="text-body-l text-paper/90 md:text-h3">{statement}</p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
