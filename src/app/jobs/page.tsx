import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/formatters';
import { JOB_CATEGORIES, APP_NAME } from '@/lib/constants';
import AnimatedSection from '@/components/AnimatedSection';

export const metadata: Metadata = {
  title: `Browse Jobs | ${APP_NAME}`,
  description:
    'Browse tech job salaries worldwide. Filter by category to find salary data for software engineers, data scientists, designers, and more.',
};

interface JobsPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const { category, q } = await searchParams;
  const searchQuery = q?.trim() ?? '';

  let jobs: {
    id: string;
    title: string;
    slug: string;
    category: string;
    salaryMin: number;
    salaryMax: number;
    countryCount: number;
  }[] = [];

  try {
    const where: Record<string, unknown> = {};

    if (category) {
      // Match the category slug from JOB_CATEGORIES
      const cat = JOB_CATEGORIES.find((c) => c.slug === category);
      if (cat) {
        where.category = cat.label;
      }
    }

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { category: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    const dbJobs = await prisma.job.findMany({
      where,
      include: {
        salaries: { select: { salaryMin: true, salaryMax: true } },
      },
      orderBy: { title: 'asc' },
    });

    jobs = dbJobs.map((j) => ({
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
    // Show empty state on error
  }

  const activeCategory = category ?? '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <AnimatedSection>
        <h1 className="mb-2 text-3xl font-extrabold">Browse Jobs</h1>
        <p className="mb-8 text-slate-400">
          Explore salary data for tech jobs across the globe
        </p>
      </AnimatedSection>

      {/* Search within jobs */}
      <AnimatedSection delay={0.05}>
        <form
          action="/jobs"
          method="GET"
          className="mb-6 flex max-w-xl items-center gap-2"
        >
          {category && (
            <input type="hidden" name="category" value={category} />
          )}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search jobs..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#3b82f6]/50 focus:ring-2 focus:ring-[#3b82f6]/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
          >
            Search
          </button>
        </form>
      </AnimatedSection>

      {/* Category filters */}
      <AnimatedSection delay={0.1}>
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/jobs"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              !activeCategory
                ? 'bg-[#3b82f6] text-white'
                : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            All
          </Link>
          {JOB_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/jobs?category=${cat.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === cat.slug
                  ? 'bg-[#3b82f6] text-white'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* Result count */}
      <p className="mb-4 text-sm text-slate-500">Showing {jobs.length} jobs</p>

      {/* Jobs grid */}
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, i) => (
            <AnimatedSection key={job.id} delay={Math.min(i * 0.03, 0.3)}>
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
                  {job.salaryMin > 0
                    ? `${formatCurrency(job.salaryMin, true)} - ${formatCurrency(job.salaryMax, true)}/yr`
                    : 'Salary data coming soon'}
                </p>
                <p className="mt-auto pt-3 text-xs text-slate-500">
                  {job.countryCount} {job.countryCount === 1 ? 'country' : 'countries'}
                </p>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-xl text-slate-400">No jobs found</p>
          <p className="mt-2 text-sm text-slate-500">
            Try a different search term or category.
          </p>
        </div>
      )}
    </div>
  );
}
