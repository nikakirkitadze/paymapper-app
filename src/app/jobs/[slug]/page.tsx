import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/formatters';
import { generateJobPageMeta } from '@/lib/seo';
import AnimatedSection from '@/components/AnimatedSection';
import AdSense from '@/components/AdSense';
import { countryCodeToFlag } from '@/lib/utils';

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await prisma.job.findUnique({
    where: { slug },
    select: { title: true },
  });

  if (!job) return { title: 'Job Not Found' };

  const meta = generateJobPageMeta(job.title);
  return { title: meta.title, description: meta.description };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;

  let job: {
    id: string;
    title: string;
    slug: string;
    category: string;
  } | null = null;

  try {
    job = await prisma.job.findUnique({
      where: { slug },
      select: { id: true, title: true, slug: true, category: true },
    });
  } catch {
    notFound();
  }

  if (!job) notFound();

  // Fetch all salary data for this job across countries
  const salaries = await prisma.salary.findMany({
    where: { jobId: job.id },
    include: {
      country: {
        select: { name: true, slug: true, code: true },
      },
    },
    orderBy: { salaryAvg: 'desc' },
  });

  if (salaries.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-3xl font-extrabold">{job.title}</h1>
        <p className="text-slate-400">
          No salary data is available for this job yet. Check back soon.
        </p>
        <Link
          href="/jobs"
          className="mt-6 inline-block rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
        >
          Browse Other Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link href="/jobs" className="hover:text-white">
          Jobs
        </Link>
        <span>/</span>
        <span className="text-white">{job.title}</span>
      </nav>

      <AnimatedSection>
        <div className="mb-10">
          <span className="mb-2 inline-block rounded-full bg-[#3b82f6]/10 px-3 py-1 text-xs font-medium text-[#3b82f6]">
            {job.category}
          </span>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{job.title}</h1>
          <p className="mt-2 text-slate-400">
            Salary data from {salaries.length} countries worldwide
          </p>
        </div>
      </AnimatedSection>

      {/* Global Salary Ranking Table */}
      <AnimatedSection delay={0.05}>
        <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold">
              Global Salary Ranking
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Country
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Average
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Entry
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Senior
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Range
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {salaries.map((s, i) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-3 text-sm font-semibold text-slate-400">
                      #{i + 1}
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/salary/${job.slug}-${s.country.slug}`}
                        className="flex items-center gap-2 text-sm font-medium text-white hover:text-[#3b82f6]"
                      >
                        <span>{countryCodeToFlag(s.country.code)}</span>
                        {s.country.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-semibold text-white">
                      {formatCurrency(s.salaryAvg)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-slate-400">
                      {formatCurrency(s.salaryEntry)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-slate-400">
                      {formatCurrency(s.salarySenior)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-slate-500">
                      {formatCurrency(s.salaryMin, true)} -{' '}
                      {formatCurrency(s.salaryMax, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedSection>

      {/* Ad placement */}
      <div className="mb-10">
        <AdSense slot="job-detail" />
      </div>

      {/* Compare this job CTA */}
      <div className="mt-6 mb-10 flex justify-center">
        <Link
          href={`/compare/${job.slug}/${salaries[0]?.country.slug ?? ''}-vs-${salaries[1]?.country.slug ?? ''}`}
          className="rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
        >
          Compare {job.title} Across Countries
        </Link>
      </div>

      {/* Links to individual salary pages */}
      <AnimatedSection delay={0.2}>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-bold">
            Explore {job.title} Salaries by Country
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {salaries.map((s) => (
              <Link
                key={s.id}
                href={`/salary/${job.slug}-${s.country.slug}`}
                className="group flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm transition-all hover:border-[#3b82f6]/30 hover:bg-white/10"
              >
                <span>{countryCodeToFlag(s.country.code)}</span>
                <span className="text-slate-300 group-hover:text-white">
                  {s.country.name}
                </span>
                <span className="ml-auto text-xs text-slate-500">
                  {formatCurrency(s.salaryAvg, true)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
