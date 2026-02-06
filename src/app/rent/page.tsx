import type { Metadata } from 'next';
import Image from 'next/image';
import { MapPin, Mail, Clock, Check, Play } from 'lucide-react';
import { FaInstagram, FaTiktok, FaFacebookF, FaPinterestP, FaLinkedinIn, FaThreads } from 'react-icons/fa6';
import InquiryForm from '@/components/InquiryForm';
import SchemaMarkup from '@/components/SchemaMarkup';

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

function Logo({ size = 'default' }: { size?: 'default' | 'small' }) {
  const s = size === 'small' ? 24 : 32;
  return (
    <Image src="/images/omega-logo.jpg" alt="Omega Mansion" width={s} height={s} className={`${size === 'small' ? 'w-6 h-6' : 'w-8 h-8'} rounded-[4px] shrink-0 object-cover`} />
  );
}

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
  { q: 'How far in advance should I book?', a: 'We recommend 2\u20134 weeks ahead. Popular weekend dates fill up faster.' },
  { q: 'Is cleaning included?', a: 'Optional add-on. Without it, renters handle cleanup after the event.' },
  { q: 'Can I bring my own decorations?', a: 'Absolutely. You\u2019re free to decorate however you like. We just ask that everything is removed afterward.' },
];

const pastClients = [
  { name: 'Secret Society Party', abbr: 'SS', url: 'https://linktr.ee/secretsocietyusa' },
  { name: 'UH VSA', abbr: 'VSA', url: 'https://www.uhvsa.com/' },
  { name: 'Sigma Phi Omega', abbr: 'ΣΦΩ', url: 'https://uhsigmasweb.wixsite.com/mysite' },
  { name: 'Sigma Alpha Epsilon', abbr: 'ΣAE', url: '#' },
];

const socials = [
  { icon: FaInstagram, color: '#E4405F', url: '#', label: 'Instagram' },
  { icon: FaTiktok, color: '#000000', url: '#', label: 'TikTok' },
  { icon: FaFacebookF, color: '#1877F2', url: '#', label: 'Facebook' },
  { icon: FaPinterestP, color: '#BD081C', url: '#', label: 'Pinterest' },
  { icon: FaLinkedinIn, color: '#0A66C2', url: '#', label: 'LinkedIn' },
  { icon: FaThreads, color: '#000000', url: '#', label: 'Threads' },
];

export default function RentPage() {
  return (
    <>
      <SchemaMarkup />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#eee]">
        {/* Desktop */}
        <div className="max-w-6xl mx-auto px-6 h-16 items-center hidden lg:grid grid-cols-[1fr_auto_1fr]">
          <a href="https://houstonomegas.com" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[#1a1a1a] font-semibold tracking-[0.06em] text-[13px] uppercase">Houston Omegas</span>
          </a>
          <div className="flex items-center gap-8">
            <a href="#venue" className="text-[13px] text-[#555] font-medium hover:text-[#1a1a1a] transition-colors">Rent</a>
            <a href="#gallery" className="text-[13px] text-[#555] font-medium hover:text-[#1a1a1a] transition-colors">Gallery</a>
            <a href="#faq" className="text-[13px] text-[#555] font-medium hover:text-[#1a1a1a] transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-5 justify-end">
            <a href="#contact" className="text-[13px] text-[#555] font-medium hover:text-[#1a1a1a] transition-colors">Contact</a>
            <a href="#contact" className="btn-primary !py-2 !px-5 !text-[10px]">Book Now</a>
          </div>
        </div>
        {/* Mobile */}
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between lg:hidden">
          <a href="https://houstonomegas.com" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[#1a1a1a] font-semibold tracking-[0.06em] text-[13px] uppercase">Houston Omegas</span>
          </a>
          <a href="#contact" className="btn-primary !py-1.5 !px-4 !text-[10px]">Book Now</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[90vh] flex items-center justify-center pt-16">
        <div className="text-center px-6 max-w-3xl mx-auto py-24">
          <p className="text-[#1a1a1a] text-xs tracking-[0.25em] uppercase mb-8 font-semibold">
            Private Event Venue &middot; Houston, TX
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1a1a1a] mb-6 tracking-tight leading-[1.1]">
            Omega Mansion
          </h1>
          <p className="text-[#555] text-lg sm:text-xl mb-10 leading-relaxed max-w-xl mx-auto">
            5,300 sq ft of flexible event space for parties, corporate events, weddings, and more.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <a href="#contact" className="btn-primary text-center inline-flex items-center justify-center gap-2">Book Now</a>
            <a href="#contact" className="btn-outline text-center inline-flex items-center justify-center gap-2 rounded-lg">Check Availability</a>
          </div>
          <p className="text-[#888] text-sm mb-20">
            <MapPin className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
            3819 Reveille St, Houston, TX 77087
          </p>

          {/* Past Clients */}
          <div className="pt-4">
            <p className="text-[#999] text-xs tracking-[0.15em] uppercase font-medium mb-6">Recent clients we&apos;ve hosted</p>
            <div className="flex items-center justify-center gap-8 sm:gap-12 whitespace-nowrap overflow-x-auto">
              {pastClients.map((client) => (
                <a key={client.name} href={client.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 shrink-0 hover:opacity-70 transition-opacity">
                  <div className="w-7 h-7 bg-[#1a1a1a] rounded-[4px] flex items-center justify-center shrink-0">
                    <span className="text-white text-[8px] font-bold leading-none">{client.abbr}</span>
                  </div>
                  <span className="text-[#555] text-sm font-medium">{client.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About / Video */}
      <section id="about" className="scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-5">About Omega Mansion</h2>
              <p className="text-[#555] leading-relaxed mb-6">
                Located in Houston&apos;s Golfcrest neighborhood &mdash; just minutes from the University of Houston &mdash; Omega Mansion offers a versatile event space perfect for any occasion.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-2xl font-bold text-[#1a1a1a]">5,300</p>
                  <p className="text-[#999] text-xs uppercase tracking-wider">Sq Ft</p>
                </div>
                <div className="w-px h-10 bg-[#e5e5e5]" />
                <div>
                  <p className="text-2xl font-bold text-[#1a1a1a]">500</p>
                  <p className="text-[#999] text-xs uppercase tracking-wider">Guest Capacity</p>
                </div>
                <div className="w-px h-10 bg-[#e5e5e5]" />
                <div>
                  <p className="text-2xl font-bold text-[#1a1a1a]">7</p>
                  <p className="text-[#999] text-xs uppercase tracking-wider">Days / Week</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-video bg-[#e8e5de] rounded-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-[#1a1a1a] ml-1" fill="#1a1a1a" />
                </div>
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-[#999] text-xs">Video coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Venue */}
      <section id="venue" className="scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-24 space-y-20">
          {/* Row 1: Text + Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-[#1a1a1a]">Everything You Need</h2>
              <p className="text-[#555] mb-8 leading-relaxed">
                The entire first floor of Omega Mansion is yours to rent. Multiple connected rooms create a natural flow &mdash; set up a dining area, a dance floor, a lounge, or whatever your event needs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {amenities.map((item) => (
                  <div key={item} className="flex items-center gap-3 py-1.5">
                    <Check className="w-4 h-4 text-[#c9a96e] shrink-0" />
                    <span className="text-sm text-[#444] font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#e8e5de] rounded-lg min-h-[320px]" />
          </div>

          {/* Row 2: Image + Text */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-[#e8e5de] rounded-lg min-h-[320px] order-last lg:order-first" />
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-[#1a1a1a]">Any Occasion</h2>
              <p className="text-[#555] leading-relaxed">
                We welcome events of every kind &mdash; from student organizations and Greek life to corporate retreats, weddings, graduation parties, baby showers, and everything in between. If you&apos;re planning a gathering of 20 or 500, the flexible layout adapts to fit your vision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a]">See the Space</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[180px] md:auto-rows-[200px]">
            <div className="col-span-2 row-span-2 bg-[#e8e5de] rounded-lg" />
            <div className="bg-[#ddd9d0] rounded-lg" />
            <div className="bg-[#f0ede8] rounded-lg" />
            <div className="bg-[#e2dfd8] rounded-lg" />
            <div className="bg-[#ebe8e2] rounded-lg" />
            <div className="bg-[#d8d4cb] rounded-lg" />
            <div className="bg-[#e5e2dc] rounded-lg col-span-2" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a]">Common Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">{faq.q}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#1a1a1a]">Find Us</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#c9a96e] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">3819 Reveille St</p>
                    <p className="text-[#888]">Houston, TX 77087</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#c9a96e] shrink-0" />
                  <a href="mailto:events@houstonomegas.com" className="text-[#555] font-medium hover:text-[#c9a96e] transition-colors">events@houstonomegas.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#c9a96e] shrink-0" />
                  <span className="text-[#555] font-medium">Events: 8 AM &ndash; 11 PM daily</span>
                </div>
              </div>
              <p className="text-[#999] text-xs mt-8 leading-relaxed">
                Located in Houston&apos;s Golfcrest neighborhood, minutes from the University of Houston and downtown via I-45 and I-610.
              </p>
            </div>
            <div className="lg:col-span-3">
              <div className="w-full h-[350px] lg:h-full min-h-[300px] overflow-hidden rounded-lg">
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
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-3">Contact Us</h2>
            <p className="text-[#888] text-sm">
              Tell us about your event and we&apos;ll respond within 24 hours.
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-10 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <a href="https://houstonomegas.com" className="flex items-center gap-2.5">
              <Logo size="small" />
              <span className="font-semibold text-sm tracking-[0.05em] uppercase text-[#444]">Houston Omegas</span>
            </a>
            <p className="text-xs text-[#aaa]">3819 Reveille St, Houston, TX 77087</p>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70" style={{ backgroundColor: s.color }}>
                  <s.icon className="w-3.5 h-3.5 text-white" />
                </a>
              ))}
            </div>
            <p className="text-xs text-[#aaa]">
              &copy; {new Date().getFullYear()} Houston Omegas &middot; Powered by{' '}
              <a href="https://visibleseed.com" target="_blank" rel="noopener noreferrer" className="hover:underline">VisibleSeed</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
