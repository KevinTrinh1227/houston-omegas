import type { Metadata } from 'next';
import { Inter, Cinzel, Metal_Mania } from 'next/font/google';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import AnnouncementPopup from '@/components/AnnouncementPopup';
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
  description: 'Houston Omegas, fraternity chapter in Houston, TX.',
  metadataBase: new URL('https://houstonomegas.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable} ${metalMania.variable} antialiased`}>
        <AnnouncementBanner />
        <AnnouncementPopup />
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
