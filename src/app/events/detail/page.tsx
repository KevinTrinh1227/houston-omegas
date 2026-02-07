'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';
import { Calendar, MapPin, Clock, Ticket, ArrowLeft, ExternalLink, ShieldCheck, Users, Car, Phone, ChevronDown } from 'lucide-react';

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_type: string;
  location: string | null;
  address: string | null;
  map_url: string | null;
  start_time: string;
  end_time: string | null;
  flyer_url: string | null;
  cover_url: string | null;
  age_requirement: string | null;
  dress_code: string | null;
  ticket_url: string | null;
  ticket_price: string | null;
  rules: string | null;
  faq: string | null;
  disclaimer: string | null;
  capacity: string | null;
  parking_info: string | null;
  contact_info: string | null;
}

function useCountdown(targetTime: number) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);
  return timeLeft;
}

const typeLabel: Record<string, string> = {
  social: 'Party', rush: 'Rush', philanthropy: 'Philanthropy',
  community_service: 'Community Service', brotherhood: 'Brotherhood',
  general: 'Event', chapter: 'Chapter', other: 'Event',
};

function formatDateTime(date: string) {
  const d = new Date(date + 'Z');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateShort(date: string) {
  return new Date(date + 'Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch { return false; }
}

function EventDetailContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/events/public?slug=${slug}`)
      .then(res => {
        if (!res.ok) { setNotFound(true); setLoading(false); return null; }
        return res.json();
      })
      .then((data: EventDetail | null) => {
        if (data) setEvent(data);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  const startMs = useMemo(() => event ? new Date(event.start_time + 'Z').getTime() : 0, [event]);
  const countdown = useCountdown(startMs);
  const isPast = event ? new Date(event.start_time + 'Z') < new Date() : false;
  const isToday = event ? new Date(event.start_time + 'Z').toDateString() === new Date().toDateString() : false;
  const rules: string[] = event?.rules ? (() => { try { return JSON.parse(event.rules); } catch { return []; } })() : [];
  const faq: { q: string; a: string }[] = event?.faq ? (() => { try { return JSON.parse(event.faq); } catch { return []; } })() : [];

  // Google Maps embed URL from address (validated)
  const rawMapUrl = event?.map_url || (event?.address ? `https://www.google.com/maps?q=${encodeURIComponent(event.address)}&output=embed` : null);
  const mapsEmbedUrl = isSafeUrl(rawMapUrl) ? rawMapUrl : null;

  if (loading) {
    return (
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="aspect-[2/3] sm:aspect-[3/4] max-w-sm bg-gray-100 rounded-2xl" />
            <div className="h-8 bg-gray-100 rounded w-64" />
            <div className="h-4 bg-gray-100 rounded w-48" />
          </div>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    );
  }

  if (notFound || !event) {
    return (
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto text-center">
          <p className="text-gray-400 text-lg mb-4">Event not found</p>
          <Link href="/events" className="text-gray-600 text-sm hover:underline">Back to Events</Link>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar variant="light" />

      <div className="pt-28 pb-20 px-6 sm:px-10 max-w-4xl mx-auto">
        {/* Back */}
        <Link href="/events" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-xs uppercase tracking-wider mb-8 transition-colors">
          <ArrowLeft size={14} />
          All Events
        </Link>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 mb-12">
          {/* Flyer */}
          <div>
            {event.flyer_url ? (
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gray-200">
                <Image src={event.flyer_url} alt={event.title} fill className="object-cover" priority />
              </div>
            ) : event.cover_url ? (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-gray-200">
                <Image src={event.cover_url} alt={event.title} fill className="object-cover" priority />
              </div>
            ) : null}
          </div>

          {/* Info */}
          <div>
            {/* Status + Type badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">
                {typeLabel[event.event_type] || 'Event'}
              </span>
              {isPast ? (
                <span className="text-[10px] bg-gray-900 text-white px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">
                  Event Ended
                </span>
              ) : isToday ? (
                <span className="text-[10px] bg-green-500 text-white px-2.5 py-1 rounded-full font-medium uppercase tracking-wider animate-pulse">
                  Today
                </span>
              ) : (
                <span className="text-[10px] bg-blue-500 text-white px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">
                  Upcoming
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl text-gray-900 mb-3 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              {event.title}
            </h1>

            {/* Countdown (if upcoming) */}
            {!isPast && (
              <div className="grid grid-cols-4 gap-2 mb-6 max-w-xs">
                {[
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hrs' },
                  { value: countdown.minutes, label: 'Min' },
                  { value: countdown.seconds, label: 'Sec' },
                ].map(u => (
                  <div key={u.label} className="text-center">
                    <div className="bg-gray-900 text-white rounded-lg py-2.5">
                      <span className="text-lg font-semibold tabular-nums">{String(u.value).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider mt-1 block">{u.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-900 font-medium">{formatDateTime(event.start_time)}</p>
                  {event.end_time && <p className="text-xs text-gray-400 mt-0.5">Ends: {formatDateShort(event.end_time)}</p>}
                </div>
              </div>
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900">{event.location}</p>
                    {event.address && <p className="text-xs text-gray-400">{event.address}</p>}
                  </div>
                </div>
              )}
              {event.age_requirement && (
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-600">{event.age_requirement}</p>
                </div>
              )}
              {event.dress_code && (
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-600">Dress code: {event.dress_code}</p>
                </div>
              )}
              {event.capacity && (
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-600">Capacity: {event.capacity}</p>
                </div>
              )}
              {event.ticket_price && (
                <div className="flex items-center gap-3">
                  <Ticket size={16} className="text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-600">{event.ticket_price}</p>
                </div>
              )}
              {event.parking_info && (
                <div className="flex items-start gap-3">
                  <Car size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">{event.parking_info}</p>
                </div>
              )}
              {event.contact_info && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-600">{event.contact_info}</p>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {isSafeUrl(event.ticket_url) && !isPast && (
                <a href={event.ticket_url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-all">
                  <Ticket size={14} />
                  Get Tickets
                </a>
              )}
              {event.address && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:border-gray-300 transition-all">
                  <ExternalLink size={14} />
                  Directions
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Event</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* Map */}
        {mapsEmbedUrl && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
            <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-[16/9]">
              <iframe
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Event location"
              />
            </div>
            {event.address && <p className="text-xs text-gray-400 mt-2">{event.address}</p>}
          </div>
        )}

        {/* Rules */}
        {rules.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rules &amp; Guidelines</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <ul className="space-y-2.5">
                {rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faq.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {event.disclaimer && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Disclaimer</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">{event.disclaimer}</p>
            </div>
          </div>
        )}
      </div>

      <Footer variant="light" />

      {/* Schema.org structured data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.description || `${event.title} hosted by Houston Omegas`,
        startDate: event.start_time,
        endDate: event.end_time || undefined,
        eventStatus: isPast ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: event.address ? {
          '@type': 'Place',
          name: event.location || undefined,
          address: event.address,
        } : undefined,
        image: event.flyer_url || event.cover_url || undefined,
        organizer: {
          '@type': 'Organization',
          name: 'Houston Omegas',
          url: 'https://houstonomegas.com',
        },
        offers: event.ticket_price ? {
          '@type': 'Offer',
          price: event.ticket_price,
          url: event.ticket_url || undefined,
        } : undefined,
      })}} />
    </PageWrapper>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="aspect-[3/4] max-w-sm bg-gray-100 rounded-2xl" />
          </div>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    }>
      <EventDetailContent />
    </Suspense>
  );
}
