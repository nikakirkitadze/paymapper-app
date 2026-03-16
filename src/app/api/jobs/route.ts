import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const jobs = await prisma.job.findMany({
      where: category ? { category } : undefined,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        _count: {
          select: { salaries: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    const result = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      slug: job.slug,
      category: job.category,
      countryCount: job._count.salaries,
    }));

    return NextResponse.json({ jobs: result });
  } catch (error) {
    console.error('Jobs list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
