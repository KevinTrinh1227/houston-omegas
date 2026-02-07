'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';

interface PublicEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_type: string;
  location: string | null;
  address: string | null;
  start_time: string;
  end_time: string | null;
  flyer_url: string | null;
  cover_url: string | null;
  age_requirement: string | null;
  ticket_price: string | null;
}

const typeLabel: Record<string, string> = {
  social: 'Party', rush: 'Rush', philanthropy: 'Philanthropy',
  community_service: 'Community Service', brotherhood: 'Brotherhood',
  general: 'Event', chapter: 'Chapter', other: 'Event',
};

function isPast(date: string) {
  return new Date(date + 'Z') < new Date();
}

function formatDate(date: string) {
  return new Date(date + 'Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    fetch('/api/events/public')
      .then(res => res.ok ? res.json() : [])
      .then((data: PublicEvent[]) => setEvents(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => {
    if (filter === 'upcoming') return !isPast(e.start_time);
    if (filter === 'past') return isPast(e.start_time);
    return true;
  });

  const upcoming = filtered.filter(e => !isPast(e.start_time));
  const past = filtered.filter(e => isPast(e.start_time));

  return (
    <PageWrapper>
      <Navbar variant="light" />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 sm:px-10 max-w-5xl mx-auto text-center">
        <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-3">Parties, Rush Events &amp; More</p>
        <h1 className="text-3xl sm:text-4xl text-gray-900 mb-4 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Events
        </h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          From legendary parties to rush events and community service. Check out what Houston Omegas has going on.
        </p>
      </section>

      {/* Filter */}
      <div className="flex justify-center gap-1 mb-10 px-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'upcoming', 'past'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <section className="px-6 sm:px-10 max-w-5xl mx-auto pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse rounded-2xl border border-gray-200 overflow-hidden">
                <div className="aspect-[3/4] bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No events found.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Events */}
            {upcoming.length > 0 && (
              <div>
                {filter === 'all' && <h2 className="text-xs text-gray-400 uppercase tracking-[0.2em] font-semibold mb-6">Upcoming</h2>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map(e => (
                    <Link key={e.id} href={`/events/detail?slug=${e.slug}`} className="group rounded-2xl border border-gray-200 hover:border-gray-300 overflow-hidden transition-all hover:shadow-lg">
                      <div className="relative aspect-[3/4] bg-gray-100">
                        {e.flyer_url ? (
                          <Image src={e.flyer_url} alt={e.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                        ) : e.cover_url ? (
                          <Image src={e.cover_url} alt={e.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <span className="text-white/20 text-6xl" style={{ fontFamily: 'var(--font-metal-mania), serif' }}>&Omega;</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="text-[10px] bg-white/90 backdrop-blur-sm text-gray-900 px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">
                            {typeLabel[e.event_type] || 'Event'}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors mb-2">{e.title}</h3>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Calendar size={12} />
                            {formatDate(e.start_time)}
                          </div>
                          {e.location && (
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <MapPin size={12} />
                              <span className="truncate">{e.location}</span>
                            </div>
                          )}
                          {e.ticket_price && (
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <Ticket size={12} />
                              {e.ticket_price}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {past.length > 0 && (
              <div>
                {filter === 'all' && <h2 className="text-xs text-gray-400 uppercase tracking-[0.2em] font-semibold mb-6">Past Events</h2>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past.map(e => (
                    <Link key={e.id} href={`/events/detail?slug=${e.slug}`} className="group rounded-2xl border border-gray-200 hover:border-gray-300 overflow-hidden transition-all hover:shadow-lg opacity-70 hover:opacity-100">
                      <div className="relative aspect-[3/4] bg-gray-100">
                        {e.flyer_url ? (
                          <Image src={e.flyer_url} alt={e.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : e.cover_url ? (
                          <Image src={e.cover_url} alt={e.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-300 text-6xl" style={{ fontFamily: 'var(--font-metal-mania), serif' }}>&Omega;</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="text-[10px] bg-black/70 text-white px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">
                            Past Event
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">{e.title}</h3>
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Clock size={12} />
                          {formatDate(e.start_time)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer variant="light" />

      {/* Schema.org structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Houston Omegas Events',
        description: 'Parties, rush events, and community events hosted by Houston Omegas fraternity.',
        url: 'https://houstonomegas.com/events',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: events.length,
        },
      })}} />
    </PageWrapper>
  );
}
