'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Info } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_current: number;
}

const fallbackSponsors = [
  { name: 'UH VSA', logo: '/images/vsa-logo.png', slug: 'uh-vsa' },
  { name: 'ΣΦΩ', logo: '/images/sigma-phi-omega.jpg', slug: 'sigma-phi-omega' },
  { name: 'Secret Society', logo: '/images/secret-society.jpg', slug: 'secret-society' },
  { name: 'Kruto Vodka', logo: '/images/kruto-logo.webp', slug: 'kruto-vodka' },
  { name: 'R&B Tea', logo: '/images/rb-tea-logo.png', slug: 'rb-tea' },
  { name: 'Bori', logo: '/images/bori-logo.png', slug: 'bori' },
];

function SponsorItem({ name, logo, slug }: { name: string; logo: string; slug: string }) {
  return (
    <Link
      href={`/partners/profile?slug=${slug}`}
      className="flex items-center gap-3.5 shrink-0 mx-6 sm:mx-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
    >
      <Image src={logo} alt={name} width={44} height={44} className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover" />
      <span className="text-white/80 text-sm sm:text-base font-semibold whitespace-nowrap">{name}</span>
    </Link>
  );
}

export default function SponsorsTicker() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [items, setItems] = useState(fallbackSponsors);

  useEffect(() => {
    fetch('/api/partners')
      .then(res => res.ok ? res.json() : null)
      .then((data: Partner[] | null) => {
        if (data && data.length > 0) {
          const current = data.filter(p => p.is_current && p.logo_url);
          if (current.length > 0) {
            setItems(current.map(p => ({
              name: p.name,
              logo: p.logo_url!,
              slug: p.slug,
            })));
          }
        }
      })
      .catch(() => {});
  }, []);

  const tripled = [...items, ...items, ...items];

  return (
    <section className="py-10">
      {/* Header with info icon */}
      <div className="flex items-center justify-center gap-2.5 mb-6 relative z-20">
        <p className="text-sm text-white/60 uppercase tracking-[0.3em] font-bold">Partners &amp; Affiliates</p>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info size={14} className="text-white/30 hover:text-white/50 transition-colors cursor-default" />
          {/* Tooltip */}
          <div className={`absolute bottom-full right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto mb-3 w-60 bg-[#151719]/95 backdrop-blur-xl border border-white/[0.1] rounded-xl p-4 shadow-2xl transition-all duration-300 pointer-events-none z-50 ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <p className="text-white/90 text-xs font-semibold mb-1.5">Partner with Houston Omegas</p>
            <p className="text-white/40 text-[11px] leading-relaxed mb-3">We collaborate with local businesses and organizations. Interested in sponsoring events or becoming a partner?</p>
            <p className="text-[#B2BEB5] text-[10px] uppercase tracking-wider font-medium">Learn more &rarr;</p>
            <div className="absolute top-full right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-2 h-2 bg-[#151719]/95 border-r border-b border-white/[0.1] rotate-45 -mt-1" />
          </div>
        </div>
      </div>

      <div className="relative group overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080a0f] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080a0f] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-ticker group-hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
          {tripled.map((s, i) => (
            <SponsorItem key={`${s.name}-${i}`} name={s.name} logo={s.logo} slug={s.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
