/**
 * Format a numeric amount as a USD currency string.
 *
 * @param amount  - The number to format.
 * @param compact - When `true`, use compact notation (e.g. "$120K").
 *                  When `false` (default), use full notation (e.g. "$120,000").
 */
export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as a percentage string (e.g. 23.5 -> "23.5%").
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100) / 100}%`;
}

/**
 * Convert a human-readable string to a URL-safe slug.
 *
 * "Software Engineer" -> "software-engineer"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/&/g, '-and-')     // Replace & with "and"
    .replace(/[^\w-]+/g, '')    // Remove non-word chars (except hyphens)
    .replace(/--+/g, '-')       // Collapse multiple hyphens
    .replace(/^-+/, '')         // Trim leading hyphens
    .replace(/-+$/, '');        // Trim trailing hyphens
}

/**
 * Convert a slug back into title-cased words.
 *
 * "software-engineer" -> "Software Engineer"
 */
export function deslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Alias for `deslugify` — converts a country or job slug to a display name.
 *
 * "united-states" -> "United States"
 */
export function formatCountryName(slug: string): string {
  return deslugify(slug);
}
