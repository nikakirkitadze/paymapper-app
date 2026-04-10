import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SearchResult } from '@/lib/types';

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
          title: true,
          slug: true,
          category: true,
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
          name: true,
          slug: true,
          code: true,
        },
        take: 5,
      }),
    ]);

    const results: SearchResult[] = [
      ...jobs.map((j) => ({
        type: 'job' as const,
        title: j.title,
        slug: j.slug,
        category: j.category,
      })),
      ...countries.map((c) => ({
        type: 'country' as const,
        title: c.name,
        slug: c.slug,
        countryCode: c.code,
      })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
