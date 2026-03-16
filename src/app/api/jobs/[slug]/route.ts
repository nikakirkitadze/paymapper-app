import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const job = await prisma.job.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const salaries = await prisma.salary.findMany({
      where: { job: { slug } },
      include: {
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

    const result = salaries.map((s) => ({
      country: s.country,
      salaryAvg: s.salaryAvg,
      salaryMedian: s.salaryMedian,
      salaryEntry: s.salaryEntry,
      salarySenior: s.salarySenior,
      salaryMin: s.salaryMin,
      salaryMax: s.salaryMax,
      dataYear: s.dataYear,
    }));

    return NextResponse.json({ job, salaries: result });
  } catch (error) {
    console.error('Job detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
