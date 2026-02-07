'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const navActions = [
  { label: 'Rent the Venue', desc: 'Book Omega Mansion for your event', href: '/rent', icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /> },
  { label: 'Become a Sponsor', desc: 'Partner with Houston Omegas', href: '/partners', icon: <><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 10-16 0" /></> },
  { label: 'Parties & Events', desc: 'See what\'s coming up', href: '#events', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></> },
  { label: 'Shop Merch', desc: 'Rep the brotherhood', href: '#merch', icon: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 01-8 0" /></> },
  { label: 'Rush Fall \'26', desc: 'Join the brotherhood', href: '/recruitment', icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></> },
];

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const [hasAnnouncements, setHasAnnouncements] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Check for undismissed popup announcements
  useEffect(() => {
    let dismissedIds: number[] = [];
    try {
      const stored = localStorage.getItem('dismissed_announcements');
      if (stored) dismissedIds = JSON.parse(stored);
    } catch { /* */ }

    fetch('/api/announcements')
      .then(res => res.ok ? res.json() : [])
      .then((data: { id: number; type: string }[]) => {
        const popups = data.filter(a =>
          (a.type === 'popup' || a.type === 'both') && !dismissedIds.includes(a.id)
        );
        setHasAnnouncements(popups.length > 0);
      })
      .catch(() => {});
  }, []);

  const linkClass = "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] transition-all group";

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 hidden lg:block">
      {/* Panel */}
      <div className={`absolute bottom-16 right-0 w-72 bg-[#111316] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 origin-bottom-right ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
        <div className="px-5 pt-4 pb-2">
          <p className="text-white/80 text-sm font-semibold">Quick Links</p>
          <p className="text-white/30 text-[11px]">Navigate the site</p>
        </div>
        <div className="px-2 pb-3">
          {navActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] group-hover:bg-white/[0.1] flex items-center justify-center shrink-0 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50 group-hover:text-white transition-colors">{a.icon}</svg>
              </div>
              <div>
                <p className="text-[13px] font-medium leading-tight">{a.label}</p>
                <p className="text-[11px] text-white/30 group-hover:text-white/40 transition-colors">{a.desc}</p>
              </div>
            </Link>
          ))}

          {/* Separator + Login */}
          <div className="h-px bg-white/[0.06] mx-3 my-1.5" />
          <a
            href="/login"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={linkClass}
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] group-hover:bg-white/[0.1] flex items-center justify-center shrink-0 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50 group-hover:text-white transition-colors">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium leading-tight">Member / Alumni Login</p>
              <p className="text-[11px] text-white/30 group-hover:text-white/40 transition-colors">Access the dashboard</p>
            </div>
          </a>
        </div>
      </div>

      {/* Toggle button — menu icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-12 h-12 rounded-full bg-black border border-white/[0.12] text-white flex items-center justify-center shadow-lg hover:bg-[#1a1a1a] transition-all duration-300"
        aria-label="Quick links menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-all duration-300">
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </>
          )}
        </svg>
        {/* Notification dot */}
        {hasAnnouncements && !open && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
        )}
      </button>
    </div>
  );
}
