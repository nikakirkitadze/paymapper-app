import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobSlug = searchParams.get('job');

    if (jobSlug) {
      // Return salary data per country for the specific job
      const job = await prisma.job.findUnique({
        where: { slug: jobSlug },
        select: { id: true },
      });

      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      const salaries = await prisma.salary.findMany({
        where: { jobId: job.id },
        include: {
          country: {
            select: {
              code: true,
              name: true,
              slug: true,
              latitude: true,
              longitude: true,
            },
          },
        },
        orderBy: { dataYear: 'desc' },
      });

      // Deduplicate by country (take the most recent year)
      const seenCountries = new Set<string>();
      const markers = salaries
        .filter((s) => {
          if (seenCountries.has(s.country.code)) return false;
          seenCountries.add(s.country.code);
          return true;
        })
        .map((s) => ({
          countryCode: s.country.code,
          countryName: s.country.name,
          lat: s.country.latitude,
          lng: s.country.longitude,
          salary: s.salaryAvg,
          slug: s.country.slug,
        }));

      return NextResponse.json({ markers });
    }

    // No job specified: return average salary across all jobs per country
    const countries = await prisma.country.findMany({
      select: {
        code: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true,
        salaries: {
          select: { salaryAvg: true },
        },
      },
    });

    const markers = countries
      .filter((c) => c.salaries.length > 0)
      .map((c) => {
        const avgSalary =
          c.salaries.reduce((sum, s) => sum + s.salaryAvg, 0) / c.salaries.length;

        return {
          countryCode: c.code,
          countryName: c.name,
          lat: c.latitude,
          lng: c.longitude,
          salary: Math.round(avgSalary),
          slug: c.slug,
        };
      });

    return NextResponse.json({ markers });
  } catch (error) {
    console.error('Map data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
