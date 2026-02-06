import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Merch',
  description: 'Official Houston Omegas merchandise. Hoodies, jerseys, sweats, and more.',
};

const products = [
  { name: 'Classic Hoodie', price: '$55', image: '/images/merch-1.jpg', sizes: 'S - 2XL' },
  { name: 'Varsity Jersey', price: '$75', image: '/images/merch-2.jpg', sizes: 'S - 2XL' },
  { name: 'Sweats', price: '$45', image: '/images/merch-3.jpg', sizes: 'S - 2XL' },
  { name: 'Logo Tee', price: '$30', image: '/images/merch-1.jpg', sizes: 'S - 3XL' },
  { name: 'Dad Hat', price: '$25', image: '/images/merch-2.jpg', sizes: 'One Size' },
  { name: 'Sticker Pack', price: '$10', image: '/images/merch-3.jpg', sizes: 'N/A' },
];

const sizingGuide = [
  { size: 'S', chest: '34-36"', length: '27"' },
  { size: 'M', chest: '38-40"', length: '28"' },
  { size: 'L', chest: '42-44"', length: '29"' },
  { size: 'XL', chest: '46-48"', length: '30"' },
  { size: '2XL', chest: '50-52"', length: '31"' },
  { size: '3XL', chest: '54-56"', length: '32"' },
];

const merchFaqs = [
  { q: 'How do I order?', a: 'Send us a DM on Instagram (@houstonomegas) or reach out through our contact page. Let us know the item, size, and quantity.' },
  { q: 'How do I pay?', a: 'We accept Venmo, Zelle, and Cash App. Payment is sent directly to a Houston Omegas member. We\'ll confirm your order once payment is received.' },
  { q: 'How do I receive my order?', a: 'Orders are fulfilled in person, either at an event, on campus, or a meetup location. We\'ll coordinate delivery details after your order is confirmed.' },
  { q: 'Can I return or exchange?', a: 'All sales are final. Please double-check your size using the sizing guide before ordering.' },
  { q: 'How long does it take?', a: 'Most orders are ready within 1-2 weeks depending on current stock. We\'ll let you know the timeline when you order.' },
  { q: 'Do you ship?', a: 'Currently we only do in-person pickups in the Houston area. We may offer shipping in the future.' },
];

export default function MerchPage() {
  return (
    <div className="relative bg-white text-gray-900 min-h-screen">
      <Navbar variant="light" />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 sm:px-10 max-w-6xl mx-auto">
        <p className="text-center text-xs text-gray-400 uppercase tracking-[0.3em] mb-3">Apparel &amp; Goods</p>
        <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl mb-4 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Merch
        </h1>
        <p className="text-center text-gray-400 text-sm mb-4 max-w-lg mx-auto">
          Rep the brotherhood with official Houston Omegas apparel. All orders are placed through Instagram DMs or our contact page and fulfilled in person.
        </p>
      </section>

      {/* Products */}
      <section className="pb-20 px-6 sm:px-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item, i) => (
            <div key={i} className="group relative">
              <div className="rounded-xl aspect-[3/4] mb-4 overflow-hidden relative bg-gray-100">
                <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 text-sm font-medium">{item.name}</span>
                <span className="text-gray-400 text-sm">{item.price}</span>
              </div>
              <p className="text-gray-300 text-[11px]">{item.sizes}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-10" />

      {/* How to Order */}
      <section className="py-20 px-6 sm:px-10 max-w-4xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl mb-10 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          How to Order
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-500 text-sm font-bold">1</span>
            </div>
            <h3 className="text-gray-700 text-sm font-semibold mb-2">Choose Your Item</h3>
            <p className="text-gray-400 text-[12px] leading-relaxed">Browse the collection above and pick your item and size.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-500 text-sm font-bold">2</span>
            </div>
            <h3 className="text-gray-700 text-sm font-semibold mb-2">Send Payment</h3>
            <p className="text-gray-400 text-[12px] leading-relaxed">DM us on Instagram or contact us. Pay via Venmo, Zelle, or Cash App.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-500 text-sm font-bold">3</span>
            </div>
            <h3 className="text-gray-700 text-sm font-semibold mb-2">Pick Up</h3>
            <p className="text-gray-400 text-[12px] leading-relaxed">We&apos;ll coordinate an in-person pickup at an event or meetup spot.</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          <a href="https://www.instagram.com/houstonomegas/" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-all">
            Instagram DMs
          </a>
          <Link href="/contact" className="border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-900 text-[11px] uppercase tracking-[0.15em] px-6 py-3 rounded-lg transition-all">
            Contact Us
          </Link>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-10" />

      {/* Sizing Guide */}
      <section className="py-20 px-6 sm:px-10 max-w-3xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl mb-10 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Sizing Guide
        </h2>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
            <div className="px-5 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Size</div>
            <div className="px-5 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Chest</div>
            <div className="px-5 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Length</div>
          </div>
          {sizingGuide.map((row) => (
            <div key={row.size} className="grid grid-cols-3 border-b border-gray-100 last:border-0">
              <div className="px-5 py-3 text-sm text-gray-700 font-medium">{row.size}</div>
              <div className="px-5 py-3 text-sm text-gray-400">{row.chest}</div>
              <div className="px-5 py-3 text-sm text-gray-400">{row.length}</div>
            </div>
          ))}
        </div>
        <p className="text-gray-300 text-[11px] text-center mt-4">Measurements are approximate. When in doubt, size up.</p>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-10" />

      {/* FAQ */}
      <section className="py-20 px-6 sm:px-10 max-w-4xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl mb-10 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          FAQ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {merchFaqs.map((faq) => (
            <div key={faq.q} className="border-b border-gray-100 pb-5">
              <h3 className="text-gray-700 text-sm font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
