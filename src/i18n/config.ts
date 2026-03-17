export const locales = ['en', 'es', 'fr', 'de', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/**
 * Generate hreflang alternates for a given path.
 * English (default) gets the unprefixed path; other locales get /{locale}{path}.
 */
export function getAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = loc === defaultLocale ? path : `/${loc}${path}`;
  }
  return { languages };
}
