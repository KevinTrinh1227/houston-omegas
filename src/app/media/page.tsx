'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';

const galleryImages = [
  { src: '/images/gallery-5.jpg', alt: 'Brotherhood', category: 'brotherhood' },
  { src: '/images/gallery-7.jpg', alt: 'Photoshoot', category: 'photoshoot' },
  { src: '/images/gallery-3.jpg', alt: 'Beach Cleanup', category: 'service' },
  { src: '/images/gallery-4.jpg', alt: 'Night Event', category: 'events' },
  { src: '/images/gallery-6.jpg', alt: 'Korean Festival', category: 'events' },
  { src: '/images/gallery-2.jpg', alt: 'UNITY Talent Show', category: 'events' },
  { src: '/images/gallery-1.jpg', alt: 'Dinner', category: 'brotherhood' },
  { src: '/images/mansion.jpeg', alt: 'Omega Mansion', category: 'brotherhood' },
];

const categories = ['all', 'events', 'brotherhood', 'service', 'photoshoot'] as const;

export default function MediaPage() {
  const [filter, setFilter] = useState<string>('all');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === 'all' ? galleryImages : galleryImages.filter(img => img.category === filter);

  return (
    <PageWrapper>
      <Navbar variant="light" />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 sm:px-10 max-w-5xl mx-auto text-center">
        <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-3">Photos &amp; Videos</p>
        <h1 className="text-3xl sm:text-4xl text-gray-900 mb-4 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Media
        </h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Browse photos from our events, philanthropy work, socials, and brotherhood moments.
        </p>
      </section>

      {/* Filter */}
      <div className="flex justify-center gap-1 mb-10 px-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${filter === c ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="px-6 sm:px-10 max-w-6xl mx-auto pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filtered.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
            >
              <Image src={img.src} alt={img.alt} fill className="object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs font-medium">{img.alt}</p>
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No photos in this category yet.</p>
          </div>
        )}
      </section>

      {/* Instagram CTA */}
      <section className="px-6 sm:px-10 max-w-3xl mx-auto pb-20 text-center">
        <p className="text-gray-400 text-sm mb-4">Want to see more?</p>
        <a
          href="https://www.instagram.com/houstonomegas/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900 text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg transition-all duration-300"
        >
          Follow Us on Instagram
        </a>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(Math.max(0, lightbox - 1)); }}
            className="absolute left-4 sm:left-8 text-white/40 hover:text-white transition-colors"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(Math.min(filtered.length - 1, lightbox + 1)); }}
            className="absolute right-4 sm:right-8 text-white/40 hover:text-white transition-colors"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
          <div className="relative max-w-4xl max-h-[80vh] w-full aspect-[4/3]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={filtered[lightbox].src}
              alt={filtered[lightbox].alt}
              fill
              className="object-contain"
            />
          </div>
          <p className="absolute bottom-6 text-white/60 text-xs tracking-[0.1em]">
            {filtered[lightbox].alt} &middot; {lightbox + 1} / {filtered.length}
          </p>
        </div>
      )}

      <Footer variant="light" />
    </PageWrapper>
  );
}
