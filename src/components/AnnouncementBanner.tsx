'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: number;
  title: string;
  body: string;
  type: string;
  priority: string;
  link_url: string | null;
  link_text: string | null;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Load dismissed IDs from localStorage
    try {
      const stored = localStorage.getItem('dismissed_announcements');
      if (stored) setDismissed(new Set(JSON.parse(stored)));
    } catch { /* */ }

    fetch('/api/announcements')
      .then(res => res.ok ? res.json() : [])
      .then((data: Announcement[]) => setAnnouncements(data))
      .catch(() => {});
  }, []);

  const dismiss = (id: number) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    try {
      localStorage.setItem('dismissed_announcements', JSON.stringify([...next]));
    } catch { /* */ }
  };

  const banners = announcements.filter(
    a => (a.type === 'banner' || a.type === 'both') && !dismissed.has(a.id)
  );

  if (banners.length === 0) return null;

  const priorityBg: Record<string, string> = {
    urgent: 'bg-red-600',
    high: 'bg-orange-500',
    normal: 'bg-gray-900',
    low: 'bg-gray-700',
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60]">
      {banners.map(a => (
        <div key={a.id} className={`${priorityBg[a.priority] || 'bg-gray-900'} text-white px-4 py-2.5`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0 text-center">
              <span className="text-xs font-medium">
                {a.title}: {a.body}
                {a.link_url && (
                  <a href={a.link_url} className="ml-2 underline underline-offset-2 hover:no-underline">
                    {a.link_text || 'Learn more'}
                  </a>
                )}
              </span>
            </div>
            <button
              onClick={() => dismiss(a.id)}
              className="text-white/60 hover:text-white transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
