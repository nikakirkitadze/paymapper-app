import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import {
  generateStructuredData,
} from '@/lib/seo';
import { calculateNetSalary } from '@/lib/tax-calculator';
import { getAlternates } from '@/i18n/config';
import type { SalaryData, TaxData } from '@/lib/types';
import AnimatedSection from '@/components/AnimatedSection';
import AdSense from '@/components/AdSense';
import { countryCodeToFlag } from '@/lib/utils';

interface SalaryPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Parse a combined slug like "software-engineer-united-states" into
 * { jobSlug, countrySlug }. Since both job and country slugs can contain
 * hyphens, we fetch all country slugs and find which one the page slug
 * ends with; the remainder is the job slug.
 */
async function parseSlug(
  slug: string,
): Promise<{ jobSlug: string; countrySlug: string } | null> {
  const countries = await prisma.country.findMany({
    select: { slug: true },
    orderBy: { slug: 'desc' },
  });

  // Sort by slug length descending so longer matches take priority
  const sorted = countries.sort((a, b) => b.slug.length - a.slug.length);

  for (const country of sorted) {
    const suffix = `-${country.slug}`;
    if (slug.endsWith(suffix)) {
      const jobSlug = slug.slice(0, slug.length - suffix.length);
      if (jobSlug.length > 0) {
        return { jobSlug, countrySlug: country.slug };
      }
    }
  }

  return null;
}

export async function generateMetadata({
  params,
}: SalaryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = await parseSlug(slug);
  const tMeta = await getTranslations('metadata');
  const tSalary = await getTranslations('salary');

  if (!parsed) return { title: tSalary('notFound') };

  const job = await prisma.job.findUnique({
    where: { slug: parsed.jobSlug },
    select: { title: true },
  });
  const country = await prisma.country.findUnique({
    where: { slug: parsed.countrySlug },
    select: { name: true },
  });

  if (!job || !country) return { title: tSalary('notFound') };

  return {
    title: tMeta('salaryPageTitle', { jobTitle: job.title, countryName: country.name, appName: 'PayMapper' }),
    description: tMeta('salaryPageDescription', { jobTitle: job.title, countryName: country.name }),
    alternates: getAlternates(`/salary/${slug}`),
  };
}

export default async function SalaryPage({ params }: SalaryPageProps) {
  const { slug } = await params;
  const parsed = await parseSlug(slug);
  if (!parsed) notFound();

  const { jobSlug, countrySlug } = parsed;

  const t = await getTranslations('salary');
  const tc = await getTranslations('common');
  const tCol = await getTranslations('costOfLiving');

  let job: { id: string; title: string; slug: string; category: string } | null =
    null;
  let country: {
    id: string;
    name: string;
    slug: string;
    code: string;
    currency: string;
    currencySymbol: string;
  } | null = null;

  try {
    job = await prisma.job.findUnique({
      where: { slug: jobSlug },
      select: { id: true, title: true, slug: true, category: true },
    });
    country = await prisma.country.findUnique({
      where: { slug: countrySlug },
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
        currency: true,
        currencySymbol: true,
      },
    });
  } catch {
    notFound();
  }

  if (!job || !country) notFound();

  // Fetch salary data
  const salary = await prisma.salary.findFirst({
    where: { jobId: job.id, countryId: country.id },
  });

  if (!salary) notFound();

  // Fetch tax and cost of living data
  const [taxData, costOfLiving] = await Promise.all([
    prisma.tax.findUnique({ where: { countryId: country.id } }),
    prisma.costOfLiving.findUnique({ where: { countryId: country.id } }),
  ]);

  // Calculate net salary
  const netSalary = taxData
    ? calculateNetSalary(salary.salaryAvg, taxData as TaxData)
    : null;

  // Structured data
  const salaryData: SalaryData = {
    salaryAvg: salary.salaryAvg,
    salaryMedian: salary.salaryMedian,
    salaryEntry: salary.salaryEntry,
    salarySenior: salary.salarySenior,
    salaryMin: salary.salaryMin,
    salaryMax: salary.salaryMax,
    jobTitle: job.title,
    jobSlug: job.slug,
    countryName: country.name,
    countrySlug: country.slug,
    countryCode: country.code,
  };
  const structuredData = generateStructuredData(salaryData);

  // Related: same job in other countries
  const relatedSalaries = await prisma.salary.findMany({
    where: { jobId: job.id, countryId: { not: country.id } },
    include: { country: { select: { name: true, slug: true, code: true } } },
    orderBy: { salaryAvg: 'desc' },
    take: 8,
  });

  const stats = [
    { label: tc('average'), value: formatCurrency(salary.salaryAvg) },
    { label: t('median'), value: formatCurrency(salary.salaryMedian) },
    { label: t('entryLevel'), value: formatCurrency(salary.salaryEntry) },
    { label: t('seniorLevel'), value: formatCurrency(salary.salarySenior) },
    { label: t('minimum'), value: formatCurrency(salary.salaryMin) },
    { label: t('maximum'), value: formatCurrency(salary.salaryMax) },
  ];

  const distributionData = [
    { label: t('min'), value: salary.salaryMin },
    { label: tc('entry'), value: salary.salaryEntry },
    { label: t('median'), value: salary.salaryMedian },
    { label: tc('average'), value: salary.salaryAvg },
    { label: tc('senior'), value: salary.salarySenior },
    { label: t('max'), value: salary.salaryMax },
  ];
  const maxDistVal = Math.max(...distributionData.map((d) => d.value));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-400 sm:gap-2">
          <Link href="/" className="hover:text-white">
            {tc('home')}
          </Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-white">
            {tc('jobs')}
          </Link>
          <span>/</span>
          <Link href={`/jobs/${job.slug}`} className="truncate hover:text-white">
            {job.title}
          </Link>
          <span>/</span>
          <span className="truncate text-white">{country.name}</span>
        </nav>

        {/* Header */}
        <AnimatedSection>
          <div className="mb-10">
            <span className="mb-2 inline-block rounded-full bg-[#3b82f6]/10 px-3 py-1 text-xs font-medium text-[#3b82f6]">
              {job.category}
            </span>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              {t.rich('title', {
                jobTitle: job.title,
                countryName: country.name,
              })}
            </h1>
            <p className="mt-2 text-slate-400">
              {t('annualDataInUsd', { year: salary.dataYear })}
            </p>
          </div>
        </AnimatedSection>

        {/* Hero Stat */}
        <AnimatedSection delay={0.03}>
          <div className="mb-8 text-center">
            <p className="text-sm text-slate-400">{t('averageAnnualSalary')}</p>
            <p className="mt-1 text-3xl font-extrabold text-white sm:text-5xl">{formatCurrency(salary.salaryAvg)}</p>
            <p className="mt-1 text-sm text-slate-500">{t('inCountry', { countryName: country.name })}</p>
          </div>
        </AnimatedSection>

        {/* Salary Stats Grid */}
        <AnimatedSection delay={0.05}>
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {s.label}
                </p>
                <p className="mt-1 text-xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Narrative insights */}
        <AnimatedSection delay={0.08}>
          <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              {t('insightsTitle', {
                jobTitle: job.title,
                countryName: country.name,
              })}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-300">
              <p>
                {t('insightsP1', {
                  jobTitle: job.title,
                  countryName: country.name,
                  avg: formatCurrency(salary.salaryAvg),
                  min: formatCurrency(salary.salaryEntry),
                  max: formatCurrency(salary.salarySenior),
                })}
              </p>
              <p>{t('insightsP2')}</p>
              <p>{t('insightsP3')}</p>
            </div>
          </section>
        </AnimatedSection>

        {/* Salary Distribution Bar Chart */}
        <AnimatedSection delay={0.1}>
          <div className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-6 text-xl font-bold">{t('salaryDistribution')}</h2>
            <div className="space-y-3">
              {distributionData.map((d) => (
                <div key={d.label} className="flex items-center gap-4">
                  <span className="w-16 shrink-0 text-right text-sm text-slate-400">
                    {d.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-8 overflow-hidden rounded-lg bg-white/5">
                      <div
                        className="flex h-full items-center rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] px-3 text-xs font-semibold text-white transition-all"
                        style={{
                          width: `${(d.value / maxDistVal) * 100}%`,
                          minWidth: '60px',
                        }}
                      >
                        {formatCurrency(d.value, true)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Ad placement */}
        <div className="mb-10">
          <AdSense slot="8966454053" />
        </div>

        {/* Two column: Cost of Living + Net Salary */}
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Cost of Living */}
          <AnimatedSection delay={0.15}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-bold">
                {t('costOfLivingIn', { countryName: country.name })}
              </h2>
              {costOfLiving ? (
                <div className="space-y-3">
                  {[
                    {
                      label: tCol('rentCityCenter'),
                      value: costOfLiving.rentAvg,
                    },
                    {
                      label: tCol('rentOutsideCenter'),
                      value: costOfLiving.rentOutsideCenter,
                    },
                    {
                      label: tCol('groceriesMonthly'),
                      value: costOfLiving.groceriesMonthly,
                    },
                    {
                      label: tCol('transportMonthly'),
                      value: costOfLiving.transportMonthly,
                    },
                    {
                      label: tCol('utilitiesMonthly'),
                      value: costOfLiving.utilitiesMonthly,
                    },
                    {
                      label: tCol('internetMonthly'),
                      value: costOfLiving.internetMonthly,
                    },
                    {
                      label: tCol('diningOutAvg'),
                      value: costOfLiving.diningOutAvg,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-white/5 pb-2"
                    >
                      <span className="text-sm text-slate-400">
                        {item.label}
                      </span>
                      <span className="font-semibold text-white">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-slate-300">
                      {tCol('costIndexLabel')}
                    </span>
                    <span className="rounded-full bg-[#3b82f6]/10 px-3 py-1 text-sm font-bold text-[#3b82f6]">
                      {costOfLiving.costIndex.toFixed(1)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  {t('costDataNotAvailable')}
                </p>
              )}
            </div>
          </AnimatedSection>

          {/* Net Salary Calculation */}
          <AnimatedSection delay={0.2}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-bold">
                {t('netSalaryEstimate')}
              </h2>
              {netSalary && taxData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-slate-400">
                      {t('grossAnnual')}
                    </span>
                    <span className="font-semibold text-white">
                      {formatCurrency(netSalary.gross)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-slate-400">
                      {t('effectiveTaxRate')}
                    </span>
                    <span className="font-semibold text-red-400">
                      {formatPercent(netSalary.effectiveRate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-slate-400">{t('totalTax')}</span>
                    <span className="font-semibold text-red-400">
                      -{formatCurrency(netSalary.totalTax)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-sm font-medium text-slate-300">
                      {t('netAnnual')}
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrency(netSalary.netAnnual)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-medium text-slate-300">
                      {t('netMonthly')}
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrency(netSalary.netMonthly)}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-slate-500">
                      {t('taxRange', {
                        min: formatPercent(taxData.incomeTaxMin),
                        max: formatPercent(taxData.incomeTaxMax),
                        ss: formatPercent(taxData.socialSecurity),
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  {t('taxDataNotAvailable')}
                </p>
              )}
            </div>
          </AnimatedSection>
        </div>

        {/* Related: Same job in other countries */}
        {relatedSalaries.length > 0 && (
          <AnimatedSection delay={0.25}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-bold">
                {t('salaryInOtherCountries', { jobTitle: job.title })}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {relatedSalaries.map((rs) => (
                  <Link
                    key={rs.id}
                    href={`/salary/${job.slug}-${rs.country.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-[#3b82f6]/30 hover:bg-white/10"
                  >
                    <span className="text-xl">
                      {countryCodeToFlag(rs.country.code)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-[#3b82f6]">
                        {rs.country.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatCurrency(rs.salaryAvg, true)}/yr
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </>
  );
}
