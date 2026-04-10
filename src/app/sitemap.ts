import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { locales, defaultLocale } from '@/i18n/config';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paymapper.app';

function localizedUrl(path: string, locale: string): string {
  return locale === defaultLocale
    ? `${BASE_URL}${path}`
    : `${BASE_URL}/${locale}${path}`;
}

function alternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = localizedUrl(path, locale);
  }
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, countries] = await Promise.all([
    prisma.job.findMany({ select: { slug: true } }),
    prisma.country.findMany({ select: { slug: true } }),
  ]);

  // Fetch salary combinations for salary pages
  const salaries = await prisma.salary.findMany({
    select: {
      job: { select: { slug: true } },
      country: { select: { slug: true } },
    },
  });

  const staticPages = [
    '/',
    '/jobs',
    '/countries',
    '/calculator',
    '/map',
    '/top-paying',
    '/compare',
    '/about',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const path of staticPages) {
    entries.push({
      url: localizedUrl(path, defaultLocale),
      alternates: alternates(path),
      changeFrequency: 'weekly',
      priority: path === '/' ? 1.0 : 0.8,
    });
  }

  // Job pages
  for (const job of jobs) {
    const path = `/jobs/${job.slug}`;
    entries.push({
      url: localizedUrl(path, defaultLocale),
      alternates: alternates(path),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Country pages
  for (const country of countries) {
    const path = `/countries/${country.slug}`;
    entries.push({
      url: localizedUrl(path, defaultLocale),
      alternates: alternates(path),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Salary pages (job + country combinations)
  for (const salary of salaries) {
    const path = `/salary/${salary.job.slug}-${salary.country.slug}`;
    entries.push({
      url: localizedUrl(path, defaultLocale),
      alternates: alternates(path),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return entries;
}
