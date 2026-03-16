import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
        continent: true,
        _count: {
          select: { salaries: true },
        },
        costOfLiving: {
          select: { costIndex: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = countries.map((country) => ({
      id: country.id,
      name: country.name,
      slug: country.slug,
      code: country.code,
      continent: country.continent,
      jobCount: country._count.salaries,
      costIndex: country.costOfLiving[0]?.costIndex ?? null,
    }));

    return NextResponse.json({ countries: result });
  } catch (error) {
    console.error('Countries list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
