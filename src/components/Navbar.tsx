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

  const isLight = variant === 'light';
  const textColor = isLight ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white';
  const nameColor = isLight ? 'text-black' : 'text-white';
  const nameHover = isLight ? 'group-hover:text-black/80' : 'group-hover:text-white/80';
  const dropdownBg = isLight ? 'bg-white/95 border-black/[0.08]' : 'bg-[#151719]/95 border-white/[0.08]';
  const dropdownText = isLight ? 'text-black/50 hover:text-black hover:bg-black/[0.03]' : 'text-white/50 hover:text-white hover:bg-white/[0.03]';
  const mobileBg = isLight ? 'bg-white/95 border-black/[0.06]' : 'bg-[#0e1012]/95 border-white/[0.06]';
  const mobileText = isLight ? 'text-black/60 hover:text-black' : 'text-white/60 hover:text-white';
  const mobileLabel = isLight ? 'text-black/30' : 'text-white/30';
  const mobileDivider = isLight ? 'bg-black/[0.06]' : 'bg-white/[0.06]';
  const hamburgerColor = isLight ? 'text-black/60 hover:text-black' : 'text-white/60 hover:text-white';
  const ctaBg = isLight ? 'bg-black hover:bg-black/85 text-white' : 'bg-white hover:bg-white/90 text-black';
  const chevronColor = isLight ? 'text-black/70' : 'text-white/60';

  const mainLinks = [
    { label: 'Venue', href: '/rent' },
    { label: 'Recruitment', href: '/recruitment' },
    { label: 'Partners', href: '/partners' },
  ];

  const moreLinks = [
    { label: 'Merch', href: '/merch' },
    { label: 'About Us', href: '#about' },
    { label: 'History', href: '/history' },
    { label: 'Blog', href: '/blog' },
    { label: 'Legal', href: '/disclaimer' },
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-10 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <Image src="/images/omega-logo.jpg" alt="Logo" width={34} height={34} className="rounded-full group-hover:opacity-80 transition-opacity" />
          <span className={`${nameColor} ${nameHover} text-xs sm:text-sm uppercase tracking-[0.04em] font-bold transition-colors`} style={{ fontFamily: 'var(--font-cinzel), serif' }}>Houston Omegas</span>
        </Link>

        <div className="hidden lg:flex items-center gap-7">
          {mainLinks.map((l) => (
            <Link key={l.label} href={l.href} className={`${textColor} text-xs uppercase tracking-[0.12em] font-semibold transition-colors duration-300`}>{l.label}</Link>
          ))}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              onMouseEnter={() => setMoreOpen(true)}
              className={`flex items-center gap-1 ${textColor} text-xs uppercase tracking-[0.12em] font-semibold transition-colors duration-300`}
            >
              Resources
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`${chevronColor} transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {moreOpen && (
              <div
                onMouseLeave={() => setMoreOpen(false)}
                className={`absolute top-full right-0 mt-2 w-44 ${dropdownBg} backdrop-blur-2xl border rounded-xl py-2 shadow-xl`}
              >
                {moreLinks.map((l) => (
                  <Link key={l.label} href={l.href} onClick={() => setMoreOpen(false)} className={`block px-4 py-2 ${dropdownText} text-[11px] uppercase tracking-[0.12em] transition-colors`}>{l.label}</Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-5">
          <Link href="/contact" className={`${textColor} text-xs uppercase tracking-[0.12em] font-semibold transition-colors duration-300`}>
            Contact
          </Link>
          <Link href="/contact" className={`${ctaBg} text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 rounded-lg font-semibold transition-all duration-300`}>
            Inquire
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden ${hamburgerColor} transition-colors`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className={`lg:hidden ${mobileBg} backdrop-blur-2xl px-6 py-6 space-y-4 border-t`}>
          {mainLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className={`block ${mobileText} text-xs uppercase tracking-[0.15em] font-medium transition-colors`}>{l.label}</Link>
          ))}
          <div className={`h-px ${mobileDivider} my-2`} />
          <p className={`${mobileLabel} text-[9px] uppercase tracking-[0.2em]`}>Resources</p>
          {moreLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className={`block ${mobileText} text-xs uppercase tracking-[0.15em] transition-colors pl-3`}>{l.label}</Link>
          ))}
          <div className={`h-px ${mobileDivider} my-2`} />
          <Link href="/contact" onClick={() => setMobileOpen(false)} className={`block ${mobileText} text-xs uppercase tracking-[0.15em] font-semibold transition-colors`}>Contact</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)} className={`inline-block ${ctaBg} text-xs uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg mt-1`}>Inquire</Link>
        </div>
      )}
    </nav>
  );
}
