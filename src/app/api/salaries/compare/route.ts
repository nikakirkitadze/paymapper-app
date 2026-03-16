import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TaxBracket {
  threshold: number;
  rate: number;
}

function interpolateEffectiveRate(gross: number, brackets: TaxBracket[]): number {
  if (gross <= brackets[0].threshold) {
    return brackets[0].rate;
  }

  if (gross >= brackets[brackets.length - 1].threshold) {
    return brackets[brackets.length - 1].rate;
  }

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
    const jobSlug = searchParams.get('job');
    const countrySlugs = searchParams.get('countries');

    if (!jobSlug || !countrySlugs) {
      return NextResponse.json(
        { error: 'Both "job" and "countries" query parameters are required' },
        { status: 400 }
      );
    }

    const slugList = countrySlugs.split(',').map((s) => s.trim()).filter(Boolean);

    if (slugList.length === 0) {
      return NextResponse.json(
        { error: 'At least one country slug is required' },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { slug: jobSlug },
      select: { id: true, title: true, slug: true, category: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const countries = await prisma.country.findMany({
      where: { slug: { in: slugList } },
      include: {
        salaries: {
          where: { jobId: job.id },
          orderBy: { dataYear: 'desc' },
          take: 1,
        },
        costOfLiving: true,
        taxes: true,
      },
    });

    const comparisons = countries.map((country) => {
      const salary = country.salaries[0] || null;
      const costOfLiving = country.costOfLiving[0] || null;
      const tax = country.taxes[0] || null;

      let netSalary: number | null = null;
      let effectiveRate: number | null = null;

      if (salary && tax) {
        const brackets: TaxBracket[] = [
          { threshold: 30000, rate: tax.effectiveRate30k },
          { threshold: 50000, rate: tax.effectiveRate50k },
          { threshold: 75000, rate: tax.effectiveRate75k },
          { threshold: 100000, rate: tax.effectiveRate100k },
          { threshold: 150000, rate: tax.effectiveRate150k },
        ];

        effectiveRate = interpolateEffectiveRate(salary.salaryAvg, brackets);
        const totalTax = salary.salaryAvg * (effectiveRate / 100);
        netSalary = salary.salaryAvg - totalTax;
      }

      return {
        country: {
          id: country.id,
          name: country.name,
          slug: country.slug,
          code: country.code,
          continent: country.continent,
          currency: country.currency,
          currencySymbol: country.currencySymbol,
        },
        salary: salary
          ? {
              salaryAvg: salary.salaryAvg,
              salaryMedian: salary.salaryMedian,
              salaryEntry: salary.salaryEntry,
              salarySenior: salary.salarySenior,
              salaryMin: salary.salaryMin,
              salaryMax: salary.salaryMax,
              dataYear: salary.dataYear,
            }
          : null,
        costOfLiving: costOfLiving
          ? {
              costIndex: costOfLiving.costIndex,
              rentAvg: costOfLiving.rentAvg,
              rentOutsideCenter: costOfLiving.rentOutsideCenter,
              groceriesMonthly: costOfLiving.groceriesMonthly,
              transportMonthly: costOfLiving.transportMonthly,
              utilitiesMonthly: costOfLiving.utilitiesMonthly,
              internetMonthly: costOfLiving.internetMonthly,
              diningOutAvg: costOfLiving.diningOutAvg,
            }
          : null,
        tax: tax
          ? {
              incomeTaxMin: tax.incomeTaxMin,
              incomeTaxMax: tax.incomeTaxMax,
              socialSecurity: tax.socialSecurity,
              effectiveRate,
            }
          : null,
        netSalary,
      };
    });

    return NextResponse.json({ job, comparisons });
  } catch (error) {
    console.error('Compare salaries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
