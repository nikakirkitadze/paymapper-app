import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/formatters';
import { countryCodeToFlag } from '@/lib/utils';
import { getAlternates } from '@/i18n/config';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('searchTitle', { appName: 'PayMapper' }),
    description: t('searchDescription'),
    alternates: getAlternates('/search'),
  };
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const t = await getTranslations('search');
  const tc = await getTranslations('common');
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  let matchingJobs: {
    id: string;
    title: string;
    slug: string;
    category: string;
    salaryRange: string;
    countryCount: number;
  }[] = [];

  let matchingCountries: {
    id: string;
    name: string;
    slug: string;
    code: string;
    avgSalary: number;
  }[] = [];

  try {
    if (query) {
      const jobs = await prisma.job.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          salaries: { select: { salaryMin: true, salaryMax: true } },
        },
        take: 20,
      });

      matchingJobs = jobs.map((j) => ({
        id: j.id,
        title: j.title,
        slug: j.slug,
        category: j.category,
        salaryRange:
          j.salaries.length > 0
            ? `${formatCurrency(Math.min(...j.salaries.map((s) => s.salaryMin)), true)} - ${formatCurrency(Math.max(...j.salaries.map((s) => s.salaryMax)), true)}`
            : tc('na'),
        countryCount: j.salaries.length,
      }));

      const countries = await prisma.country.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { continent: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          salaries: { select: { salaryAvg: true } },
        },
        take: 20,
      });

      matchingCountries = countries.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        code: c.code,
        avgSalary:
          c.salaries.length > 0
            ? c.salaries.reduce((sum, s) => sum + s.salaryAvg, 0) /
              c.salaries.length
            : 0,
      }));
    } else {
      const jobs = await prisma.job.findMany({
        take: 12,
        include: {
          salaries: { select: { salaryMin: true, salaryMax: true } },
        },
        orderBy: { title: 'asc' },
      });

      matchingJobs = jobs.map((j) => ({
        id: j.id,
        title: j.title,
        slug: j.slug,
        category: j.category,
        salaryRange:
          j.salaries.length > 0
            ? `${formatCurrency(Math.min(...j.salaries.map((s) => s.salaryMin)), true)} - ${formatCurrency(Math.max(...j.salaries.map((s) => s.salaryMax)), true)}`
            : tc('na'),
        countryCount: j.salaries.length,
      }));

      const countries = await prisma.country.findMany({
        take: 12,
        include: {
          salaries: { select: { salaryAvg: true } },
        },
        orderBy: { name: 'asc' },
      });

      matchingCountries = countries.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        code: c.code,
        avgSalary:
          c.salaries.length > 0
            ? c.salaries.reduce((sum, s) => sum + s.salaryAvg, 0) /
              c.salaries.length
            : 0,
      }));
    }
  } catch {
    // Show empty state on error
  }

  const hasResults = matchingJobs.length > 0 || matchingCountries.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Search bar */}
      <div className="mb-10">
        <h1 className="mb-4 text-3xl font-bold">
          {query ? t('resultsFor', { query }) : t('title')}
        </h1>
        <form action="/search" method="GET" className="relative max-w-2xl">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={t('placeholder')}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder-slate-500 outline-none transition-all focus:border-[#3b82f6]/50 focus:ring-2 focus:ring-[#3b82f6]/20"
          />
        </form>
      </div>

      {!hasResults && query && (
        <div className="py-16 text-center">
          <p className="text-xl text-slate-400">
            {t('noResults', { query })}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {t('noResultsHint')}
          </p>
          <Link
            href="/jobs"
            className="mt-6 inline-block rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
          >
            {t('browseAllJobs')}
          </Link>
        </div>
      )}

      {/* Job Results */}
      {matchingJobs.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold">
            {query ? t('matchingJobs') : t('popularJobs')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matchingJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-[#3b82f6]/30 hover:bg-white/10"
              >
                <span className="mb-2 w-fit rounded-full bg-[#3b82f6]/10 px-3 py-1 text-xs font-medium text-[#3b82f6]">
                  {job.category}
                </span>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#3b82f6]">
                  {job.title}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {job.salaryRange}{tc('perYear')}
                </p>
                <p className="mt-auto pt-3 text-xs text-slate-500">
                  {tc('countriesCount', { count: job.countryCount })}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Country Results */}
      {matchingCountries.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">
            {query ? t('matchingCountries') : t('featuredCountries')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matchingCountries.map((country) => (
              <Link
                key={country.id}
                href={`/countries/${country.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-[#3b82f6]/30 hover:bg-white/10"
              >
                <span className="text-3xl">
                  {countryCodeToFlag(country.code)}
                </span>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-[#3b82f6]">
                    {country.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {tc('avgPrefix')} {formatCurrency(country.avgSalary, true)}{tc('perYear')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
