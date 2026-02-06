'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Info } from 'lucide-react';

const sponsors = [
  { name: 'UH VSA', logo: '/images/vsa-logo.png', url: 'https://www.uhvsa.com/' },
  { name: 'ΣΦΩ', logo: '/images/sigma-phi-omega.jpg', url: 'https://uhsigmasweb.wixsite.com/mysite' },
  { name: 'Secret Society', logo: '/images/secret-society.jpg', url: 'https://linktr.ee/secretsocietyusa' },
  { name: 'Kruto Vodka', logo: '/images/kruto-logo.webp', url: 'https://krutovodka.com/' },
  { name: 'R&B Tea', logo: '/images/rb-tea-logo.png', url: '#' },
  { name: 'Bori', logo: '/images/bori-logo.png', url: 'https://borirestaurant.com/' },
];

function SponsorItem({ s }: { s: typeof sponsors[number] }) {
  return (
    <Link
      href="/partners"
      target="_blank"
      className="flex items-center gap-3.5 shrink-0 mx-6 sm:mx-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
    >
      <Image src={s.logo} alt={s.name} width={44} height={44} className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover" />
      <span className="text-white/80 text-sm sm:text-base font-semibold whitespace-nowrap">{s.name}</span>
    </Link>
  );
}

export default function SponsorsTicker() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <section className="py-10">
      {/* Header with info icon */}
      <div className="flex items-center justify-center gap-2.5 mb-6 relative z-20">
        <p className="text-sm text-white/60 uppercase tracking-[0.3em] font-bold">Our Partners</p>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info size={14} className="text-white/30 hover:text-white/50 transition-colors cursor-default" />
          {/* Tooltip */}
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 bg-[#151719]/95 backdrop-blur-xl border border-white/[0.1] rounded-xl p-4 shadow-2xl transition-all duration-300 pointer-events-none z-50 ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <p className="text-white/90 text-xs font-semibold mb-1.5">Partner with Houston Omegas</p>
            <p className="text-white/40 text-[11px] leading-relaxed mb-3">We collaborate with local businesses and organizations. Interested in sponsoring events or becoming a partner?</p>
            <p className="text-[#B2BEB5] text-[10px] uppercase tracking-wider font-medium">Learn more &rarr;</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#151719]/95 border-r border-b border-white/[0.1] rotate-45 -mt-1" />
          </div>
        </div>
      </div>

      <div className="relative group overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080a0f] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080a0f] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-ticker group-hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
          {[...sponsors, ...sponsors, ...sponsors].map((s, i) => (
            <SponsorItem key={`${s.name}-${i}`} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
