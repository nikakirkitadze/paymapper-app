import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { APP_NAME } from '@/lib/constants';
import AnimatedSection from '@/components/AnimatedSection';
import TopPayingTabs from './TopPayingTabs';

export const metadata: Metadata = {
  title: `Top Paying Countries & Jobs | ${APP_NAME}`,
  description:
    'Discover the highest-paying countries and jobs in tech. See ranked tables and visual comparisons of global salary data.',
};

export default async function TopPayingPage() {
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
    // Top paying countries
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

    // Top paying jobs
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
        <h1 className="mb-2 text-3xl font-extrabold">Top Paying</h1>
        <p className="mb-8 text-slate-400">
          Discover the highest-paying countries and jobs in tech
        </p>
      </AnimatedSection>

      <TopPayingTabs
        topCountries={topCountries}
        topJobs={topJobs}
      />
    </div>
  );
}
