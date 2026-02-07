'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    // Skip dashboard pages
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) return;
    // Skip duplicate fires
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Fire and forget
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pathname, referrer: document.referrer || null }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
