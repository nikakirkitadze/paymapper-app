import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { deslugify } from './formatters';

/**
 * Client-side hook to get localized data names.
 * Usage: const { jobTitle, countryName, categoryName } = useLocalizedData();
 */
export function useLocalizedData() {
  const t = useTranslations('data');

  return {
    jobTitle: (slug: string) => {
      try {
        return t(`jobTitles.${slug}`);
      } catch {
        return deslugify(slug);
      }
    },
    countryName: (slug: string) => {
      try {
        return t(`countries.${slug}`);
      } catch {
        return deslugify(slug);
      }
    },
    categoryName: (slug: string) => {
      try {
        return t(`categories.${slug}`);
      } catch {
        return deslugify(slug);
      }
    },
  };
}

/**
 * Server-side function to get localized data names.
 * Usage: const { jobTitle, countryName, categoryName } = await getLocalizedData();
 */
export async function getLocalizedData() {
  const t = await getTranslations('data');

  return {
    jobTitle: (slug: string) => {
      try {
        return t(`jobTitles.${slug}`);
      } catch {
        return deslugify(slug);
      }
    },
    countryName: (slug: string) => {
      try {
        return t(`countries.${slug}`);
      } catch {
        return deslugify(slug);
      }
    },
    categoryName: (slug: string) => {
      try {
        return t(`categories.${slug}`);
      } catch {
        return deslugify(slug);
      }
    },
  };
}
