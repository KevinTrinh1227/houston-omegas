import type { Metadata } from 'next';
import { Inter, Cinzel, Metal_Mania } from 'next/font/google';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import AnnouncementPopup from '@/components/AnnouncementPopup';
import PageViewTracker from '@/components/PageViewTracker';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
});

const metalMania = Metal_Mania({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-metal-mania',
});

export const metadata: Metadata = {
  title: {
    default: 'Houston Omegas',
    template: '%s | Houston Omegas',
  },
  description: 'Houston Omegas — Asian-interest fraternity in Houston, TX. Brotherhood, service, and tradition since 2004.',
  metadataBase: new URL('https://houstonomegas.com'),
  openGraph: {
    title: 'Houston Omegas',
    description: 'Asian-interest fraternity in Houston, TX. Brotherhood, service, and tradition since 2004.',
    url: 'https://houstonomegas.com',
    siteName: 'Houston Omegas',
    images: [
      {
        url: '/images/og-card.png',
        width: 1200,
        height: 630,
        alt: 'Houston Omegas — Brotherhood, Service, Tradition',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Houston Omegas',
    description: 'Asian-interest fraternity in Houston, TX. Brotherhood, service, and tradition since 2004.',
    images: ['/images/og-card.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable} ${metalMania.variable} antialiased overflow-x-hidden`}>
        <AnnouncementBanner />
        <AnnouncementPopup />
        <PageViewTracker />
        {children}
        {/* Cloudflare Web Analytics */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": ""}'
        />
      </body>
    </html>
  );
}
