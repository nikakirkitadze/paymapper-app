import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import {
  generateSalaryPageMeta,
  generateStructuredData,
} from '@/lib/seo';
import { calculateNetSalary } from '@/lib/tax-calculator';
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
  if (!parsed) return { title: 'Salary Not Found' };

  const job = await prisma.job.findUnique({
    where: { slug: parsed.jobSlug },
    select: { title: true },
  });
  const country = await prisma.country.findUnique({
    where: { slug: parsed.countrySlug },
    select: { name: true },
  });

  if (!job || !country) return { title: 'Salary Not Found' };

  const meta = generateSalaryPageMeta(job.title, country.name);
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function SalaryPage({ params }: SalaryPageProps) {
  const { slug } = await params;
  const parsed = await parseSlug(slug);
  if (!parsed) notFound();

  const { jobSlug, countrySlug } = parsed;

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
    { label: 'Average', value: formatCurrency(salary.salaryAvg) },
    { label: 'Median', value: formatCurrency(salary.salaryMedian) },
    { label: 'Entry Level', value: formatCurrency(salary.salaryEntry) },
    { label: 'Senior Level', value: formatCurrency(salary.salarySenior) },
    { label: 'Minimum', value: formatCurrency(salary.salaryMin) },
    { label: 'Maximum', value: formatCurrency(salary.salaryMax) },
  ];

  const distributionData = [
    { label: 'Min', value: salary.salaryMin },
    { label: 'Entry', value: salary.salaryEntry },
    { label: 'Median', value: salary.salaryMedian },
    { label: 'Average', value: salary.salaryAvg },
    { label: 'Senior', value: salary.salarySenior },
    { label: 'Max', value: salary.salaryMax },
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
            Home
          </Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-white">
            Jobs
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
              {job.title} Salary in{' '}
              <span className="text-[#3b82f6]">{country.name}</span>
            </h1>
            <p className="mt-2 text-slate-400">
              Annual salary data in USD for {salary.dataYear}
            </p>
          </div>
        </AnimatedSection>

        {/* Hero Stat */}
        <AnimatedSection delay={0.03}>
          <div className="mb-8 text-center">
            <p className="text-sm text-slate-400">Average Annual Salary</p>
            <p className="mt-1 text-3xl font-extrabold text-white sm:text-5xl">{formatCurrency(salary.salaryAvg)}</p>
            <p className="mt-1 text-sm text-slate-500">in {country.name}</p>
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

        {/* Salary Distribution Bar Chart */}
        <AnimatedSection delay={0.1}>
          <div className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-6 text-xl font-bold">Salary Distribution</h2>
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
          <AdSense slot="salary-detail" />
        </div>

        {/* Two column: Cost of Living + Net Salary */}
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Cost of Living */}
          <AnimatedSection delay={0.15}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-bold">
                Cost of Living in {country.name}
              </h2>
              {costOfLiving ? (
                <div className="space-y-3">
                  {[
                    {
                      label: 'Rent (City Center, 1BR)',
                      value: costOfLiving.rentAvg,
                    },
                    {
                      label: 'Rent (Outside Center, 1BR)',
                      value: costOfLiving.rentOutsideCenter,
                    },
                    {
                      label: 'Groceries (Monthly)',
                      value: costOfLiving.groceriesMonthly,
                    },
                    {
                      label: 'Transport (Monthly)',
                      value: costOfLiving.transportMonthly,
                    },
                    {
                      label: 'Utilities (Monthly)',
                      value: costOfLiving.utilitiesMonthly,
                    },
                    {
                      label: 'Internet (Monthly)',
                      value: costOfLiving.internetMonthly,
                    },
                    {
                      label: 'Dining Out (Avg Meal)',
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
                      Cost Index (NYC = 100)
                    </span>
                    <span className="rounded-full bg-[#3b82f6]/10 px-3 py-1 text-sm font-bold text-[#3b82f6]">
                      {costOfLiving.costIndex.toFixed(1)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Cost of living data is not available for this country.
                </p>
              )}
            </div>
          </AnimatedSection>

          {/* Net Salary Calculation */}
          <AnimatedSection delay={0.2}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-bold">
                Net Salary Estimate
              </h2>
              {netSalary && taxData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-slate-400">
                      Gross Annual
                    </span>
                    <span className="font-semibold text-white">
                      {formatCurrency(netSalary.gross)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-slate-400">
                      Effective Tax Rate
                    </span>
                    <span className="font-semibold text-red-400">
                      {formatPercent(netSalary.effectiveRate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-slate-400">Total Tax</span>
                    <span className="font-semibold text-red-400">
                      -{formatCurrency(netSalary.totalTax)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-sm font-medium text-slate-300">
                      Net Annual
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrency(netSalary.netAnnual)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-medium text-slate-300">
                      Net Monthly
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrency(netSalary.netMonthly)}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-slate-500">
                      Tax range: {formatPercent(taxData.incomeTaxMin)} &ndash;{' '}
                      {formatPercent(taxData.incomeTaxMax)} | Social Security:{' '}
                      {formatPercent(taxData.socialSecurity)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Tax data is not available for this country.
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
                {job.title} Salary in Other Countries
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
