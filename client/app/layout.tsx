import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import localFont from 'next/font/local';
import { AppChrome } from '@/components/layout/AppChrome';
import { LenisProvider } from '@/components/providers/LenisProvider';
import { AppProviders } from '@/components/providers/AppProviders';
import { BRAND } from '@/lib/site-content';
import { getSiteUrl } from '@/lib/site-url';
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

const siteDescription =
  'True presence commands through stillness. Luxury editorial couture by SAAN.';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: siteDescription,
  applicationName: BRAND.name,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: siteDescription,
    images: [
      {
        url: '/images/og-default.png',
        width: 1200,
        height: 630,
        alt: `${BRAND.name} — ${BRAND.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: siteDescription,
    images: ['/images/og-default.png'],
  },
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
