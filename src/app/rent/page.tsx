import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchemaMarkup from '@/components/SchemaMarkup';
import PageWrapper from '@/components/PageWrapper';

export const metadata: Metadata = {
  title: 'Rent Omega Mansion | Event Venue in Houston, TX',
  description: 'Rent the Omega Mansion for your next event. 5,300 sq ft private venue in Houston, TX for parties, corporate events, weddings, and more.',
  keywords: ['Houston event venue', 'mansion rental Houston', 'party venue Houston TX', 'Omega Mansion', 'venue rental Houston', 'wedding venue Houston', 'corporate event space Houston', 'baby shower venue Houston', 'private event venue Houston TX', 'event hall Houston', 'birthday party venue Houston', 'Golfcrest venue rental'],
  alternates: { canonical: 'https://houstonomegas.com/rent' },
  openGraph: {
    title: 'Rent Omega Mansion | Event Venue in Houston, TX',
    description: 'Rent the Omega Mansion for your next event. 5,300 sq ft private venue in Houston, TX.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Houston Omegas',
    url: 'https://houstonomegas.com/rent',
    images: [{ url: 'https://houstonomegas.com/images/mansion.jpeg', width: 1024, height: 576, alt: 'Omega Mansion' }],
  },
};

const amenities = [
  'Full kitchen for catering',
  'Climate control (A/C & heat)',
  'Limited on-site parking',
  'Tables & chairs included',
  'Decorations welcome',
  'Restroom available',
  'Wi-Fi access',
  'First floor only (no stairs)',
];

const faqs = [
  { q: 'Can I bring my own catering?', a: 'Yes. Outside catering is welcome and our full kitchen is available for your caterer to use.' },
  { q: 'What are the venue hours?', a: 'Events can run from 8 AM to 11 PM, seven days a week.' },
  { q: 'Is there a security deposit?', a: 'Yes, a refundable deposit is required at booking and returned after your event.' },
  { q: 'How far in advance should I book?', a: 'We recommend 2-4 weeks ahead. Popular weekend dates fill up faster.' },
  { q: 'Is cleaning included?', a: 'Optional add-on. Without it, renters handle cleanup after the event.' },
  { q: 'Can I bring my own decorations?', a: 'Absolutely. You are free to decorate however you like. We just ask that everything is removed afterward.' },
];

const pastClients = [
  { name: 'Secret Society', abbr: 'SS' },
  { name: 'UH VSA', abbr: 'VSA' },
  { name: 'ΣΦΩ', abbr: 'ΣΦΩ' },
  { name: 'ΣAE', abbr: 'ΣAE' },
];

const galleryImages = [
  { src: '/images/gallery-5.jpg', alt: 'Event Setup', span: 'col-span-2 row-span-2' },
  { src: '/images/gallery-3.jpg', alt: 'Outdoor', span: '' },
  { src: '/images/gallery-4.jpg', alt: 'Night Event', span: '' },
  { src: '/images/gallery-6.jpg', alt: 'Festival', span: '' },
  { src: '/images/mansion.jpeg', alt: 'Omega Mansion', span: '' },
  { src: '/images/gallery-2.jpg', alt: 'Gathering', span: 'col-span-2' },
];

export default function RentPage() {
  return (
    <PageWrapper>
      <SchemaMarkup />
      <Navbar variant="light" />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 sm:px-10 max-w-4xl mx-auto text-center">
        <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-4">Private Event Venue &middot; Houston, TX</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-5 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Omega Mansion
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
          5,300 sq ft of flexible event space for parties, corporate events, weddings, and more.
        </p>
        <div className="flex items-center justify-center gap-4 mb-10">
          <Link href="/contact" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-7 py-3 rounded-lg hover:bg-gray-800 transition-all">
            Book Now
          </Link>
          <Link href="/contact" className="border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 text-[11px] uppercase tracking-[0.15em] px-7 py-3 rounded-lg transition-all">
            Check Availability
          </Link>
        </div>
        <p className="text-gray-400 text-xs flex items-center justify-center gap-1.5 mb-12">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
          3819 Reveille St, Houston, TX 77087
        </p>

        {/* Past Clients */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-gray-300 text-[10px] uppercase tracking-[0.2em] mb-5">Recent clients we&apos;ve hosted</p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {pastClients.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-[8px] font-bold">{c.abbr}</span>
                </div>
                <span className="text-gray-400 text-xs font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      {/* About */}
      <section className="py-24 px-6 sm:px-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl text-gray-900 mb-5 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              About the Venue
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Located in Houston&apos;s Golfcrest neighborhood, just minutes from the University of Houston. Omega Mansion offers a versatile event space perfect for any occasion.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-2xl font-bold text-gray-900">5,300</p>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Sq Ft</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-gray-900">500</p>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Guest Capacity</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-gray-900">7</p>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Days / Week</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200">
            <Image src="/images/mansion.jpeg" alt="Omega Mansion" fill className="object-cover" />
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      {/* Amenities */}
      <section className="py-24 px-6 sm:px-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl text-gray-900 mb-5 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              Everything You Need
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              The entire first floor of Omega Mansion is yours to rent. Multiple connected rooms create a natural flow. Set up a dining area, a dance floor, a lounge, or whatever your event needs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {amenities.map((item) => (
                <div key={item} className="flex items-center gap-3 py-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#B2BEB5] shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200">
            <Image src="/images/gallery-1.jpg" alt="Interior" fill className="object-cover" />
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      {/* Gallery */}
      <section id="gallery" className="py-24 px-6 sm:px-10 max-w-6xl mx-auto">
        <h2 className="text-center text-3xl sm:text-4xl text-gray-900 mb-10 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          See the Space
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 auto-rows-[180px] md:auto-rows-[200px]">
          {galleryImages.map((img, i) => (
            <div key={i} className={`relative overflow-hidden rounded-lg ${img.span}`}>
              <Image src={img.src} alt={img.alt} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 sm:px-10 max-w-5xl mx-auto">
        <h2 className="text-center text-3xl sm:text-4xl text-gray-900 mb-12 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Common Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          {faqs.map((faq) => (
            <div key={faq.q} className="border-b border-gray-200 pb-6">
              <h3 className="text-gray-800 text-sm font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      {/* Location */}
      <section className="py-24 px-6 sm:px-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl sm:text-4xl text-gray-900 mb-6 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              Find Us
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#B2BEB5] shrink-0 mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <div>
                  <p className="font-semibold text-gray-800">3819 Reveille St</p>
                  <p className="text-gray-500">Houston, TX 77087</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#B2BEB5] shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="m22 6-10 7L2 6" /></svg>
                <a href="mailto:events@houstonomegas.com" className="text-gray-600 hover:text-gray-900 transition-colors">events@houstonomegas.com</a>
              </div>
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#B2BEB5] shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                <span className="text-gray-600">Events: 8 AM - 11 PM daily</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-8 leading-relaxed">
              Located in Houston&apos;s Golfcrest neighborhood, minutes from the University of Houston and downtown via I-45 and I-610.
            </p>
          </div>
          <div className="lg:col-span-3">
            <div className="w-full h-[350px] lg:h-full min-h-[300px] overflow-hidden rounded-xl border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3465.5!2d-95.317!3d29.692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640bf5a65b7b42d%3A0x0!2zMzgxOSBSZXZlaWxsZSBTdCwgSG91c3RvbiwgVFggNzcwODc!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Omega Mansion - 3819 Reveille St, Houston, TX 77087"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </PageWrapper>
  );
}
