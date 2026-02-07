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
    // Load dismissed from localStorage
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
      // Check target_pages
      if (a.target_pages) {
        try {
          const pages: string[] = JSON.parse(a.target_pages);
          if (pages.length > 0 && !pages.includes(pathname)) return false;
        } catch { /* show on all pages if parse fails */ }
      }
      return true;
    });

    if (popups.length === 0) { setVisible(null); setShow(false); return; }

    // Show highest priority first (already sorted by API)
    const next = popups[0];
    const delay = setTimeout(() => {
      setVisible(next);
      setShow(true);
    }, 2500);

    return () => clearTimeout(delay);
  }, [announcements, dismissed, pathname]);

  // Auto-dismiss after 8 seconds unless hovered
  useEffect(() => {
    if (!show || !visible || hovered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(() => {
      dismiss(visible.id);
    }, 8000);
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

  return (
    <div
      className={`fixed top-4 right-4 z-[70] w-[340px] max-w-[calc(100vw-2rem)] transition-all duration-300 ${show ? 'animate-[slide-down-in_0.3s_ease-out]' : 'opacity-0 -translate-y-full'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-xl overflow-hidden border-l-4 ${priorityAccent[visible.priority] || 'border-l-gray-300'}`}>
        {/* Image */}
        {visible.image_url && (
          <div className="relative w-full h-32">
            <Image src={visible.image_url} alt="" fill className="object-cover" />
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{visible.title}</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-3">{visible.body}</p>
            </div>
            <button
              onClick={() => dismiss(visible.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* CTA */}
          {visible.link_url && (
            <a
              href={visible.link_url}
              className="inline-block mt-3 text-[10px] text-gray-900 font-semibold uppercase tracking-wider hover:underline"
            >
              {visible.link_text || 'Learn more'} &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
