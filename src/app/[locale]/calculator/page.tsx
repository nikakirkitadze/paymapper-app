import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getAlternates } from '@/i18n/config';
import CalculatorClient from './CalculatorClient';
import AdSense from '@/components/AdSense';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('calculatorTitle', { appName: 'PayMapper' }),
    description: t('calculatorDescription'),
    alternates: getAlternates('/calculator'),
  };
}

export default async function CalculatorPage() {
  const t = await getTranslations('calculator');

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
      <h1 className="mb-2 text-3xl font-extrabold">{t('title')}</h1>
      <p className="mb-8 max-w-2xl text-slate-400">
        {t('subtitle')}
      </p>

      <CalculatorClient countries={countries} />

      {/* Explanatory text */}
      <div className="mt-12 max-w-3xl">
        <h2 className="mb-4 text-xl font-bold">
          {t('howTaxWorks')}
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-slate-400">
          <p>{t('taxExplainer1')}</p>
          <p>{t('taxExplainer2')}</p>
          <p>{t('taxExplainer3')}</p>
          <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-500">
            {t('disclaimer')}
          </p>
        </div>
      </div>

      <AdSense slot="8966454053" className="mt-8" />
    </div>
  );
}
