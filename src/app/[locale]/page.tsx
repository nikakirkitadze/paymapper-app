import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/formatters';
import { countryCodeToFlag } from '@/lib/utils';
import AnimatedSection from '@/components/AnimatedSection';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import AdSense from '@/components/AdSense';

export default async function HomePage() {
  const t = await getTranslations('homepage');
  const tc = await getTranslations('common');

  let topCountries: {
    id: string;
    name: string;
    slug: string;
    code: string;
    avgSalary: number;
  }[] = [];

  let popularJobs: {
    id: string;
    title: string;
    slug: string;
    category: string;
    salaryMin: number;
    salaryMax: number;
    countryCount: number;
  }[] = [];

  try {
    const countries = await prisma.country.findMany({
      include: {
        salaries: {
          select: { salaryAvg: true },
        },
      },
    });

    topCountries = countries
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        code: c.code,
        avgSalary:
          c.salaries.length > 0
            ? c.salaries.reduce((sum, s) => sum + s.salaryAvg, 0) /
              c.salaries.length
            : 0,
      }))
      .sort((a, b) => b.avgSalary - a.avgSalary)
      .slice(0, 6);

    const jobs = await prisma.job.findMany({
      take: 6,
      include: {
        salaries: {
          select: { salaryMin: true, salaryMax: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    popularJobs = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      category: j.category,
      salaryMin:
        j.salaries.length > 0
          ? Math.min(...j.salaries.map((s) => s.salaryMin))
          : 0,
      salaryMax:
        j.salaries.length > 0
          ? Math.max(...j.salaries.map((s) => s.salaryMax))
          : 0,
      countryCount: j.salaries.length,
    }));
  } catch {
    // Continue with empty data on error
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#3b82f6]/8 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t('heroTitle')}{' '}
              <span className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
                {t('heroHighlight')}
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              {t('heroSubtitle')}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <div className="mx-auto mt-8 max-w-xl">
              <SearchAutocomplete />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              {t('statsLine')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-6 text-center text-sm text-slate-400 sm:flex-row sm:gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <span>{t('searchAnyJob')}</span>
            </div>
            <div className="hidden h-px w-8 bg-white/10 sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <span>{t('compareAcrossCountries')}</span>
            </div>
            <div className="hidden h-px w-8 bg-white/10 sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <span>{t('makeInformedDecisions')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Paying Countries */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  {t('topPayingCountries')}
                </h2>
                <p className="mt-1 text-slate-400">
                  {t('topPayingCountriesDesc')}
                </p>
              </div>
              <Link
                href="/countries"
                className="hidden text-sm font-medium text-[#3b82f6] hover:underline sm:block"
              >
                {t('viewAllCountries')} &rarr;
              </Link>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topCountries.map((country, i) => (
              <AnimatedSection key={country.id} delay={i * 0.05}>
                <Link
                  href={`/countries/${country.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-[#3b82f6]/30 hover:bg-white/10"
                >
                  <span className="text-3xl">
                    {countryCodeToFlag(country.code)}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-[#3b82f6]">
                      {country.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {tc('avgPrefix')} {formatCurrency(country.avgSalary, true)}{tc('perYear')}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#3b82f6]/10 px-3 py-1 text-xs font-semibold text-[#3b82f6]">
                    #{i + 1}
                  </span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
          <Link
            href="/countries"
            className="mt-4 block text-center text-sm font-medium text-[#3b82f6] hover:underline sm:hidden"
          >
            {t('viewAllCountries')} &rarr;
          </Link>
        </div>
      </section>

      {/* Ad placement */}
      <AdSense slot="8966454053" className="mx-auto max-w-7xl px-4 my-12 sm:px-6 lg:px-8" />

      {/* Intro / About the tool */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {t('introTitle')}
            </h2>
            <div className="mt-5 space-y-4 text-slate-300 leading-relaxed">
              <p>{t('introP1')}</p>
              <p>{t('introP2')}</p>
              <p>{t('introP3')}</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <AnimatedSection>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b82f6]/10 text-[#3b82f6]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">
                  {t('featureCompareTitle')}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {t('featureCompareDesc')}
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.05}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b82f6]/10 text-[#3b82f6]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">
                  {t('featureTaxTitle')}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {t('featureTaxDesc')}
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b82f6]/10 text-[#3b82f6]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">
                  {t('featureCostTitle')}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {t('featureCostDesc')}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
              {t('howToUseTitle')}
            </h2>
          </AnimatedSection>
          <div className="space-y-4">
            <AnimatedSection>
              <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3b82f6]/10 text-sm font-bold text-[#3b82f6]">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {t('howToUseStep1Title')}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {t('howToUseStep1Desc')}
                  </p>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.05}>
              <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3b82f6]/10 text-sm font-bold text-[#3b82f6]">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {t('howToUseStep2Title')}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {t('howToUseStep2Desc')}
                  </p>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3b82f6]/10 text-sm font-bold text-[#3b82f6]">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {t('howToUseStep3Title')}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {t('howToUseStep3Desc')}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Popular Job Comparisons */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  {t('popularJobComparisons')}
                </h2>
                <p className="mt-1 text-slate-400">
                  {t('popularJobsDesc')}
                </p>
              </div>
              <Link
                href="/jobs"
                className="hidden text-sm font-medium text-[#3b82f6] hover:underline sm:block"
              >
                {t('browseAllJobs')} &rarr;
              </Link>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularJobs.map((job, i) => (
              <AnimatedSection key={job.id} delay={i * 0.05}>
                <Link
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
                    {formatCurrency(job.salaryMin, true)} &ndash;{' '}
                    {formatCurrency(job.salaryMax, true)}{tc('perYear')}
                  </p>
                  <p className="mt-auto pt-3 text-xs text-slate-500">
                    {tc('dataFromCountries', { count: job.countryCount })}
                  </p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
