import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Links',
  description: 'Houston Omegas - all our links in one place.',
};

const socials = [
  { label: 'Instagram', url: 'https://www.instagram.com/houstonomegas/', icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/> },
  { label: 'TikTok', url: '#', icon: <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/> },
  { label: 'YouTube', url: '#', icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/> },
  { label: 'Threads', url: '#', icon: <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.724 2.104-1.138 3.542-1.199 1.048-.044 2.025.066 2.923.307.013-.543.005-1.095-.025-1.652-.08-1.49-.502-2.15-1.67-2.26-1.2-.113-2.137.277-2.399 1.004l-2.037-.425c.503-1.397 1.742-2.354 3.602-2.354.02 0 .04 0 .06.001 1.32.058 2.315.533 2.958 1.412.555.758.837 1.794.837 3.081v.1c1.063.382 1.898.955 2.495 1.72.804 1.03 1.08 2.282.8 3.625-.38 1.82-1.504 3.193-3.248 3.965C17.074 23.5 14.848 24 12.186 24zm.263-7.063c.04 0 .081 0 .122.002.937.05 1.606.322 1.985.81.321.413.476.955.476 1.6 0 .143-.008.287-.025.43-.098.825-.49 1.466-1.136 1.855-.568.341-1.278.515-2.112.515-.04 0-.08 0-.12-.002-.93-.05-1.6-.343-1.993-.872-.341-.461-.487-1.074-.423-1.77.093-.991.727-1.754 1.837-2.21.427-.165.893-.29 1.389-.358z"/> },
  { label: 'Twitter/X', url: '#', icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/> },
  { label: 'Facebook', url: '#', icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
];

const links = [
  { label: '💬 Join Our WhatsApp', href: 'https://chat.whatsapp.com/BuN7ZMjKR4Z06QWWe1q3vP', desc: 'Community group chat', external: true },
  { label: 'Parties & Events', href: '/#events', desc: 'See upcoming events' },
  { label: 'Recruitment', href: '/recruitment', desc: 'Rush Fall 2026' },
  { label: 'Venue Rental', href: '/rent', desc: 'Book Omega Mansion' },
  { label: 'Merch', href: '/merch', desc: 'Shop official apparel' },
  { label: 'Partner With Us', href: '/partners', desc: 'Sponsorship opportunities' },
  { label: 'Blog', href: '/blog', desc: 'Articles & updates' },
  { label: 'Member Login', href: '/login', desc: 'Members & alumni' },
];

export default function LinksPage() {
  return (
    <div className="relative bg-[#080a0f] text-white min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4">
        <Link href="/" className="text-white/30 hover:text-white/60 text-[11px] uppercase tracking-[0.15em] transition-colors">
          Home
        </Link>
        <Link href="/contact" className="text-white/30 hover:text-white/60 text-[11px] uppercase tracking-[0.15em] transition-colors">
          Contact
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-10 max-w-md mx-auto w-full">
        {/* Profile */}
        <Image src="/images/omega-logo.jpg" alt="Houston Omegas" width={80} height={80} className="rounded-full mb-4" />
        <h1 className="text-xl font-bold tracking-[0.06em] mb-1" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Houston Omegas
        </h1>
        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Est. 2004 &middot; Houston, TX</p>
        <p className="text-white/30 text-xs flex items-center gap-1 mb-6">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
          Houston, Texas
        </p>

        {/* Social icons */}
        <div className="flex items-center gap-4 mb-10">
          {socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-white/40 hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">{s.icon}</svg>
            </a>
          ))}
        </div>

        {/* Link buttons */}
        <div className="w-full space-y-3">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={`block w-full border rounded-xl px-5 py-4 transition-all duration-300 group ${l.external ? 'border-green-500/30 hover:border-green-400/50 bg-green-500/[0.05] hover:bg-green-500/[0.1]' : 'border-white/[0.1] hover:border-white/[0.2] bg-white/[0.02] hover:bg-white/[0.05]'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm font-semibold group-hover:text-white transition-colors">{l.label}</p>
                  <p className="text-white/30 text-[11px] mt-0.5">{l.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all shrink-0"><path d="M9 18l6-6-6-6" /></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 space-y-2">
        <p className="text-white/15 text-[10px] tracking-[0.25em] uppercase">Houston Omegas &middot; Est. 2004</p>
        <p className="text-white/10 text-[10px] tracking-wider">&copy; {new Date().getFullYear()} Houston Omegas</p>
      </footer>
    </div>
  );
}
