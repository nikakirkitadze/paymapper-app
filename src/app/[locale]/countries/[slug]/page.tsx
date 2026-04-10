import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { APP_NAME } from '@/lib/constants';
import { getAlternates } from '@/i18n/config';
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

  const t = await getTranslations('metadata');
  return {
    title: t('countryPageTitle', { countryName: country.name, appName: APP_NAME }),
    description: t('countryPageDescription', { countryName: country.name }),
    alternates: getAlternates(`/countries/${slug}`),
  };
}

export default async function CountryDetailPage({
  params,
}: CountryDetailPageProps) {
  const { slug } = await params;

  const tc = await getTranslations('countries');
  const tCommon = await getTranslations('common');
  const tCost = await getTranslations('costOfLiving');
  const tTax = await getTranslations('tax');
  const tSalary = await getTranslations('salary');

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
          {tCommon('home')}
        </Link>
        <span>{tCommon('breadcrumbSeparator')}</span>
        <Link href="/countries" className="hover:text-white">
          {tCommon('countries')}
        </Link>
        <span>{tCommon('breadcrumbSeparator')}</span>
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
              {tc('avgSalary')}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatCurrency(overallAvg, true)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {tc('medianSalary')}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatCurrency(overallMedian, true)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {tc('jobsTracked')}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {salaries.length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {tc('costIndex')}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#3b82f6]">
              {costOfLiving ? costOfLiving.costIndex.toFixed(1) : tCommon('na')}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* About the country - narrative context */}
      <AnimatedSection delay={0.08}>
        <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-bold text-white">
            {tc('aboutCountryTitle', { countryName: country.name })}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              {tc('aboutCountryP1', {
                countryName: country.name,
                jobCount: salaries.length,
                avgSalary: formatCurrency(overallAvg),
                costIndex: costOfLiving
                  ? costOfLiving.costIndex.toFixed(1)
                  : tCommon('na'),
              })}
            </p>
            <p>{tc('aboutCountryP2', { countryName: country.name })}</p>
            <p>{tc('aboutCountryP3', { countryName: country.name })}</p>
          </div>
        </section>
      </AnimatedSection>

      {/* Top Paying Jobs Table */}
      {salaries.length > 0 && (
        <AnimatedSection delay={0.1}>
          <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="px-6 py-4">
              <h2 className="text-xl font-bold">
                {tc('topPayingJobs', { countryName: country.name })}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                      {tCommon('rank')}
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                      {tc('jobTitle')}
                    </th>
                    <th className="hidden px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell sm:px-6">
                      {tCommon('category')}
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                      {tCommon('average')}
                    </th>
                    <th className="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell sm:px-6">
                      {tCommon('entry')}
                    </th>
                    <th className="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell md:px-6">
                      {tCommon('senior')}
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
            <h2 className="mb-4 text-xl font-bold">{tSalary('costOfLivingIn', { countryName: country.name })}</h2>
            {costOfLiving ? (
              <div className="space-y-3">
                {[
                  {
                    label: tCost('rentCityCenter'),
                    value: costOfLiving.rentAvg,
                  },
                  {
                    label: tCost('rentOutsideCenter'),
                    value: costOfLiving.rentOutsideCenter,
                  },
                  {
                    label: tCost('groceriesMonthly'),
                    value: costOfLiving.groceriesMonthly,
                  },
                  {
                    label: tCost('transportMonthly'),
                    value: costOfLiving.transportMonthly,
                  },
                  {
                    label: tCost('utilitiesMonthly'),
                    value: costOfLiving.utilitiesMonthly,
                  },
                  {
                    label: tCost('internetMonthly'),
                    value: costOfLiving.internetMonthly,
                  },
                  {
                    label: tCost('diningOutAvg'),
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
                    {tCost('costIndexLabel')}
                  </span>
                  <span className="rounded-full bg-[#3b82f6]/10 px-3 py-1 text-sm font-bold text-[#3b82f6]">
                    {costOfLiving.costIndex.toFixed(1)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {tSalary('costDataNotAvailable')}
              </p>
            )}
          </div>
        </AnimatedSection>

        {/* Tax Information */}
        <AnimatedSection delay={0.2}>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold">{tTax('title')}</h2>
            {taxData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-sm text-slate-400">
                    {tTax('incomeTaxRange')}
                  </span>
                  <span className="font-semibold text-white">
                    {formatPercent(taxData.incomeTaxMin)} -{' '}
                    {formatPercent(taxData.incomeTaxMax)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-sm text-slate-400">
                    {tTax('socialSecurity')}
                  </span>
                  <span className="font-semibold text-white">
                    {formatPercent(taxData.socialSecurity)}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="mb-3 text-sm font-medium text-slate-300">
                    {tTax('effectiveRatesByIncome')}
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
                {tSalary('taxDataNotAvailable')}
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
