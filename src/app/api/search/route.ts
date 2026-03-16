import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const searchTerm = q.trim();

    const [jobs, countries] = await Promise.all([
      prisma.job.findMany({
        where: {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
        take: 5,
      }),
      prisma.country.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          code: true,
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({ jobs, countries });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
