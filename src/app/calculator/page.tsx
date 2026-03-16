import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { APP_NAME } from '@/lib/constants';
import CalculatorClient from './CalculatorClient';
import AdSense from '@/components/AdSense';

export const metadata: Metadata = {
  title: `Net Salary Calculator | ${APP_NAME}`,
  description:
    'Calculate your net salary after taxes in any country. Compare take-home pay across different countries and salary levels.',
};

export default async function CalculatorPage() {
  let countries: {
    slug: string;
    name: string;
    code: string;
  }[] = [];

  try {
    countries = await prisma.country.findMany({
      select: { slug: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  } catch {
    // Continue with empty countries
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-extrabold">Net Salary Calculator</h1>
      <p className="mb-8 max-w-2xl text-slate-400">
        Enter your gross annual salary and select a country to estimate your
        take-home pay after taxes. Our calculator uses real tax bracket data
        to provide an accurate estimate.
      </p>

      <CalculatorClient countries={countries} />

      {/* Explanatory text */}
      <div className="mt-12 max-w-3xl">
        <h2 className="mb-4 text-xl font-bold">
          How Tax Calculations Work
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-slate-400">
          <p>
            Our net salary calculations use real-world tax bracket data for each
            country. We estimate the effective tax rate by interpolating between
            known brackets (at $30K, $50K, $75K, $100K, and $150K income
            levels).
          </p>
          <p>
            The calculation includes income tax and social security
            contributions (employee portion). Please note that actual
            take-home pay may vary based on your personal circumstances,
            deductions, filing status, and local/state taxes.
          </p>
          <p>
            All salaries are displayed in USD for easy comparison. Currency
            conversion rates are approximate and may differ from current
            market rates.
          </p>
          <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-500">
            Disclaimer: This calculator provides estimates for informational
            purposes only. It should not be used as a substitute for
            professional tax advice. Always consult a qualified tax
            professional for your specific situation.
          </p>
        </div>
      </div>

      <AdSense slot="8966454053" className="mt-8" />
    </div>
  );
}
