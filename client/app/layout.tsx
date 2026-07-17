import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import localFont from 'next/font/local';
import { AppChrome } from '@/components/layout/AppChrome';
import { LenisProvider } from '@/components/providers/LenisProvider';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

const generalSans = localFont({
  src: [
    {
      path: '../public/fonts/GeneralSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/GeneralSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/GeneralSans-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/GeneralSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-general-sans',
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
    <html
      lang="en"
      className={`${fraunces.variable} ${generalSans.variable}`}
      suppressHydrationWarning
    >
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
