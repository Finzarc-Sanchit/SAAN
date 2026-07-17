import {
  ContactClosingSection,
  ContactFormSection,
  ContactHeroSection,
  ContactInfoSection,
  ContactStudioSection,
  ContactSupportSection,
} from '@/components/contact/ContactSections';
import { CONTACT_COPY } from '@/lib/site-content';

export const metadata = {
  title: 'Contact — SAAN',
  description: CONTACT_COPY.hero.description,
};

export default function ContactPage() {
  return (
    <main>
      <ContactHeroSection />
      <ContactInfoSection />
      <ContactFormSection />
      <ContactStudioSection />
      <ContactSupportSection />
      <ContactClosingSection />
    </main>
  );
}
