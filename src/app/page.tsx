import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/formatters';
import { countryCodeToFlag } from '@/lib/utils';
import AnimatedSection from '@/components/AnimatedSection';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import AdSense from '@/components/AdSense';

export default async function HomePage() {
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
    // Fetch top 6 countries by average salary
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

    // Fetch 6 popular jobs with salary ranges
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
              Compare Tech Salaries{' '}
              <span className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
                Worldwide
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              Explore salaries, taxes, and cost of living across 30+ countries.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <div className="mx-auto mt-8 max-w-xl">
              <SearchAutocomplete />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              30+ Countries &middot; 50+ Job Titles &middot; Real Tax Data
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* How It Works — compact strip */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-6 text-center text-sm text-slate-400 sm:flex-row sm:gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <span>Search any job title</span>
            </div>
            <div className="hidden h-px w-8 bg-white/10 sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <span>Compare across countries</span>
            </div>
            <div className="hidden h-px w-8 bg-white/10 sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <span>Make informed decisions</span>
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
                  Top Paying Countries
                </h2>
                <p className="mt-1 text-slate-400">
                  Countries with the highest average tech salaries
                </p>
              </div>
              <Link
                href="/countries"
                className="hidden text-sm font-medium text-[#3b82f6] hover:underline sm:block"
              >
                View all countries &rarr;
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
                      Avg. {formatCurrency(country.avgSalary, true)}/yr
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
            View all countries &rarr;
          </Link>
        </div>
      </section>

      {/* Ad placement */}
      <AdSense slot="homepage-mid" className="mx-auto max-w-7xl px-4 my-12 sm:px-6 lg:px-8" />

      {/* Popular Job Comparisons */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Popular Job Comparisons
                </h2>
                <p className="mt-1 text-slate-400">
                  Explore salary ranges for trending tech roles
                </p>
              </div>
              <Link
                href="/jobs"
                className="hidden text-sm font-medium text-[#3b82f6] hover:underline sm:block"
              >
                Browse all jobs &rarr;
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
                    {formatCurrency(job.salaryMax, true)}/yr
                  </p>
                  <p className="mt-auto pt-3 text-xs text-slate-500">
                    Data from {job.countryCount} countries
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
