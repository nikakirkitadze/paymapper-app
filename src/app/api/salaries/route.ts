import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobSlug = searchParams.get('job');
    const countrySlug = searchParams.get('country');
    const year = parseInt(searchParams.get('year') || '2025', 10);

    if (!jobSlug && !countrySlug) {
      return NextResponse.json(
        { error: 'At least one of "job" or "country" query parameters is required' },
        { status: 400 }
      );
    }

    // Both job and country: return single salary record
    if (jobSlug && countrySlug) {
      const salary = await prisma.salary.findFirst({
        where: {
          job: { slug: jobSlug },
          country: { slug: countrySlug },
          dataYear: year,
        },
        include: {
          job: {
            select: { id: true, title: true, slug: true, category: true },
          },
          country: {
            select: {
              id: true,
              name: true,
              slug: true,
              code: true,
              continent: true,
              currency: true,
              currencySymbol: true,
            },
          },
        },
      });

      if (!salary) {
        return NextResponse.json(
          { error: 'Salary data not found for the specified job and country' },
          { status: 404 }
        );
      }

      return NextResponse.json({ salaries: [salary] });
    }

    // Only job: return salaries across countries
    if (jobSlug) {
      const salaries = await prisma.salary.findMany({
        where: {
          job: { slug: jobSlug },
          dataYear: year,
        },
        include: {
          job: {
            select: { id: true, title: true, slug: true, category: true },
          },
          country: {
            select: {
              id: true,
              name: true,
              slug: true,
              code: true,
              continent: true,
              currency: true,
              currencySymbol: true,
            },
          },
        },
        orderBy: { salaryAvg: 'desc' },
      });

      return NextResponse.json({ salaries });
    }

    // Only country: return salaries across jobs
    const salaries = await prisma.salary.findMany({
      where: {
        country: { slug: countrySlug! },
        dataYear: year,
      },
      include: {
        job: {
          select: { id: true, title: true, slug: true, category: true },
        },
        country: {
          select: {
            id: true,
            name: true,
            slug: true,
            code: true,
            continent: true,
            currency: true,
            currencySymbol: true,
          },
        },
      },
      orderBy: { salaryAvg: 'desc' },
    });

    return NextResponse.json({ salaries });
  } catch (error) {
    console.error('Salaries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
