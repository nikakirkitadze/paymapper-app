'use client';

import Script from 'next/script';
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID } from '@/lib/analytics';

/**
 * Loads the Google Analytics 4 (gtag.js) and Google Ads conversion tracking
 * scripts. Renders nothing when measurement IDs are not configured.
 *
 * Place this component inside <head> in the locale layout.
 */
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID && !GOOGLE_ADS_ID) return null;

  // Use Google Ads ID as primary if available (for Ads tag verification)
  const primaryId = GOOGLE_ADS_ID || GA_MEASUREMENT_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });` : ''}
          ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
          ${GOOGLE_ADS_ID ? `gtag('event', 'conversion', {'send_to': '${GOOGLE_ADS_ID}/Pp_bCMXj1IocEL30mJJD', 'value': 1.0, 'currency': 'USD'});` : ''}
        `}
      </Script>
    </>
  );
}
