export const locales = ['en', 'es', 'fr', 'de', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/**
 * Generate hreflang alternates and a canonical URL for a given path.
 * English (default) gets the unprefixed path; other locales get /{locale}{path}.
 * The canonical always points to the default-locale URL so Google consolidates
 * ranking signals to a single URL per piece of content.
 */
export function getAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = loc === defaultLocale ? path : `/${loc}${path}`;
  }
  return { canonical: path, languages };
}
