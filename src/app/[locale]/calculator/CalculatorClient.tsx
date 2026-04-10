'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { trackCalculatorSubmit } from '@/lib/analytics';

interface Country {
  slug: string;
  name: string;
  code: string;
}

interface NetResult {
  gross: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
}

interface CalculatorClientProps {
  countries: Country[];
}

export default function CalculatorClient({ countries }: CalculatorClientProps) {
  const t = useTranslations('calculator');
  const [salary, setSalary] = useState('');
  const [countrySlug, setCountrySlug] = useState(countries[0]?.slug ?? '');
  const [result, setResult] = useState<NetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    const amount = parseFloat(salary);
    if (!amount || amount <= 0) {
      setError(t('invalidSalary'));
      return;
    }
    if (!countrySlug) {
      setError(t('selectCountry'));
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `/api/calculate-net?gross=${amount}&country=${encodeURIComponent(countrySlug)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        trackCalculatorSubmit(countrySlug, amount);
      } else {
        setError(t('taxNotAvailable'));
      }
    } catch {
      setError(t('calcFailed'));
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = countries.find((c) => c.slug === countrySlug);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Input */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-6 text-lg font-bold">{t('enterDetails')}</h2>

        <div className="mb-4">
          <label
            htmlFor="salary-input"
            className="mb-2 block text-sm font-medium text-slate-400"
          >
            {t('grossAnnualSalary')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              $
            </span>
            <input
              id="salary-input"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder={t('salaryPlaceholder')}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-8 pr-4 text-white placeholder-slate-500 outline-none transition-all focus:border-[#3b82f6]/50 focus:ring-2 focus:ring-[#3b82f6]/20"
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="country-select"
            className="mb-2 block text-sm font-medium text-slate-400"
          >
            {t('country')}
          </label>
          <select
            id="country-select"
            value={countrySlug}
            onChange={(e) => setCountrySlug(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#3b82f6]/50 focus:ring-2 focus:ring-[#3b82f6]/20"
          >
            {countries.map((c) => (
              <option key={c.slug} value={c.slug} className="bg-[#0a0f1e]">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full rounded-xl bg-[#3b82f6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb] disabled:opacity-50"
        >
          {loading ? t('calculating') : t('calculateNetSalary')}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-6 text-lg font-bold">{t('results')}</h2>

        {result ? (
          <div className="space-y-4">
            {selectedCountry && (
              <p className="text-sm text-slate-400">
                {t('netEstimateFor')}{' '}
                <span className="font-semibold text-white">
                  {selectedCountry.name}
                </span>
              </p>
            )}

            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-sm text-slate-400">{t('grossAnnual')}</span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(result.gross)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-sm text-slate-400">
                {t('effectiveTaxRate')}
              </span>
              <span className="text-lg font-bold text-red-400">
                {formatPercent(result.effectiveRate)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-sm text-slate-400">{t('totalTax')}</span>
              <span className="text-lg font-bold text-red-400">
                -{formatCurrency(result.totalTax)}
              </span>
            </div>

            <div className="rounded-xl bg-emerald-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-300">
                  {t('netAnnual')}
                </span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {formatCurrency(result.netAnnual)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-300">
                  {t('netMonthly')}
                </span>
                <span className="text-xl font-bold text-emerald-400">
                  {formatCurrency(result.netMonthly)}
                </span>
              </div>
            </div>

            {/* Visual breakdown */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-slate-400">
                {t('salaryBreakdown')}
              </p>
              <div className="flex h-6 overflow-hidden rounded-full">
                <div
                  className="bg-emerald-500 transition-all"
                  style={{
                    width: `${((result.netAnnual / result.gross) * 100).toFixed(1)}%`,
                  }}
                />
                <div
                  className="bg-red-500 transition-all"
                  style={{
                    width: `${((result.totalTax / result.gross) * 100).toFixed(1)}%`,
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-emerald-400">
                  {t('takeHome', { pct: ((result.netAnnual / result.gross) * 100).toFixed(1) })}
                </span>
                <span className="text-red-400">
                  {t('tax', { pct: ((result.totalTax / result.gross) * 100).toFixed(1) })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center text-slate-500">
            <p className="text-center text-sm">
              {t('enterSalaryPrompt')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
