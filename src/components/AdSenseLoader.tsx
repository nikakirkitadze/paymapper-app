'use client';

import { useEffect } from 'react';
import { ADSENSE_CLIENT_ID } from '@/lib/constants';

/**
 * Loads the Google AdSense library by injecting the script tag into <head>
 * after mount. Kept out of SSR so the DOM that React hydrates matches the
 * server-rendered HTML exactly — avoiding hydration mismatches caused by
 * third-party scripts mutating <head>.
 *
 * The AdSense `<ins>` slots (rendered by <AdSense />) push themselves onto
 * window.adsbygoogle once this script has loaded.
 */
export default function AdSenseLoader() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!ADSENSE_CLIENT_ID) return;

    // Don't inject twice (e.g. on fast refresh or multiple mounts)
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="adsbygoogle"]',
    );
    if (existing) return;

    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    s.onload = () => {
      s.dataset.loaded = 'true';
    };
    document.head.appendChild(s);
  }, []);

  return null;
}
