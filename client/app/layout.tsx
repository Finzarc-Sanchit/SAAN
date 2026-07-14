import type { Metadata } from 'next';
import { Karla, Playfair_Display } from 'next/font/google';
import { AppChrome } from '@/components/layout/AppChrome';
import { LenisProvider } from '@/components/providers/LenisProvider';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const karla = Karla({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-karla',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SAAN — Atmospheric Couture',
  description:
    'True presence commands through stillness. Luxury editorial couture by SAAN.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${karla.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/videos/hero-desert-fort.mp4"
          as="video"
          type="video/mp4"
        />
      </head>
      <body suppressHydrationWarning>
        <LenisProvider>
          <AppProviders>
            <AppChrome>{children}</AppChrome>
          </AppProviders>
        </LenisProvider>
      </body>
    </html>
  );
}
