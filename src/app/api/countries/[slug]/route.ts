import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const country = await prisma.country.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
        continent: true,
        currency: true,
        currencySymbol: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    const [salaries, costOfLiving, tax] = await Promise.all([
      prisma.salary.findMany({
        where: { country: { slug } },
        include: {
          job: {
            select: { id: true, title: true, slug: true, category: true },
          },
        },
        orderBy: { salaryAvg: 'desc' },
      }),
      prisma.costOfLiving.findFirst({
        where: { country: { slug } },
      }),
      prisma.tax.findFirst({
        where: { country: { slug } },
      }),
    ]);

    return NextResponse.json({
      country,
      salaries,
      costOfLiving,
      tax,
    });
  } catch (error) {
    console.error('Country detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
