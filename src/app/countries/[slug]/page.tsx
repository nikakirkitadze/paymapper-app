import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { APP_NAME } from '@/lib/constants';
import AnimatedSection from '@/components/AnimatedSection';
import AdSense from '@/components/AdSense';
import { countryCodeToFlag } from '@/lib/utils';

interface CountryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CountryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const country = await prisma.country.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!country) return { title: 'Country Not Found' };

  return {
    title: `${country.name} Salary Data | ${APP_NAME}`,
    description: `Explore tech salary data in ${country.name}. See average salaries, top paying jobs, cost of living, and tax information.`,
  };
}

export default async function CountryDetailPage({
  params,
}: CountryDetailPageProps) {
  const { slug } = await params;

  let country: {
    id: string;
    name: string;
    slug: string;
    code: string;
    continent: string;
    currency: string;
    currencySymbol: string;
  } | null = null;

  try {
    country = await prisma.country.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
        continent: true,
        currency: true,
        currencySymbol: true,
      },
    });
  } catch {
    notFound();
  }

  if (!country) notFound();

  // Fetch salary, cost of living, and tax data in parallel
  const [salaries, costOfLiving, taxData] = await Promise.all([
    prisma.salary.findMany({
      where: { countryId: country.id },
      include: {
        job: { select: { title: true, slug: true, category: true } },
      },
      orderBy: { salaryAvg: 'desc' },
    }),
    prisma.costOfLiving.findUnique({ where: { countryId: country.id } }),
    prisma.tax.findUnique({ where: { countryId: country.id } }),
  ]);

  // Compute average salary across all jobs
  const overallAvg =
    salaries.length > 0
      ? salaries.reduce((sum, s) => sum + s.salaryAvg, 0) / salaries.length
      : 0;

  const overallMedian =
    salaries.length > 0
      ? salaries.reduce((sum, s) => sum + s.salaryMedian, 0) / salaries.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link href="/countries" className="hover:text-white">
          Countries
        </Link>
        <span>/</span>
        <span className="text-white">{country.name}</span>
      </nav>

      {/* Header */}
      <AnimatedSection>
        <div className="mb-10 flex items-center gap-4">
          <span className="text-5xl">{countryCodeToFlag(country.code)}</span>
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              {country.name}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
              <span>{country.continent}</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span>
                {country.currency} ({country.currencySymbol})
              </span>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Stats overview */}
      <AnimatedSection delay={0.05}>
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Avg Salary
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatCurrency(overallAvg, true)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Median Salary
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatCurrency(overallMedian, true)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Jobs Tracked
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {salaries.length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Cost Index
            </p>
            <p className="mt-1 text-2xl font-bold text-[#3b82f6]">
              {costOfLiving ? costOfLiving.costIndex.toFixed(1) : 'N/A'}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Top Paying Jobs Table */}
      {salaries.length > 0 && (
        <AnimatedSection delay={0.1}>
          <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="px-6 py-4">
              <h2 className="text-xl font-bold">
                Top Paying Jobs in {country.name}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                      Rank
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                      Job Title
                    </th>
                    <th className="hidden px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell sm:px-6">
                      Category
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                      Average
                    </th>
                    <th className="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell sm:px-6">
                      Entry
                    </th>
                    <th className="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell md:px-6">
                      Senior
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {salaries.map((s, i) => (
                    <tr
                      key={s.id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-3 py-3 text-sm font-semibold text-slate-400 sm:px-6">
                        #{i + 1}
                      </td>
                      <td className="px-3 py-3 sm:px-6">
                        <Link
                          href={`/salary/${s.job.slug}-${country.slug}`}
                          className="text-sm font-medium text-white hover:text-[#3b82f6]"
                        >
                          {s.job.title}
                        </Link>
                      </td>
                      <td className="hidden px-3 py-3 text-sm text-slate-400 sm:table-cell sm:px-6">
                        {s.job.category}
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-semibold text-white sm:px-6">
                        {formatCurrency(s.salaryAvg)}
                      </td>
                      <td className="hidden px-3 py-3 text-right text-sm text-slate-400 sm:table-cell sm:px-6">
                        {formatCurrency(s.salaryEntry)}
                      </td>
                      <td className="hidden px-3 py-3 text-right text-sm text-slate-400 md:table-cell md:px-6">
                        {formatCurrency(s.salarySenior)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Two column: Cost of Living + Tax Info */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cost of Living */}
        <AnimatedSection delay={0.15}>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold">Cost of Living</h2>
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
                    <span className="text-sm text-slate-400">{item.label}</span>
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

        {/* Tax Information */}
        <AnimatedSection delay={0.2}>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold">Tax Information</h2>
            {taxData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-sm text-slate-400">
                    Income Tax Range
                  </span>
                  <span className="font-semibold text-white">
                    {formatPercent(taxData.incomeTaxMin)} -{' '}
                    {formatPercent(taxData.incomeTaxMax)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-sm text-slate-400">
                    Social Security
                  </span>
                  <span className="font-semibold text-white">
                    {formatPercent(taxData.socialSecurity)}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="mb-3 text-sm font-medium text-slate-300">
                    Effective Tax Rates by Income
                  </p>
                  <div className="space-y-2">
                    {[
                      { income: '$30,000', rate: taxData.effectiveRate30k },
                      { income: '$50,000', rate: taxData.effectiveRate50k },
                      { income: '$75,000', rate: taxData.effectiveRate75k },
                      { income: '$100,000', rate: taxData.effectiveRate100k },
                      { income: '$150,000', rate: taxData.effectiveRate150k },
                    ].map((row) => (
                      <div
                        key={row.income}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-slate-400">
                          {row.income}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-red-400"
                              style={{ width: `${row.rate}%` }}
                            />
                          </div>
                          <span className="w-14 text-right text-sm font-semibold text-red-400">
                            {formatPercent(row.rate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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

      {/* Ad placement */}
      <div className="mb-10">
        <AdSense slot="8966454053" />
      </div>
    </div>
  );
}
