import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Partners',
  description: 'Partner with Houston Omegas. Sponsorship opportunities for events, social media, and community engagement.',
};

const tiers = [
  {
    name: 'Gold',
    price: 'Custom',
    features: ['Logo on all event banners & flyers', 'Social media features (5+ posts/semester)', 'Booth space at major events', 'Priority venue rental access', 'Named sponsorship on website'],
  },
  {
    name: 'Silver',
    price: 'Custom',
    features: ['Logo on select event materials', 'Social media shoutouts (3 posts/semester)', 'Event attendance & networking', 'Logo listed on website'],
  },
  {
    name: 'Bronze',
    price: 'Custom',
    features: ['Social media mention (1 post/semester)', 'Logo listed on website', 'Event attendance'],
  },
];

const currentPartners = [
  { name: 'UH VSA', logo: '/images/vsa-logo.png', url: 'https://www.uhvsa.com/' },
  { name: 'Sigma Phi Omega', logo: '/images/sigma-phi-omega.jpg', url: 'https://uhsigmasweb.wixsite.com/mysite' },
  { name: 'Secret Society', logo: '/images/secret-society.jpg', url: 'https://linktr.ee/secretsocietyusa' },
];

export default function PartnersPage() {
  return (
    <div className="relative bg-white text-gray-900 min-h-screen">
      <Navbar variant="light" />

      <section className="pt-28 pb-20 px-6 sm:px-10 max-w-4xl mx-auto text-center">
        <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-3">Sponsorships &amp; Partnerships</p>
        <h1 className="text-3xl sm:text-4xl text-gray-900 mb-4 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Partner With Us
        </h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Houston Omegas hosts some of the most attended events in the Houston college scene. Partner with us to reach a diverse, engaged audience.
        </p>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      <section className="py-20 px-6 sm:px-10 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl text-gray-900 mb-12 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Why Partner?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { title: 'Reach', desc: 'Access our network of students, alumni, and community members across Houston.' },
            { title: 'Exposure', desc: 'Get featured across our social media, events, and website, reaching thousands.' },
            { title: 'Community', desc: 'Align your brand with brotherhood, cultural pride, and community service.' },
          ].map((item) => (
            <div key={item.title} className="text-center border border-gray-200 rounded-2xl p-8 bg-gray-50">
              <h3 className="text-gray-900 text-lg font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      <section className="py-20 px-6 sm:px-10 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl text-gray-900 mb-12 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Sponsorship Tiers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div key={tier.name} className={`border rounded-2xl p-8 ${tier.name === 'Gold' ? 'border-[#B2BEB5]/40 bg-[#B2BEB5]/5' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-1 ${tier.name === 'Gold' ? 'text-[#7a8a7e]' : 'text-gray-800'}`}>{tier.name}</h3>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-6">{tier.price}</p>
              <ul className="space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B2BEB5" strokeWidth="2" className="shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      <section className="py-20 px-6 sm:px-10 max-w-4xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl text-gray-900 mb-12 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Current Partners
        </h2>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          {currentPartners.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group">
              <Image src={p.logo} alt={p.name} width={64} height={64} className="w-16 h-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" />
              <span className="text-gray-400 text-xs group-hover:text-gray-700 transition-colors">{p.name}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      <section className="py-20 px-6 sm:px-10 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl text-gray-900 mb-4 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Ready to Partner?
        </h2>
        <p className="text-gray-500 text-sm mb-8">Reach out and let&apos;s discuss how we can work together.</p>
        <Link href="/contact" className="inline-block bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-8 py-3 rounded-lg hover:bg-gray-800 transition-all">
          Get in Touch
        </Link>
      </section>

      <Footer variant="light" />
    </div>
  );
}
