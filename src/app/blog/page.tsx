import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'News and updates from Houston Omegas.',
};

export default function BlogPage() {
  return (
    <div className="relative bg-white text-gray-900 min-h-screen">
      <Navbar variant="light" />

      <section className="pt-28 pb-20 px-6 sm:px-10 max-w-2xl mx-auto text-center min-h-[70vh] flex flex-col items-center justify-center">
        <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-3">Blog</p>
        <h1 className="text-3xl sm:text-4xl text-gray-900 mb-6 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Coming Soon
        </h1>
        <p className="text-gray-500 text-sm mb-10 max-w-sm">
          We&apos;re working on sharing stories, updates, and news from the brotherhood. Stay tuned.
        </p>
        <Link href="/" className="border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg transition-all duration-300">
          Back to Home
        </Link>
      </section>

      <Footer variant="light" />
    </div>
  );
}
