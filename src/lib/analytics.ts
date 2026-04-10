// ---------------------------------------------------------------------------
// Google Analytics 4 + Google Ads conversion tracking helpers
// ---------------------------------------------------------------------------
//
// Usage:  import { trackEvent } from '@/lib/analytics';
//         trackEvent('calculator_submit', { country: 'germany', gross: 80000 });
//
// The gtag script is loaded by <GoogleAnalytics /> in the locale layout.
// All helpers are no-ops when gtag is not loaded (SSR, ad-blockers, dev).
// ---------------------------------------------------------------------------

export const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '').trim();
export const GOOGLE_ADS_ID = (process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? '').trim();

// Extend Window to include gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Safe wrapper — returns silently when gtag is unavailable. */
function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/** Send a custom GA4 event. */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  gtag('event', eventName, params);
}

/** Send a Google Ads conversion event. */
export function trackConversion(
  conversionLabel: string,
  params?: Record<string, string | number | boolean>,
) {
  if (!GOOGLE_ADS_ID) return;
  gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
    ...params,
  });
}

// ---------------------------------------------------------------------------
// Pre-defined conversion events (matching the campaign plan)
// ---------------------------------------------------------------------------

/** Calculator form submitted with results. */
export function trackCalculatorSubmit(country: string, grossSalary: number) {
  trackEvent('calculator_submit', {
    country,
    gross_salary: grossSalary,
  });
}

/** User performed a search (autocomplete or hero search). */
export function trackSearchUsage(query: string, resultType?: string) {
  trackEvent('search_usage', {
    search_term: query,
    ...(resultType && { result_type: resultType }),
  });
}

/** User launched a salary comparison. */
export function trackCompareUsage(job: string, countries: string[]) {
  trackEvent('compare_tool', {
    job_title: job,
    countries: countries.join(','),
    country_count: countries.length,
  });
}

/** Micro-conversion: user visited 3+ pages in a session. */
export function trackPageEngagement(pageCount: number) {
  trackEvent('page_engagement', {
    page_count: pageCount,
  });
}
