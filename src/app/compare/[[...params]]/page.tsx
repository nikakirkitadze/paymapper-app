import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { generateComparePageMeta } from '@/lib/seo';
import { calculateNetSalary } from '@/lib/tax-calculator';
import { countryCodeToFlag } from '@/lib/utils';
import type { TaxData } from '@/lib/types';
import AnimatedSection from '@/components/AnimatedSection';
import CompareBuilder from '../CompareBuilder';

interface ComparePageProps {
  params: Promise<{ params?: string[] }>;
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { params: segments } = await params;
  if (!segments || segments.length < 2) return { title: 'Compare Salaries' };

  const jobSlug = segments[0];
  const countrySlugs = segments[1].split('-vs-');

  const job = await prisma.job.findUnique({
    where: { slug: jobSlug },
    select: { title: true },
  });

  if (!job) return { title: 'Compare Salaries' };

  const countries = await prisma.country.findMany({
    where: { slug: { in: countrySlugs } },
    select: { name: true },
  });

  const meta = generateComparePageMeta(
    job.title,
    countries.map((c) => c.name),
  );
  return { title: meta.title, description: meta.description };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { params: segments } = await params;

  if (!segments || segments.length < 2) {
    const [jobs, countries] = await Promise.all([
      prisma.job.findMany({
        select: { slug: true, title: true },
        orderBy: { title: 'asc' },
      }),
      prisma.country.findMany({
        select: { slug: true, name: true, code: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-extrabold">Compare Salaries</h1>
        <p className="mb-8 text-slate-400">
          Select a job and countries to see a side-by-side salary comparison.
        </p>
        <CompareBuilder jobs={jobs} countries={countries} />
      </div>
    );
  }

  const jobSlug = segments[0];
  const countrySlugs = segments[1].split('-vs-');

  if (countrySlugs.length < 2) notFound();

  let job: { id: string; title: string; slug: string; category: string } | null =
    null;

  try {
    job = await prisma.job.findUnique({
      where: { slug: jobSlug },
      select: { id: true, title: true, slug: true, category: true },
    });
  } catch {
    notFound();
  }

  if (!job) notFound();

  // Fetch countries with their salary, tax, and cost of living data
  const countries = await prisma.country.findMany({
    where: { slug: { in: countrySlugs } },
    include: {
      salaries: {
        where: { jobId: job.id },
      },
      taxes: true,
      costOfLiving: true,
    },
  });

  if (countries.length < 2) notFound();

  // Build comparison data
  const comparisonData = countries
    .map((c) => {
      const salary = c.salaries[0] ?? null;
      const tax = c.taxes[0] ?? null;
      const col = c.costOfLiving[0] ?? null;
      const net = salary && tax ? calculateNetSalary(salary.salaryAvg, tax as TaxData) : null;

      return {
        country: {
          name: c.name,
          slug: c.slug,
          code: c.code,
          currency: c.currency,
        },
        salary,
        tax,
        costOfLiving: col,
        netSalary: net,
      };
    })
    // Order by input slug order
    .sort(
      (a, b) =>
        countrySlugs.indexOf(a.country.slug) -
        countrySlugs.indexOf(b.country.slug),
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link href="/compare" className="hover:text-white">
          Compare
        </Link>
        <span>/</span>
        <span className="text-white">{job.title}</span>
      </nav>

      <AnimatedSection>
        <h1 className="mb-2 text-3xl font-extrabold sm:text-4xl">
          {job.title} Salary Comparison
        </h1>
        <p className="mb-8 text-slate-400">
          {comparisonData.map((d) => d.country.name).join(' vs ')}
        </p>
      </AnimatedSection>

      {/* Comparison Table */}
      <AnimatedSection delay={0.05}>
        <div className="mb-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                  Metric
                </th>
                {comparisonData.map((d) => (
                  <th
                    key={d.country.slug}
                    className="px-6 py-4 text-sm font-semibold text-white"
                  >
                    {countryCodeToFlag(d.country.code)} {d.country.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-6 py-3 text-sm text-slate-400">
                  Gross Salary (Avg)
                </td>
                {comparisonData.map((d) => (
                  <td
                    key={d.country.slug}
                    className="px-6 py-3 text-sm font-semibold text-white"
                  >
                    {d.salary
                      ? formatCurrency(d.salary.salaryAvg)
                      : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-slate-400">
                  Median Salary
                </td>
                {comparisonData.map((d) => (
                  <td
                    key={d.country.slug}
                    className="px-6 py-3 text-sm font-semibold text-white"
                  >
                    {d.salary
                      ? formatCurrency(d.salary.salaryMedian)
                      : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-slate-400">
                  Entry Level
                </td>
                {comparisonData.map((d) => (
                  <td
                    key={d.country.slug}
                    className="px-6 py-3 text-sm text-white"
                  >
                    {d.salary
                      ? formatCurrency(d.salary.salaryEntry)
                      : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-slate-400">
                  Senior Level
                </td>
                {comparisonData.map((d) => (
                  <td
                    key={d.country.slug}
                    className="px-6 py-3 text-sm text-white"
                  >
                    {d.salary
                      ? formatCurrency(d.salary.salarySenior)
                      : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-slate-400">
                  Effective Tax Rate
                </td>
                {comparisonData.map((d) => (
                  <td
                    key={d.country.slug}
                    className="px-6 py-3 text-sm font-semibold text-red-400"
                  >
                    {d.netSalary
                      ? formatPercent(d.netSalary.effectiveRate)
                      : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-slate-400">
                  Net Annual Income
                </td>
                {comparisonData.map((d) => (
                  <td
                    key={d.country.slug}
                    className="px-6 py-3 text-sm font-semibold text-emerald-400"
                  >
                    {d.netSalary
                      ? formatCurrency(d.netSalary.netAnnual)
                      : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-slate-400">
                  Net Monthly Income
                </td>
                {comparisonData.map((d) => (
                  <td
                    key={d.country.slug}
                    className="px-6 py-3 text-sm text-emerald-400"
                  >
                    {d.netSalary
                      ? formatCurrency(d.netSalary.netMonthly)
                      : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-slate-400">
                  Rent (City Center)
                </td>
                {comparisonData.map((d) => (
                  <td
                    key={d.country.slug}
                    className="px-6 py-3 text-sm text-white"
                  >
                    {d.costOfLiving
                      ? `${formatCurrency(d.costOfLiving.rentAvg)}/mo`
                      : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-slate-400">
                  Cost of Living Index
                </td>
                {comparisonData.map((d) => (
                  <td
                    key={d.country.slug}
                    className="px-6 py-3 text-sm text-white"
                  >
                    {d.costOfLiving
                      ? d.costOfLiving.costIndex.toFixed(1)
                      : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-slate-400">
                  Monthly Savings Estimate
                </td>
                {comparisonData.map((d) => {
                  if (!d.netSalary || !d.costOfLiving) {
                    return (
                      <td
                        key={d.country.slug}
                        className="px-6 py-3 text-sm text-white"
                      >
                        N/A
                      </td>
                    );
                  }
                  const monthlyExpenses =
                    d.costOfLiving.rentAvg +
                    d.costOfLiving.groceriesMonthly +
                    d.costOfLiving.transportMonthly +
                    d.costOfLiving.utilitiesMonthly +
                    d.costOfLiving.internetMonthly;
                  const savings = d.netSalary.netMonthly - monthlyExpenses;
                  return (
                    <td
                      key={d.country.slug}
                      className={`px-6 py-3 text-sm font-semibold ${savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {formatCurrency(savings)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </AnimatedSection>

      {/* Salary Bar Comparison */}
      <AnimatedSection delay={0.1}>
        <div className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-6 text-xl font-bold">Salary Comparison</h2>
          <div className="space-y-4">
            {comparisonData.map((d) => {
              const maxSalary = Math.max(
                ...comparisonData
                  .filter((cd) => cd.salary)
                  .map((cd) => cd.salary!.salaryAvg),
              );
              const pct = d.salary
                ? (d.salary.salaryAvg / maxSalary) * 100
                : 0;

              return (
                <div key={d.country.slug} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      {countryCodeToFlag(d.country.code)} {d.country.name}
                    </span>
                    <span className="font-semibold text-white">
                      {d.salary
                        ? formatCurrency(d.salary.salaryAvg)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="h-6 overflow-hidden rounded-lg bg-white/5">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] transition-all"
                      style={{ width: `${pct}%`, minWidth: '4px' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Side-by-side Cost of Living */}
      <AnimatedSection delay={0.15}>
        <div className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-6 text-xl font-bold">
            Cost of Living Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-sm font-semibold text-slate-400">
                    Expense
                  </th>
                  {comparisonData.map((d) => (
                    <th
                      key={d.country.slug}
                      className="px-4 py-3 text-sm font-semibold text-white"
                    >
                      {d.country.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { key: 'rentAvg', label: 'Rent (City)' },
                  { key: 'groceriesMonthly', label: 'Groceries' },
                  { key: 'transportMonthly', label: 'Transport' },
                  { key: 'utilitiesMonthly', label: 'Utilities' },
                  { key: 'internetMonthly', label: 'Internet' },
                  { key: 'diningOutAvg', label: 'Dining Out' },
                ].map((row) => (
                  <tr key={row.key}>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {row.label}
                    </td>
                    {comparisonData.map((d) => (
                      <td
                        key={d.country.slug}
                        className="px-4 py-3 text-sm text-white"
                      >
                        {d.costOfLiving
                          ? formatCurrency(
                              (d.costOfLiving as unknown as Record<string, number>)[
                                row.key
                              ] ?? 0,
                            )
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedSection>

      {/* Links to individual salary pages */}
      <AnimatedSection delay={0.2}>
        <div className="flex flex-wrap gap-3">
          {comparisonData.map((d) => (
            <Link
              key={d.country.slug}
              href={`/salary/${job.slug}-${d.country.slug}`}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition-all hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/10 hover:text-white"
            >
              {job.title} in {d.country.name} &rarr;
            </Link>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}

