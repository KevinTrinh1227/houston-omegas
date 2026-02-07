'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuickActions from '@/components/QuickActions';
import SponsorsTicker from '@/components/SponsorsTicker';
import ImageCarousel from '@/components/ImageCarousel';

/* ─── Crow component ─── */
function Crow({ className, style, size = 18, fill = '#222' }: { className?: string; style?: React.CSSProperties; size?: number; fill?: string }) {
  return (
    <div className={className} style={style}>
      <svg width={size} height={size * 0.56} viewBox="0 0 24 14" fill="none" className="animate-crow-flap">
        <path d="M12 6 C10 3, 6 0, 1 2 C4 4, 6 5, 7 7 C8 5, 10 5, 12 6 C14 5, 16 5, 17 7 C18 5, 20 4, 23 2 C18 0, 14 3, 12 6Z" fill={fill} />
      </svg>
    </div>
  );
}

/* ─── Countdown Hook (stable target via useMemo) ─── */
function useCountdown(targetTime: number) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);
  return timeLeft;
}

/* ─── Gallery ─── */
const galleryImages = [
  { src: '/images/gallery-5.jpg', alt: 'Brotherhood', span: 'col-span-2 row-span-2' },
  { src: '/images/gallery-7.jpg', alt: 'Photoshoot', span: '' },
  { src: '/images/gallery-3.jpg', alt: 'Beach Cleanup', span: '' },
  { src: '/images/gallery-4.jpg', alt: 'Night Event', span: '' },
  { src: '/images/gallery-6.jpg', alt: 'Korean Festival', span: '' },
  { src: '/images/gallery-2.jpg', alt: 'UNITY Talent Show', span: 'col-span-2' },
  { src: '/images/gallery-1.jpg', alt: 'Dinner', span: '' },
  { src: '/images/mansion.jpeg', alt: 'Omega Mansion', span: '' },
];

/* ─── Upcoming Events ─── */
const upcomingEvents = [
  { date: 'Feb 13', title: 'Love at First Light', tag: 'Party', desc: 'Pull up to Omega Mansion the night before Valentine\'s Day. Drinks, music, vibes.', featured: true, flyer: '/images/vday-flyer.webp' },
  { date: 'Mar 15', title: 'Spring Rush', tag: 'Rush', desc: 'Meet the brothers and see if Houston Omegas is the right fit for you.' },
  { date: 'Mar 22', title: 'Charity Gala', tag: 'Philanthropy', desc: 'Annual fundraiser supporting local Houston communities.' },
  { date: 'Apr 5', title: 'Founders Day', tag: 'Celebration', desc: 'Celebrating another year of brotherhood and impact.' },
  { date: 'Apr 19', title: 'Spring Formal', tag: 'Party', desc: 'End the semester right. Dress code: semi-formal.' },
];

/* ─── Merch items ─── */
const merchItems = [
  { name: 'Classic Hoodie', price: '$55', image: '/images/merch-1.jpg' },
  { name: 'Varsity Jersey', price: '$75', image: '/images/merch-2.jpg' },
  { name: 'Sweats', price: '$45', image: '/images/merch-3.jpg' },
];


/* ═══════════════════════════════════════════════════ */

export default function HomePage() {
  const rushTime = useMemo(() => new Date('2026-08-17T09:00:00').getTime(), []);
  const countdown = useCountdown(rushTime);

  return (
    <div className="relative bg-[#080a0f] text-white">
      {/* Subtle floating particles across dark sections */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${8 + (i * 7.5) % 84}%`,
              top: `${30 + (i * 23) % 60}%`,
              animationDuration: `${8 + (i % 5) * 2}s`,
              animationDelay: `${(i * 1.3) % 10}s`,
              width: `${1.5 + (i % 3)}px`,
              height: `${1.5 + (i % 3)}px`,
            }}
          />
        ))}
      </div>
      <Navbar variant="light" />
      <QuickActions />

      {/* ═══════════ HERO — White sky ═══════════ */}
      <section className="relative h-screen overflow-hidden bg-white">

        {/* Texture overlay */}
        <Image src="/images/texture-dark.jpg" alt="" fill className="object-cover mix-blend-multiply opacity-[0.18] pointer-events-none z-[1]" />

        {/* Static / grain noise overlay */}
        <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.06] mix-blend-overlay">
          <svg width="100%" height="100%"><filter id="hero-noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#hero-noise)" /></svg>
        </div>

        {/* Vignette / darker edges - lighter at top for navbar readability */}
        <div className="absolute inset-0 z-[3] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-[12vh] bg-gradient-to-b from-black/10 to-transparent z-[3] pointer-events-none" />

        {/* Clouds */}
        <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
          {/* Large cloud cluster - top left */}
          <div className="absolute -top-[2%] -left-[5%] animate-cloud-drift" style={{ animationDuration: '120s' }}>
            <div className="relative">
              <div className="w-[30vw] h-[8vw] bg-white/40 rounded-full blur-[40px]" />
              <div className="absolute top-[1vw] left-[8vw] w-[18vw] h-[6vw] bg-white/30 rounded-full blur-[35px]" />
              <div className="absolute -top-[1vw] left-[4vw] w-[14vw] h-[5vw] bg-white/50 rounded-full blur-[30px]" />
            </div>
          </div>

          {/* Medium cloud - top right */}
          <div className="absolute top-[1%] right-[0%] animate-cloud-drift" style={{ animationDelay: '15s', animationDuration: '140s', animationDirection: 'reverse' }}>
            <div className="relative">
              <div className="w-[25vw] h-[7vw] bg-white/35 rounded-full blur-[35px]" />
              <div className="absolute top-[0.5vw] left-[5vw] w-[16vw] h-[5vw] bg-white/45 rounded-full blur-[30px]" />
              <div className="absolute -top-[1vw] left-[10vw] w-[10vw] h-[4vw] bg-white/35 rounded-full blur-[25px]" />
            </div>
          </div>

          {/* Small wispy cloud - top center */}
          <div className="absolute top-[5%] left-[30%] animate-cloud-drift" style={{ animationDelay: '8s', animationDuration: '100s' }}>
            <div className="relative">
              <div className="w-[20vw] h-[4vw] bg-white/25 rounded-full blur-[30px]" />
              <div className="absolute top-[0.5vw] left-[6vw] w-[10vw] h-[3vw] bg-white/30 rounded-full blur-[25px]" />
            </div>
          </div>

          {/* Thin wisp - mid left */}
          <div className="absolute top-[15%] left-[5%] animate-cloud-drift" style={{ animationDelay: '25s', animationDuration: '90s' }}>
            <div className="w-[22vw] h-[2vw] bg-white/15 rounded-full blur-[20px]" />
          </div>

          {/* Thin wisp - mid right */}
          <div className="absolute top-[12%] right-[8%] animate-cloud-drift" style={{ animationDelay: '35s', animationDuration: '110s', animationDirection: 'reverse' }}>
            <div className="w-[18vw] h-[2vw] bg-white/12 rounded-full blur-[18px]" />
          </div>
        </div>

        {/* Flying crows */}
        <Crow className="absolute top-[15%] left-[8%] z-[5] animate-crow-fly" style={{ animationDelay: '0s' }} size={20} fill="#2a2a2a" />
        <Crow className="absolute top-[10%] right-[15%] z-[5] animate-crow-fly" style={{ animationDelay: '7s', animationDirection: 'reverse' }} size={16} fill="#333" />
        <Crow className="absolute top-[25%] left-[45%] z-[5] animate-crow-fly" style={{ animationDelay: '14s' }} size={14} fill="#3a3a3a" />

        {/* Circling crows near house */}
        <Crow className="absolute bottom-[260px] left-[calc(50%-80px)] z-[5] animate-crow-circle" size={14} fill="#2a2a2a" />
        <Crow className="absolute bottom-[280px] left-[calc(50%+50px)] z-[5] animate-crow-circle-reverse" style={{ animationDelay: '4s' }} size={12} fill="#444" />
        <Crow className="absolute bottom-[200px] left-[calc(50%-30px)] z-[5] animate-crow-circle" style={{ animationDelay: '2s' }} size={10} fill="#555" />

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 z-[6]">
          <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="w-full h-[140px] sm:h-[160px]">
            <path d="M0,40 C120,25 240,45 360,30 C480,15 600,35 720,22 C840,10 960,30 1080,18 C1200,8 1320,25 1440,15 L1440,160 L0,160 Z" fill="#111214" />
            <path d="M0,60 C180,48 300,65 480,52 C660,40 780,58 960,48 C1140,38 1260,52 1440,42 L1440,160 L0,160 Z" fill="#0e0f12" />
            <path d="M0,80 C200,72 400,82 600,74 C800,66 1000,78 1200,70 C1300,66 1400,72 1440,70 L1440,160 L0,160 Z" fill="#0b0c0f" />
            <path d="M0,100 C300,94 600,102 900,96 C1100,92 1300,98 1440,94 L1440,160 L0,160 Z" fill="#090a0e" />
            <path d="M0,120 C400,116 800,122 1200,118 C1350,116 1440,118 1440,118 L1440,160 L0,160 Z" fill="#080a0f" />
          </svg>
        </div>

        {/* House (not selectable / not draggable) */}
        <div className="absolute bottom-[38px] left-1/2 -translate-x-1/2 w-full max-w-[42rem] lg:max-w-[46rem] z-[7] px-4 select-none pointer-events-none">
          <Image src="/images/mansion-illustration.png" alt="Omega Mansion" width={1200} height={675} className="w-full h-auto brightness-[0.85]" draggable={false} priority />
        </div>

        {/* Title + CTAs */}
        <div className="relative z-10 flex flex-col items-center pt-[14vh] sm:pt-[20vh] lg:pt-[32vh]">
          <div className="animate-float">
            <p className="text-black/60 text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase mb-1 text-center" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              Established 2004
            </p>
            <h1 className="text-black text-5xl sm:text-6xl md:text-8xl tracking-[0.08em]" style={{ fontFamily: 'var(--font-metal-mania), serif' }}>
              Houston Omegas
            </h1>
          </div>
          {/* CTA */}
          <div className="mt-8 sm:mt-10 flex flex-col items-center">
            <Link href="/events/detail?slug=love-at-first-light" className="relative border border-black/20 bg-black/[0.04] hover:bg-black/[0.08] text-black/90 hover:text-black hover:border-black/40 text-[11px] uppercase tracking-[0.2em] font-semibold px-8 py-3 rounded-lg backdrop-blur-sm transition-all duration-300 animate-hero-cta-glow">
              Valentine&apos;s Party &middot; Feb 13
            </Link>
            <span className="text-[10px] text-black/50 mt-2 tracking-[0.15em] uppercase">Love at First Light</span>
          </div>
        </div>

        {/* Fade into dark content */}
        <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-gradient-to-t from-[#080a0f] to-transparent z-[8]" />
      </section>

      {/* ═══════════ SPONSORS TICKER ═══════════ */}
      <SponsorsTicker />

      {/* ═══════════ ABOUT ═══════════ */}
      <section id="about" className="relative py-24 px-6 sm:px-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-6 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              Who We Are
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Houston Omegas is a brotherhood rooted in honor, service, and cultural pride. Founded in 2004, we&apos;ve grown into one of the most active Asian-interest fraternities in the Houston area.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              From philanthropy events and community outreach to socials and celebrations, we&apos;re committed to building leaders and lifelong bonds. We also open our doors for venue rentals and collaborate with local businesses and organizations who share our vision.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
              {[
                { label: 'Instagram', url: 'https://www.instagram.com/houstonomegas/', icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/> },
                { label: 'TikTok', url: '#', icon: <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/> },
                { label: 'YouTube', url: '#', icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/> },
                { label: 'Twitter/X', url: '#', icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/> },
              ].map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-white/30 hover:text-white/70 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>
          <div className="w-80 h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden border border-white/[0.08] shrink-0 relative">
            <ImageCarousel />
          </div>
        </div>
      </section>

      {/* ═══════════ EVENTS ═══════════ */}
      <section id="events" className="relative py-24 px-6 sm:px-10 max-w-6xl mx-auto">
        <h2 className="text-center text-4xl sm:text-5xl lg:text-6xl mb-4 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Upcoming Events
        </h2>
        <p className="text-center text-white/40 text-sm mb-14">Parties, rush events, and more. Follow us on Instagram for the latest.</p>

        {/* Featured event (Valentine's Day) */}
        {upcomingEvents.filter(e => e.featured).map((e) => (
          <Link key={e.title} href={`/events/detail?slug=${e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`} className="block mb-8 border border-white/[0.1] rounded-2xl overflow-hidden bg-white/[0.02] hover:border-white/[0.18] transition-all duration-300 cursor-pointer group">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Flyer */}
              <div className="relative aspect-[3/4] md:aspect-auto min-h-[320px] bg-[#0c0e13] flex items-center justify-center p-6">
                {e.flyer ? (
                  <Image src={e.flyer} alt={e.title} fill className="object-contain p-4" />
                ) : (
                  <div className="text-center p-8">
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] mb-3">Flyer Coming Soon</p>
                    <p className="text-3xl">{'<3'}</p>
                  </div>
                )}
              </div>
              {/* Details */}
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full uppercase tracking-wider font-medium">Featured</span>
                  <span className="text-[10px] bg-white/[0.06] text-white/40 px-2.5 py-1 rounded-full uppercase tracking-wider">{e.tag}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl text-white/90 mb-2 tracking-[0.04em] group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-cinzel), serif' }}>{e.title}</h3>
                <p className="text-white/60 text-sm mb-1">{e.date}, 2026</p>
                <p className="text-white/40 text-sm leading-relaxed mb-6">{e.desc}</p>
                <div className="space-y-2 text-white/35 text-xs">
                  <p>18+ to enter. 21+ wristbands at the door.</p>
                  <p>Uber/Lyft recommended. No on-site parking.</p>
                  <p>No outside items or contraband.</p>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Other upcoming events */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingEvents.filter(e => !e.featured).map((e) => (
            <div key={e.title} className="border border-white/[0.08] rounded-xl p-6 bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.03] transition-all duration-300">
              <span className="text-[9px] bg-white/[0.06] text-white/40 px-2 py-0.5 rounded-full uppercase tracking-wider">{e.tag}</span>
              <h3 className="text-white/90 text-sm font-semibold mt-3 mb-1">{e.title}</h3>
              <p className="text-[#B2BEB5] text-xs font-medium mb-2">{e.date}</p>
              <p className="text-white/35 text-xs leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/events" className="inline-block border border-white/[0.12] hover:border-white/[0.25] text-white/60 hover:text-white text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg transition-all duration-300">
            View All Events
          </Link>
        </div>
      </section>

      {/* ═══════════ MERCH ═══════════ */}
      <section id="merch" className="relative py-24 px-6 sm:px-10 max-w-5xl mx-auto">
        <h2 className="text-center text-4xl sm:text-5xl lg:text-6xl mb-12 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Merch
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {merchItems.map((item, i) => (
            <div key={i} className="group">
              <div className="rounded-xl aspect-[3/4] mb-4 overflow-hidden relative">
                <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm font-medium">{item.name}</span>
                <span className="text-white/40 text-sm">{item.price}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/merch" className="inline-block border border-white/[0.12] hover:border-white/[0.25] text-white/60 hover:text-white text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg transition-all duration-300">
            Shop All
          </Link>
        </div>
      </section>

      {/* ═══════════ MEDIA TEASER ═══════════ */}
      <section id="gallery" className="relative py-24 px-6 sm:px-10 max-w-6xl mx-auto">
        <h2 className="text-center text-4xl sm:text-5xl lg:text-6xl mb-4 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Media
        </h2>
        <p className="text-center text-white/40 text-sm mb-10">Photos, videos, and highlights from our events and brotherhood.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 auto-rows-[180px] md:auto-rows-[200px]">
          {galleryImages.slice(0, 4).map((img, i) => (
            <Link key={i} href="/media" className={`relative overflow-hidden group rounded-lg ${img.span}`}>
              <Image src={img.src} alt={img.alt} fill className="object-cover transition-all duration-500 group-hover:scale-105 brightness-100 group-hover:brightness-110" />
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/media" className="inline-block border border-white/[0.12] hover:border-white/[0.25] text-white/60 hover:text-white text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg transition-all duration-300">
            View All Media
          </Link>
        </div>
      </section>

      {/* ═══════════ RECRUITMENT ═══════════ */}
      <section id="recruitment" className="relative py-24 px-6 sm:px-10 max-w-3xl mx-auto overflow-hidden">
        {/* Subtle bat animations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] -left-4 animate-bat-section-fly" style={{ animationDelay: '0s' }}>
            <svg width="18" height="10" viewBox="0 0 24 14" fill="none" className="animate-crow-flap"><path d="M12 6 C10 3, 6 0, 1 2 C4 4, 6 5, 7 7 C8 5, 10 5, 12 6 C14 5, 16 5, 17 7 C18 5, 20 4, 23 2 C18 0, 14 3, 12 6Z" fill="rgba(255,255,255,0.22)" /></svg>
          </div>
          <div className="absolute top-[45%] -left-4 animate-bat-section-fly" style={{ animationDelay: '6s' }}>
            <svg width="14" height="8" viewBox="0 0 24 14" fill="none" className="animate-crow-flap"><path d="M12 6 C10 3, 6 0, 1 2 C4 4, 6 5, 7 7 C8 5, 10 5, 12 6 C14 5, 16 5, 17 7 C18 5, 20 4, 23 2 C18 0, 14 3, 12 6Z" fill="rgba(255,255,255,0.16)" /></svg>
          </div>
          <div className="absolute top-[70%] -left-4 animate-bat-section-fly" style={{ animationDelay: '12s' }}>
            <svg width="16" height="9" viewBox="0 0 24 14" fill="none" className="animate-crow-flap"><path d="M12 6 C10 3, 6 0, 1 2 C4 4, 6 5, 7 7 C8 5, 10 5, 12 6 C14 5, 16 5, 17 7 C18 5, 20 4, 23 2 C18 0, 14 3, 12 6Z" fill="rgba(255,255,255,0.18)" /></svg>
          </div>
        </div>

        <h2 className="text-center text-4xl sm:text-5xl lg:text-6xl mb-4 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Recruitment
        </h2>
        <p className="text-center text-white/50 text-sm mb-12">Fall recruitment season - Coming Soon</p>
        <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-md mx-auto mb-10">
          {[
            { value: countdown.days, label: 'Days' },
            { value: countdown.hours, label: 'Hours' },
            { value: countdown.minutes, label: 'Min' },
            { value: countdown.seconds, label: 'Sec' },
          ].map((unit) => (
            <div key={unit.label} className="text-center">
              <div className="border border-white/[0.08] rounded-xl py-4 sm:py-5 bg-white/[0.02]">
                <span className="text-white text-2xl sm:text-4xl font-light tabular-nums">{String(unit.value).padStart(2, '0')}</span>
              </div>
              <span className="text-white/35 text-[10px] uppercase tracking-[0.15em] mt-2 block">{unit.label}</span>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/recruitment" className="inline-block border border-white/[0.12] hover:border-white/[0.25] text-white/60 hover:text-white text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg transition-all duration-300">
            Interested in Becoming an &Omega;?
          </Link>
        </div>
      </section>

      {/* ═══════════ CTA — Get Involved ═══════════ */}
      <section className="relative py-24 px-6 sm:px-10 max-w-6xl mx-auto">
        <h2 className="text-center text-4xl sm:text-5xl lg:text-6xl mb-4 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Get Involved
        </h2>
        <p className="text-center text-white/50 text-sm mb-12">Host an event, partner with us, or rep the brand.</p>

        {/* Main card — Rent */}
        <Link href="/rent" className="block border border-white/[0.1] hover:border-white/[0.2] rounded-2xl p-10 sm:p-14 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 group mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white/90 group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-cinzel), serif' }}>Host Your Next Event</h3>
              <p className="text-white/50 text-sm mt-2">Book Omega Mansion for parties, corporate events, weddings, and more. 5,300 sq ft of flexible space in Houston.</p>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all shrink-0 ml-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>
        </Link>

        {/* Two cards — Sponsor + Merch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/partners" className="block border border-white/[0.1] hover:border-white/[0.2] rounded-2xl p-8 sm:p-10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 group">
            <h3 className="text-xl font-semibold text-white/90 group-hover:text-white transition-colors mb-1" style={{ fontFamily: 'var(--font-cinzel), serif' }}>Sponsor Us</h3>
            <p className="text-white/40 text-sm">Partner with Houston Omegas and reach our community.</p>
          </Link>
          <Link href="/merch" className="block border border-white/[0.1] hover:border-white/[0.2] rounded-2xl p-8 sm:p-10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 group">
            <h3 className="text-xl font-semibold text-white/90 group-hover:text-white transition-colors mb-1" style={{ fontFamily: 'var(--font-cinzel), serif' }}>Shop Merch</h3>
            <p className="text-white/40 text-sm">Rep the brotherhood with official apparel and goods.</p>
          </Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <Footer />
    </div>
  );
}
