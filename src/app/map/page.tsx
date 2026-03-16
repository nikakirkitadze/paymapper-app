import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { APP_NAME } from '@/lib/constants';
import MapClient from './MapClient';

export const metadata: Metadata = {
  title: `Global Salary Map | ${APP_NAME}`,
  description:
    'Interactive world map showing tech salary data across countries. Select a job title to see how salaries compare globally.',
};

export default async function MapPage() {
  let jobs: { slug: string; title: string }[] = [];

  try {
    jobs = await prisma.job.findMany({
      select: { slug: true, title: true },
      orderBy: { title: 'asc' },
    });
  } catch {
    // Continue with empty jobs
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-extrabold">Global Salary Map</h1>
      <p className="mb-8 text-slate-400">
        Explore salary data visually across the world. Select a job to see how
        pay varies by country.
      </p>
      <MapClient jobs={jobs} />
    </div>
  );
}
