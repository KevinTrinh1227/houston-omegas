'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';
import { Instagram, Youtube, Facebook, Twitter, Globe, Mail, Phone, ArrowLeft } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  category: string;
  tier: string;
  website_url: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  facebook: string | null;
  youtube: string | null;
  email: string | null;
  phone: string | null;
  images: string;
}

const tierBadge: Record<string, string> = {
  gold: 'bg-amber-100 text-amber-700 border-amber-200',
  silver: 'bg-gray-100 text-gray-600 border-gray-200',
  bronze: 'bg-orange-100 text-orange-700 border-orange-200',
  community: 'bg-blue-100 text-blue-700 border-blue-200',
};

function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try { return ['http:', 'https:'].includes(new URL(url).protocol); } catch { return false; }
}

const categoryBadge: Record<string, string> = {
  sponsor: 'bg-green-50 text-green-700',
  affiliate: 'bg-purple-50 text-purple-700',
  organization: 'bg-blue-50 text-blue-700',
  vendor: 'bg-orange-50 text-orange-700',
};

function PartnerProfileContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/partners/${slug}`)
      .then(res => {
        if (!res.ok) { setNotFound(true); setLoading(false); return null; }
        return res.json();
      })
      .then((data: Partner | null) => {
        if (data) setPartner(data);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  // Dynamic SEO: document title + OG meta tags
  useEffect(() => {
    if (!partner) return;
    document.title = `${partner.name} | Partners | Houston Omegas`;
    const metaTags: Record<string, string> = {
      'og:title': `${partner.name} | Houston Omegas Partner`,
      'og:description': partner.description || `${partner.name} — a Houston Omegas partner`,
      'og:image': partner.logo_url || '',
      'og:type': 'website',
      'og:url': `https://houstonomegas.com/partners/profile?slug=${partner.slug}`,
      'description': partner.description || `${partner.name} — a Houston Omegas partner`,
    };
    const cleanup: HTMLMetaElement[] = [];
    Object.entries(metaTags).forEach(([key, value]) => {
      if (!value) return;
      const attr = key.startsWith('og:') ? 'property' : 'name';
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
        cleanup.push(el);
      }
      el.setAttribute('content', value);
    });
    return () => {
      document.title = 'Houston Omegas';
      cleanup.forEach(el => el.remove());
    };
  }, [partner]);

  const images: string[] = partner ? JSON.parse(partner.images || '[]') : [];

  const socials = partner ? [
    partner.instagram && { label: 'Instagram', url: partner.instagram.startsWith('http') ? partner.instagram : `https://instagram.com/${partner.instagram.replace('@', '')}`, icon: <Instagram size={18} /> },
    partner.tiktok && { label: 'TikTok', url: partner.tiktok.startsWith('http') ? partner.tiktok : `https://tiktok.com/@${partner.tiktok.replace('@', '')}`, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
    partner.twitter && { label: 'Twitter/X', url: partner.twitter.startsWith('http') ? partner.twitter : `https://x.com/${partner.twitter.replace('@', '')}`, icon: <Twitter size={18} /> },
    partner.facebook && { label: 'Facebook', url: partner.facebook.startsWith('http') ? partner.facebook : `https://facebook.com/${partner.facebook}`, icon: <Facebook size={18} /> },
    partner.youtube && { label: 'YouTube', url: partner.youtube.startsWith('http') ? partner.youtube : `https://youtube.com/${partner.youtube}`, icon: <Youtube size={18} /> },
  ].filter(Boolean) as { label: string; url: string; icon: React.ReactNode }[] : [];

  if (loading) {
    return (
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gray-100" />
              <div>
                <div className="h-6 bg-gray-100 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-32" />
              </div>
            </div>
            <div className="h-24 bg-gray-100 rounded-xl" />
          </div>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    );
  }

  if (notFound || !partner) {
    return (
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto text-center">
          <p className="text-gray-400 text-lg mb-4">Partner not found</p>
          <Link href="/partners" className="text-gray-600 text-sm hover:underline">Back to Partners</Link>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar variant="light" />

      <div className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto">
        {/* Back link */}
        <Link href="/partners" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-xs uppercase tracking-wider mb-8 transition-colors">
          <ArrowLeft size={14} />
          Back to Partners
        </Link>

        {/* Hero */}
        <div className="flex items-center gap-6 mb-8">
          {partner.logo_url ? (
            <Image src={partner.logo_url} alt={partner.name} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold">
              {partner.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl text-gray-900 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              {partner.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase ${categoryBadge[partner.category] || 'bg-gray-100 text-gray-600'}`}>
                {partner.category}
              </span>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase border ${tierBadge[partner.tier] || 'bg-gray-100 text-gray-600'}`}>
                {partner.tier} Tier
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {partner.description && (
          <div className="mb-8">
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{partner.description}</p>
          </div>
        )}

        {/* Socials + contact */}
        {(socials.length > 0 || partner.website_url || partner.email || partner.phone) && (
          <div className="flex items-center gap-4 flex-wrap mb-8">
            {socials.map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-gray-400 hover:text-gray-700 transition-colors">
                {s.icon}
              </a>
            ))}
            {partner.email && (
              <a href={`mailto:${partner.email}`} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Email">
                <Mail size={18} />
              </a>
            )}
            {partner.phone && (
              <a href={`tel:${partner.phone}`} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Phone">
                <Phone size={18} />
              </a>
            )}
          </div>
        )}

        {/* Website button */}
        {isSafeUrl(partner.website_url) && (
          <a href={partner.website_url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-all mb-10">
            <Globe size={14} />
            Visit Website
          </a>
        )}

        {/* Photo gallery */}
        {images.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image src={img} alt={`${partner.name} photo ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer variant="light" />

      {/* Schema.org structured data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: partner.name,
        description: partner.description || undefined,
        url: partner.website_url || undefined,
        logo: partner.logo_url || undefined,
        sameAs: [
          partner.instagram && (partner.instagram.startsWith('http') ? partner.instagram : `https://instagram.com/${partner.instagram.replace('@', '')}`),
          partner.tiktok && (partner.tiktok.startsWith('http') ? partner.tiktok : `https://tiktok.com/@${partner.tiktok.replace('@', '')}`),
          partner.twitter && (partner.twitter.startsWith('http') ? partner.twitter : `https://x.com/${partner.twitter.replace('@', '')}`),
          partner.facebook && (partner.facebook.startsWith('http') ? partner.facebook : `https://facebook.com/${partner.facebook}`),
          partner.youtube && (partner.youtube.startsWith('http') ? partner.youtube : `https://youtube.com/${partner.youtube}`),
        ].filter(Boolean),
      })}} />
    </PageWrapper>
  );
}

export default function PartnerProfilePage() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gray-100" />
              <div><div className="h-6 bg-gray-100 rounded w-48 mb-2" /><div className="h-4 bg-gray-100 rounded w-32" /></div>
            </div>
            <div className="h-24 bg-gray-100 rounded-xl" />
          </div>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    }>
      <PartnerProfileContent />
    </Suspense>
  );
}
