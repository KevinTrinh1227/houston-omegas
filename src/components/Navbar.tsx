'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Navbar({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isLight = variant === 'light';
  const textColor = isLight ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white';
  const nameColor = isLight ? 'text-black' : 'text-white';
  const nameHover = isLight ? 'group-hover:text-black/80' : 'group-hover:text-white/80';
  const dropdownBg = isLight ? 'bg-white/95 border-black/[0.08]' : 'bg-[#151719]/95 border-white/[0.08]';
  const dropdownText = isLight ? 'text-black/50 hover:text-black hover:bg-black/[0.03]' : 'text-white/50 hover:text-white hover:bg-white/[0.03]';
  const hamburgerColor = isLight ? 'text-black/60 hover:text-black' : 'text-white/60 hover:text-white';
  const ctaBg = isLight ? 'bg-black hover:bg-black/85 text-white' : 'bg-white hover:bg-white/90 text-black';
  const chevronColor = isLight ? 'text-black/70' : 'text-white/60';

  const mainLinks = [
    { label: 'Events', href: '/events' },
    { label: 'Venue', href: '/rent' },
    { label: 'Recruitment', href: '/recruitment' },
    { label: 'Partners', href: '/partners' },
  ];

  const moreLinks = [
    { label: 'Media', href: '/media' },
    { label: 'Merch', href: '/merch' },
    { label: 'History', href: '/history' },
    { label: 'Blog', href: '/blog' },
    { label: 'Legal', href: '/disclaimer' },
  ];

  const allMobileLinks = [
    { label: 'Events', href: '/events' },
    { label: 'Venue Rental', href: '/rent' },
    { label: 'Recruitment', href: '/recruitment' },
    { label: 'Partners', href: '/partners' },
    { label: 'Media', href: '/media' },
    { label: 'Merch', href: '/merch' },
    { label: 'History', href: '/history' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image src="/images/omega-logo.jpg" alt="Logo" width={34} height={34} className="rounded-full group-hover:opacity-80 transition-opacity" />
            <span className={`${nameColor} ${nameHover} text-sm sm:text-base uppercase tracking-[0.04em] font-extrabold transition-colors`} style={{ fontFamily: 'var(--font-cinzel), serif' }}>Houston Omegas</span>
          </Link>

          <div className="hidden lg:flex items-center gap-3">
            {mainLinks.map((l, i) => (
              <span key={l.label} className="flex items-center gap-3">
                {i > 0 && <span className={`w-px h-3 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />}
                <Link href={l.href} className={`${textColor} text-xs uppercase tracking-[0.12em] font-semibold transition-colors duration-300`}>{l.label}</Link>
              </span>
            ))}
            <span className={`w-px h-3 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />
            <div
              ref={moreRef}
              className="relative flex items-center"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                className={`flex items-center gap-1 ${textColor} text-xs uppercase tracking-[0.12em] font-semibold transition-colors duration-300`}
              >
                More
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`${chevronColor} transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <div className="pt-2">
                <div
                  className={`absolute top-full right-0 w-44 ${dropdownBg} backdrop-blur-2xl border rounded-xl py-2 shadow-xl transition-all duration-200 origin-top ${moreOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}`}
                >
                  {moreLinks.map((l) => (
                    <Link key={l.label} href={l.href} onClick={() => setMoreOpen(false)} className={`block px-4 py-2 ${dropdownText} text-[11px] uppercase tracking-[0.12em] transition-colors`}>{l.label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/dashboard" className={`${textColor} text-xs uppercase tracking-[0.12em] font-semibold transition-colors duration-300`}>
              Login
            </Link>
            <Link href="/contact" className={`${ctaBg} text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 rounded-lg font-semibold transition-all duration-300`}>
              Contact Us
            </Link>
          </div>

          {/* Mobile hamburger placeholder - actual button is fixed */}
          <div className="lg:hidden w-[22px]" />
        </div>
      </nav>

      {/* Fixed mobile hamburger/close button - always on top of overlay */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={`lg:hidden fixed top-4 right-5 sm:right-10 z-[70] transition-colors ${mobileOpen ? 'text-white/80 hover:text-white' : hamburgerColor}`}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>}
        </svg>
      </button>

      {/* Fullscreen mobile overlay */}
      <div
        className={`fixed inset-0 z-[55] bg-[#0a0b0e]/98 backdrop-blur-xl transition-all duration-500 lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`flex flex-col items-center justify-center h-full transition-all duration-500 ${mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'}`}>
          <div className="flex flex-col items-center gap-6 mb-10">
            {allMobileLinks.map((l, i) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/70 hover:text-white text-lg uppercase tracking-[0.2em] font-semibold transition-all duration-300"
                style={{ transitionDelay: mobileOpen ? `${i * 40}ms` : '0ms' }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="h-px w-16 bg-white/10 mb-8" />

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-xs uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg transition-all duration-300"
            >
              Member Login
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="bg-white text-black text-xs uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-white/90 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>

          <p className="absolute bottom-8 text-white/15 text-[10px] uppercase tracking-[0.3em]">Houston Omegas</p>
        </div>
      </div>
    </>
  );
}
