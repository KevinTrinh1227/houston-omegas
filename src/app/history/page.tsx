import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'History',
  description: 'The history of Houston Omegas, from founding to today.',
};

const timeline = [
  { year: '2004', title: 'Houston Omegas Founded', desc: 'Houston Omegas is established in Houston, Texas as a brotherhood committed to personal growth, cultural awareness, and community service.' },
  { year: '2008', title: 'Growing Roots', desc: 'The brotherhood grows its membership and begins hosting annual events that become staples of the Houston community.' },
  { year: '2015', title: 'Community Impact', desc: 'Houston Omegas expands philanthropic efforts with regular community service events, beach cleanups, and cultural festivals across the Houston area.' },
  { year: '2020', title: 'Omega Mansion', desc: 'The brotherhood acquires Omega Mansion, a 5,300 sq ft house in Houston\'s Golfcrest neighborhood, establishing a permanent home and event venue.' },
  { year: '2024', title: '20th Anniversary', desc: 'Houston Omegas celebrates 20 years of brotherhood, marking two decades of impact in the Houston community with a special Founders Day celebration.' },
  { year: '2026', title: 'The Future', desc: 'Continuing to grow with new initiatives, expanded partnerships, and the next generation of brothers committed to the values of Houston Omegas.' },
];

export default function HistoryPage() {
  return (
    <div className="relative bg-white text-gray-900 min-h-screen">
      <Navbar variant="light" />

      <section className="pt-28 pb-10 px-6 sm:px-10 max-w-3xl mx-auto text-center">
        <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-3">Est. 2004</p>
        <h1 className="text-3xl sm:text-4xl mb-4 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Our History
        </h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          A timeline of brotherhood, growth, and impact in Houston.
        </p>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6 sm:px-10 max-w-3xl mx-auto">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gray-200" />

          <div className="space-y-12">
            {timeline.map((item, i) => (
              <div key={item.year} className="relative pl-16">
                {/* Dot */}
                <div className={`absolute left-[16px] top-1 w-[15px] h-[15px] rounded-full border-2 ${i === timeline.length - 1 ? 'border-gray-400 bg-gray-100' : 'border-gray-300 bg-white'}`} />
                {/* Year */}
                <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase">{item.year}</span>
                <h3 className="text-gray-800 text-lg font-semibold mt-1 mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
