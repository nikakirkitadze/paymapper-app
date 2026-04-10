import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/formatters';
import { APP_NAME } from '@/lib/constants';
import { getAlternates } from '@/i18n/config';
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

  const tm = await getTranslations('metadata');
  return {
    title: tm('jobPageTitle', { jobTitle: job.title, appName: APP_NAME }),
    description: tm('jobPageDescription', { jobTitle: job.title }),
    alternates: getAlternates(`/jobs/${slug}`),
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const t = await getTranslations('jobs');
  const tc = await getTranslations('common');

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
          {t('noSalaryData')}
        </p>
        <Link
          href="/jobs"
          className="mt-6 inline-block rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
        >
          {t('browseOtherJobs')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white">
          {tc('home')}
        </Link>
        <span>{tc('breadcrumbSeparator')}</span>
        <Link href="/jobs" className="hover:text-white">
          {tc('jobs')}
        </Link>
        <span>{tc('breadcrumbSeparator')}</span>
        <span className="text-white">{job.title}</span>
      </nav>

      <AnimatedSection>
        <div className="mb-10">
          <span className="mb-2 inline-block rounded-full bg-[#3b82f6]/10 px-3 py-1 text-xs font-medium text-[#3b82f6]">
            {job.category}
          </span>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{job.title}</h1>
          <p className="mt-2 text-slate-400">
            {t('salaryDataFrom', { count: salaries.length })}
          </p>
        </div>
      </AnimatedSection>

      {/* About the role - narrative context */}
      <AnimatedSection delay={0.03}>
        <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-bold text-white">
            {t('aboutRoleTitle', { jobTitle: job.title })}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">
            <p>{t('aboutRoleP1', { jobTitle: job.title, count: salaries.length })}</p>
            <p>
              {t('aboutRoleP2', {
                jobTitle: job.title,
                topCountry: salaries[0].country.name,
                topSalary: formatCurrency(salaries[0].salaryAvg),
              })}
            </p>
            <p>{t('aboutRoleP3')}</p>
          </div>
        </section>
      </AnimatedSection>

      {/* Global Salary Ranking Table */}
      <AnimatedSection delay={0.05}>
        <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold">
              {t('globalSalaryRanking')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                    {tc('rank')}
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                    {tc('country')}
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                    {tc('average')}
                  </th>
                  <th className="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell sm:px-6">
                    {tc('entry')}
                  </th>
                  <th className="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell sm:px-6">
                    {tc('senior')}
                  </th>
                  <th className="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell md:px-6">
                    {tc('range')}
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
                        href={`/salary/${job.slug}-${s.country.slug}`}
                        className="flex items-center gap-2 text-sm font-medium text-white hover:text-[#3b82f6]"
                      >
                        <span>{countryCodeToFlag(s.country.code)}</span>
                        {s.country.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-semibold text-white sm:px-6">
                      {formatCurrency(s.salaryAvg)}
                    </td>
                    <td className="hidden px-3 py-3 text-right text-sm text-slate-400 sm:table-cell sm:px-6">
                      {formatCurrency(s.salaryEntry)}
                    </td>
                    <td className="hidden px-3 py-3 text-right text-sm text-slate-400 sm:table-cell sm:px-6">
                      {formatCurrency(s.salarySenior)}
                    </td>
                    <td className="hidden px-3 py-3 text-right text-sm text-slate-500 md:table-cell md:px-6">
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
        <AdSense slot="8966454053" />
      </div>

      {/* Compare this job CTA */}
      <div className="mt-6 mb-10 flex justify-center">
        <Link
          href={`/compare/${job.slug}/${salaries[0]?.country.slug ?? ''}-vs-${salaries[1]?.country.slug ?? ''}`}
          className="rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
        >
          {t('compareAcrossCountries', { jobTitle: job.title })}
        </Link>
      </div>

      {/* Links to individual salary pages */}
      <AnimatedSection delay={0.2}>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-bold">
            {t('exploreSalariesByCountry', { jobTitle: job.title })}
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
