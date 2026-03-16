import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TaxBracket {
  threshold: number;
  rate: number;
}

function interpolateEffectiveRate(gross: number, brackets: TaxBracket[]): number {
  // Below the lowest bracket, use the lowest rate
  if (gross <= brackets[0].threshold) {
    return brackets[0].rate;
  }

  // Above the highest bracket, use the highest rate
  if (gross >= brackets[brackets.length - 1].threshold) {
    return brackets[brackets.length - 1].rate;
  }

  // Find the two brackets the gross falls between and interpolate
  for (let i = 0; i < brackets.length - 1; i++) {
    const lower = brackets[i];
    const upper = brackets[i + 1];

    if (gross >= lower.threshold && gross <= upper.threshold) {
      const ratio = (gross - lower.threshold) / (upper.threshold - lower.threshold);
      return lower.rate + ratio * (upper.rate - lower.rate);
    }
  }

  return brackets[brackets.length - 1].rate;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const grossParam = searchParams.get('gross');
    const countrySlug = searchParams.get('country');

    if (!grossParam || !countrySlug) {
      return NextResponse.json(
        { error: 'Both "gross" and "country" query parameters are required' },
        { status: 400 }
      );
    }

    const gross = parseFloat(grossParam);

    if (isNaN(gross) || gross < 0) {
      return NextResponse.json(
        { error: '"gross" must be a valid non-negative number' },
        { status: 400 }
      );
    }

    const country = await prisma.country.findUnique({
      where: { slug: countrySlug },
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
        currency: true,
        currencySymbol: true,
      },
    });

    if (!country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    const tax = await prisma.tax.findFirst({
      where: { countryId: country.id },
    });

    if (!tax) {
      return NextResponse.json(
        { error: 'Tax data not available for this country' },
        { status: 404 }
      );
    }

    const brackets: TaxBracket[] = [
      { threshold: 30000, rate: tax.effectiveRate30k },
      { threshold: 50000, rate: tax.effectiveRate50k },
      { threshold: 75000, rate: tax.effectiveRate75k },
      { threshold: 100000, rate: tax.effectiveRate100k },
      { threshold: 150000, rate: tax.effectiveRate150k },
    ];

    const effectiveRate = interpolateEffectiveRate(gross, brackets);
    const totalTax = gross * (effectiveRate / 100);
    const netAnnual = gross - totalTax;
    const netMonthly = netAnnual / 12;

    return NextResponse.json({
      gross,
      totalTax: Math.round(totalTax * 100) / 100,
      netAnnual: Math.round(netAnnual * 100) / 100,
      netMonthly: Math.round(netMonthly * 100) / 100,
      effectiveRate: Math.round(effectiveRate * 100) / 100,
      country,
    });
  } catch (error) {
    console.error('Calculate net error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
