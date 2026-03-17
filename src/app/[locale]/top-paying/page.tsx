import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getAlternates } from '@/i18n/config';
import AnimatedSection from '@/components/AnimatedSection';
import TopPayingTabs from './TopPayingTabs';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('topPayingTitle', { appName: 'PayMapper' }),
    description: t('topPayingDescription'),
    alternates: getAlternates('/top-paying'),
  };
}

export default async function TopPayingPage() {
  const t = await getTranslations('topPaying');

  let topCountries: {
    name: string;
    slug: string;
    code: string;
    avgSalary: number;
  }[] = [];

  let topJobs: {
    title: string;
    slug: string;
    category: string;
    avgSalary: number;
    countryCount: number;
  }[] = [];

  try {
    const countries = await prisma.country.findMany({
      include: {
        salaries: { select: { salaryAvg: true } },
      },
    });

    topCountries = countries
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        code: c.code,
        avgSalary:
          c.salaries.length > 0
            ? c.salaries.reduce((sum, s) => sum + s.salaryAvg, 0) /
              c.salaries.length
            : 0,
      }))
      .filter((c) => c.avgSalary > 0)
      .sort((a, b) => b.avgSalary - a.avgSalary);

    const jobs = await prisma.job.findMany({
      include: {
        salaries: { select: { salaryAvg: true } },
      },
    });

    topJobs = jobs
      .map((j) => ({
        title: j.title,
        slug: j.slug,
        category: j.category,
        avgSalary:
          j.salaries.length > 0
            ? j.salaries.reduce((sum, s) => sum + s.salaryAvg, 0) /
              j.salaries.length
            : 0,
        countryCount: j.salaries.length,
      }))
      .filter((j) => j.avgSalary > 0)
      .sort((a, b) => b.avgSalary - a.avgSalary);
  } catch {
    // Continue with empty data
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <AnimatedSection>
        <h1 className="mb-2 text-3xl font-extrabold">{t('title')}</h1>
        <p className="mb-8 text-slate-400">
          {t('subtitle')}
        </p>
      </AnimatedSection>

      <TopPayingTabs
        topCountries={topCountries}
        topJobs={topJobs}
      />
    </div>
  );
}
