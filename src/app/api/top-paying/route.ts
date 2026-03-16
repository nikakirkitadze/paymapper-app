import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!type || (type !== 'countries' && type !== 'jobs')) {
      return NextResponse.json(
        { error: '"type" query parameter must be either "countries" or "jobs"' },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: '"limit" must be a positive integer' },
        { status: 400 }
      );
    }

    if (type === 'countries') {
      const countries = await prisma.country.findMany({
        select: {
          name: true,
          slug: true,
          salaries: {
            select: { salaryAvg: true },
          },
        },
      });

      const results = countries
        .filter((c) => c.salaries.length > 0)
        .map((c) => ({
          name: c.name,
          slug: c.slug,
          averageSalary:
            Math.round(
              (c.salaries.reduce((sum, s) => sum + s.salaryAvg, 0) /
                c.salaries.length) *
                100
            ) / 100,
          count: c.salaries.length,
        }))
        .sort((a, b) => b.averageSalary - a.averageSalary)
        .slice(0, limit);

      return NextResponse.json({ results });
    }

    // type === 'jobs'
    const jobs = await prisma.job.findMany({
      select: {
        title: true,
        slug: true,
        salaries: {
          select: { salaryAvg: true },
        },
      },
    });

    const results = jobs
      .filter((j) => j.salaries.length > 0)
      .map((j) => ({
        name: j.title,
        slug: j.slug,
        averageSalary:
          Math.round(
            (j.salaries.reduce((sum, s) => sum + s.salaryAvg, 0) /
              j.salaries.length) *
              100
          ) / 100,
        count: j.salaries.length,
      }))
      .sort((a, b) => b.averageSalary - a.averageSalary)
      .slice(0, limit);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Top paying error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
