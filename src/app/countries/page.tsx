import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/formatters';
import { countryCodeToFlag } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import AnimatedSection from '@/components/AnimatedSection';

export const metadata: Metadata = {
  title: `Browse Countries | ${APP_NAME}`,
  description:
    'Explore salary data across 30+ countries. Compare average tech salaries, cost of living indices, and more.',
};

interface CountriesPageProps {
  searchParams: Promise<{ sort?: string; q?: string }>;
}

export default async function CountriesPage({
  searchParams,
}: CountriesPageProps) {
  const { sort, q } = await searchParams;
  const sortBy = sort ?? 'name';
  const searchQuery = q?.trim() ?? '';

  let countries: {
    id: string;
    name: string;
    slug: string;
    code: string;
    continent: string;
    avgSalary: number;
    costIndex: number;
  }[] = [];

  try {
    const dbCountries = await prisma.country.findMany({
      include: {
        salaries: { select: { salaryAvg: true } },
        costOfLiving: { select: { costIndex: true } },
      },
    });

    countries = dbCountries.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      code: c.code,
      continent: c.continent,
      avgSalary:
        c.salaries.length > 0
          ? c.salaries.reduce((sum, s) => sum + s.salaryAvg, 0) /
            c.salaries.length
          : 0,
      costIndex: c.costOfLiving[0]?.costIndex ?? 0,
    }));

    // Filter by search query
    if (searchQuery) {
      countries = countries.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort
    switch (sortBy) {
      case 'salary':
        countries.sort((a, b) => b.avgSalary - a.avgSalary);
        break;
      case 'cost':
        countries.sort((a, b) => a.costIndex - b.costIndex);
        break;
      default:
        countries.sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch {
    // Show empty state on error
  }

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'salary', label: 'Highest Salary' },
    { value: 'cost', label: 'Lowest Cost of Living' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <AnimatedSection>
        <h1 className="mb-2 text-3xl font-extrabold">Browse Countries</h1>
        <p className="mb-8 text-slate-400">
          Explore salary data and cost of living across {countries.length}{' '}
          countries
        </p>
      </AnimatedSection>

      {/* Search */}
      <AnimatedSection delay={0.03}>
        <form className="mb-4 max-w-md">
          {sort && <input type="hidden" name="sort" value={sort} />}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search countries..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#3b82f6]/50"
            />
          </div>
        </form>
      </AnimatedSection>

      {/* Sort options */}
      <AnimatedSection delay={0.05}>
        <div className="mb-8 flex flex-wrap gap-2">
          {sortOptions.map((opt) => {
            const params = new URLSearchParams();
            params.set('sort', opt.value);
            if (searchQuery) params.set('q', searchQuery);
            return (
              <Link
                key={opt.value}
                href={`/countries?${params.toString()}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  sortBy === opt.value
                    ? 'bg-[#3b82f6] text-white'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </AnimatedSection>

      {/* Countries grid */}
      {countries.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country, i) => (
            <AnimatedSection
              key={country.id}
              delay={Math.min(i * 0.03, 0.3)}
            >
              <Link
                href={`/countries/${country.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-[#3b82f6]/30 hover:bg-white/10"
              >
                <span className="text-4xl">
                  {countryCodeToFlag(country.code)}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-[#3b82f6]">
                    {country.name}
                  </h3>
                  <p className="text-xs text-slate-500">{country.continent}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                      Avg. {formatCurrency(country.avgSalary, true)}/yr
                    </span>
                    {country.costIndex > 0 && (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-500">
                        CoL: {country.costIndex.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-xl text-slate-400">No countries found</p>
        </div>
      )}
    </div>
  );
}
