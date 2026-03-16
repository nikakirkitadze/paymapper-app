'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT_ID } from '@/lib/constants';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
  className?: string;
}

export default function AdSense({
  slot,
  format = 'auto',
  className = '',
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    if (!isProduction) return;

    try {
      // Push the ad only if the script has loaded
      const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] })
        .adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
      }
    } catch {
      // AdSense script may not have loaded yet; silently ignore.
    }
  }, [isProduction]);

  // Development placeholder
  if (!isProduction) {
    return (
      <div
        className={`ad-container flex items-center justify-center px-4 py-6 ${className}`}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
          Advertisement
        </p>
      </div>
    );
  }

  // Production: render AdSense ins tag
  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
