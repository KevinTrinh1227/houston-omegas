'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface Announcement {
  id: number;
  title: string;
  body: string;
  type: string;
  priority: string;
  link_url: string | null;
  link_text: string | null;
  image_url: string | null;
  target_pages: string | null;
  display_mode: string; // 'toast' | 'center' | 'image_only'
}

const priorityAccent: Record<string, string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-400',
  normal: 'border-l-gray-300',
  low: 'border-l-gray-200',
};

export default function AnnouncementPopup() {
  const pathname = usePathname();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [visible, setVisible] = useState<Announcement | null>(null);
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dismissed_announcements');
      if (stored) setDismissed(new Set(JSON.parse(stored)));
    } catch { /* */ }

    fetch('/api/announcements')
      .then(res => res.ok ? res.json() : [])
      .then((data: Announcement[]) => setAnnouncements(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const popups = announcements.filter(a => {
      if (a.type !== 'popup' && a.type !== 'both') return false;
      if (dismissed.has(a.id)) return false;
      if (a.target_pages) {
        try {
          const pages: string[] = JSON.parse(a.target_pages);
          if (pages.length > 0 && !pages.includes(pathname)) return false;
        } catch { /* show on all pages if parse fails */ }
      }
      return true;
    });

    if (popups.length === 0) { setVisible(null); setShow(false); return; }

    const next = popups[0];
    const delay = setTimeout(() => {
      setVisible(next);
      setShow(true);
    }, 2500);

    return () => clearTimeout(delay);
  }, [announcements, dismissed, pathname]);

  // Auto-dismiss after 8s for toast, 12s for center/image_only (unless hovered)
  useEffect(() => {
    if (!show || !visible || hovered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const duration = visible.display_mode === 'toast' ? 8000 : 12000;
    timerRef.current = setTimeout(() => {
      dismiss(visible.id);
    }, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, visible, hovered]);

  const dismiss = (id: number) => {
    setShow(false);
    setTimeout(() => {
      const next = new Set(dismissed);
      next.add(id);
      setDismissed(next);
      setVisible(null);
      try {
        localStorage.setItem('dismissed_announcements', JSON.stringify([...next]));
      } catch { /* */ }
    }, 300);
  };

  if (!visible) return null;

  const mode = visible.display_mode || 'toast';

  // ─── Toast mode (top notification) ───
  if (mode === 'toast') {
    return (
      <div
        className={`fixed z-[70] w-[340px] max-w-[calc(100vw-2rem)] transition-all duration-300 top-4 right-4 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 ${show ? 'animate-[slide-down-in_0.3s_ease-out]' : 'opacity-0 -translate-y-full'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={`bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-xl overflow-hidden border-l-4 ${priorityAccent[visible.priority] || 'border-l-gray-300'}`}>
          {visible.image_url && (
            <div className="relative w-full h-32">
              <Image src={visible.image_url} alt="" fill className="object-cover" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{visible.title}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-3">{visible.body}</p>
              </div>
              <button onClick={() => dismiss(visible.id)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5" aria-label="Dismiss">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            {visible.link_url && (
              <a href={visible.link_url} className="inline-block mt-3 text-[10px] text-gray-900 font-semibold uppercase tracking-wider hover:underline">
                {visible.link_text || 'Learn more'} &rarr;
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Center modal + Image-only modal ───
  const isImageOnly = mode === 'image_only';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => dismiss(visible.id)}
      />

      {/* Modal */}
      <div
        className={`fixed z-[71] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[calc(100vw-2rem)] transition-all duration-300 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isImageOnly && visible.image_url ? (
          /* ─── Image-only: just the image with close + optional CTA ─── */
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => dismiss(visible.id)}
              className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
              aria-label="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            {visible.link_url ? (
              <a href={visible.link_url}>
                <Image src={visible.image_url} alt={visible.title} width={840} height={1120} className="w-full h-auto" />
              </a>
            ) : (
              <Image src={visible.image_url} alt={visible.title} width={840} height={1120} className="w-full h-auto" />
            )}
            {visible.link_url && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                <a href={visible.link_url} className="inline-block bg-white text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-all">
                  {visible.link_text || 'Learn more'}
                </a>
              </div>
            )}
          </div>
        ) : (
          /* ─── Center modal: card with image, title, body, CTA ─── */
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            {visible.image_url && (
              <div className="relative w-full aspect-[16/10]">
                <Image src={visible.image_url} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 leading-tight">{visible.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{visible.body}</p>
                </div>
                <button onClick={() => dismiss(visible.id)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0" aria-label="Dismiss">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              {visible.link_url && (
                <a href={visible.link_url} className="inline-block mt-4 bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">
                  {visible.link_text || 'Learn more'}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
