'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageEngagement } from '@/lib/analytics';

const ENGAGEMENT_THRESHOLD = 3;
const SESSION_KEY = 'pm_page_views';

/**
 * Tracks unique page views per session. Fires a `page_engagement`
 * conversion event once the user visits 3+ distinct pages.
 */
export default function PageEngagementTracker() {
  const pathname = usePathname();
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = sessionStorage.getItem(SESSION_KEY);
    const pages: string[] = raw ? JSON.parse(raw) : [];

    if (!pages.includes(pathname)) {
      pages.push(pathname);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(pages));
    }

    if (pages.length >= ENGAGEMENT_THRESHOLD && !firedRef.current) {
      firedRef.current = true;
      trackPageEngagement(pages.length);
    }
  }, [pathname]);

  return null;
}
