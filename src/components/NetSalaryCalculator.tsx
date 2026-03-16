'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import type { NetSalaryResult } from '@/lib/types';

const countries = [
  { name: 'United States', slug: 'united-states' },
  { name: 'United Kingdom', slug: 'united-kingdom' },
  { name: 'Germany', slug: 'germany' },
  { name: 'France', slug: 'france' },
  { name: 'Canada', slug: 'canada' },
  { name: 'Australia', slug: 'australia' },
  { name: 'Netherlands', slug: 'netherlands' },
  { name: 'Switzerland', slug: 'switzerland' },
  { name: 'Sweden', slug: 'sweden' },
  { name: 'Norway', slug: 'norway' },
  { name: 'Denmark', slug: 'denmark' },
  { name: 'Ireland', slug: 'ireland' },
  { name: 'Spain', slug: 'spain' },
  { name: 'Italy', slug: 'italy' },
  { name: 'Portugal', slug: 'portugal' },
  { name: 'Poland', slug: 'poland' },
  { name: 'Japan', slug: 'japan' },
  { name: 'South Korea', slug: 'south-korea' },
  { name: 'Singapore', slug: 'singapore' },
  { name: 'India', slug: 'india' },
  { name: 'Brazil', slug: 'brazil' },
  { name: 'Mexico', slug: 'mexico' },
  { name: 'Argentina', slug: 'argentina' },
  { name: 'Chile', slug: 'chile' },
  { name: 'Israel', slug: 'israel' },
  { name: 'UAE', slug: 'uae' },
  { name: 'New Zealand', slug: 'new-zealand' },
  { name: 'Belgium', slug: 'belgium' },
  { name: 'Austria', slug: 'austria' },
  { name: 'Finland', slug: 'finland' },
  { name: 'Czech Republic', slug: 'czech-republic' },
  { name: 'Romania', slug: 'romania' },
];

export default function NetSalaryCalculator() {
  const [grossSalary, setGrossSalary] = useState('');
  const [countrySlug, setCountrySlug] = useState('');
  const [result, setResult] = useState<NetSalaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!grossSalary || !countrySlug) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/calculate-net', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gross: Number(grossSalary),
          country: countrySlug,
        }),
      });

      if (!res.ok) {
        throw new Error('Calculation failed');
      }

      const data: NetSalaryResult = await res.json();
      setResult(data);
    } catch {
      setError('Could not calculate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Percentage widths for the visual breakdown bar
  const taxPercent = result
    ? Math.round((result.totalTax / result.gross) * 100)
    : 0;
  const takeHomePercent = result ? 100 - taxPercent : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-white">
        Net Salary Calculator
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        Estimate your take-home pay after taxes.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="gross-salary"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Gross Annual Salary (USD)
          </label>
          <input
            id="gross-salary"
            type="number"
            min={0}
            step={1000}
            value={grossSalary}
            onChange={(e) => setGrossSalary(e.target.value)}
            placeholder="e.g. 80000"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
            required
          />
        </div>

        <div>
          <label
            htmlFor="calc-country"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Country
          </label>
          <select
            id="calc-country"
            value={countrySlug}
            onChange={(e) => setCountrySlug(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
            required
          >
            <option value="" disabled className="bg-[#0f172a]">
              Select country
            </option>
            {countries.map((c) => (
              <option
                key={c.slug}
                value={c.slug}
                className="bg-[#0f172a] text-white"
              >
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-[#3b82f6] py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-[#2563eb] hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-60"
        >
          {isLoading ? 'Calculating...' : 'Calculate'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
              {/* Summary numbers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Gross Annual
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {formatCurrency(result.gross)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Total Taxes
                  </p>
                  <p className="mt-1 text-xl font-bold text-red-400">
                    {formatCurrency(result.totalTax)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Net Annual
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-400">
                    {formatCurrency(result.netAnnual)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Net Monthly
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-400">
                    {formatCurrency(result.netMonthly)}
                  </p>
                </div>
              </div>

              {/* Visual breakdown bar */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Tax: {formatPercent(result.effectiveRate)} ({taxPercent}%)
                  </span>
                  <span>Take-home: {takeHomePercent}%</span>
                </div>
                <div className="flex h-4 w-full overflow-hidden rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${taxPercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="bg-red-500"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${takeHomePercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                    className="bg-emerald-500"
                  />
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                    Taxes
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Take-home
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
