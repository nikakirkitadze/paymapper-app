import type { TaxData, NetSalaryResult } from './types';

// Bracket thresholds that match the Tax model columns
const BRACKETS = [30_000, 50_000, 75_000, 100_000, 150_000] as const;

/**
 * Return the array of effective-rate values from a TaxData object,
 * ordered to match the BRACKETS array.
 */
function ratesFromTaxData(taxData: TaxData): number[] {
  return [
    taxData.effectiveRate30k,
    taxData.effectiveRate50k,
    taxData.effectiveRate75k,
    taxData.effectiveRate100k,
    taxData.effectiveRate150k,
  ];
}

/**
 * Linearly interpolate between two values.
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Estimate the effective tax rate for a given gross salary by interpolating
 * (or carefully extrapolating) between the known bracket rates.
 *
 * - Below 30k: linearly extrapolate down from the 30k-50k segment, floored at 0 %.
 * - Between brackets: linear interpolation.
 * - Above 150k: linearly extrapolate up from the 100k-150k segment, capped at 60 %.
 */
function interpolateEffectiveRate(
  grossSalary: number,
  taxData: TaxData,
): number {
  const rates = ratesFromTaxData(taxData);

  // Below lowest bracket
  if (grossSalary <= BRACKETS[0]) {
    const slope =
      (rates[1] - rates[0]) / (BRACKETS[1] - BRACKETS[0]);
    const extrapolated = rates[0] - slope * (BRACKETS[0] - grossSalary);
    return Math.max(0, extrapolated);
  }

  // Above highest bracket
  if (grossSalary >= BRACKETS[BRACKETS.length - 1]) {
    const lastIdx = BRACKETS.length - 1;
    const prevIdx = lastIdx - 1;
    const slope =
      (rates[lastIdx] - rates[prevIdx]) /
      (BRACKETS[lastIdx] - BRACKETS[prevIdx]);
    const extrapolated =
      rates[lastIdx] + slope * (grossSalary - BRACKETS[lastIdx]);
    // Cap at 60 % to avoid absurd extrapolation
    return Math.min(60, extrapolated);
  }

  // Between two brackets — find the segment and interpolate
  for (let i = 0; i < BRACKETS.length - 1; i++) {
    if (grossSalary >= BRACKETS[i] && grossSalary <= BRACKETS[i + 1]) {
      const t =
        (grossSalary - BRACKETS[i]) / (BRACKETS[i + 1] - BRACKETS[i]);
      return lerp(rates[i], rates[i + 1], t);
    }
  }

  // Fallback (should never reach here)
  return rates[rates.length - 1];
}

/**
 * Calculate net salary from a gross annual salary and a country's tax data.
 *
 * The effective rate is interpolated from the stored bracket rates and then
 * applied to the gross salary.
 */
export function calculateNetSalary(
  grossSalary: number,
  countryTaxData: TaxData,
): NetSalaryResult {
  const effectiveRate = interpolateEffectiveRate(grossSalary, countryTaxData);
  const effectiveRateDecimal = effectiveRate / 100;
  const totalTax = Math.round(grossSalary * effectiveRateDecimal);
  const netAnnual = Math.round(grossSalary - totalTax);
  const netMonthly = Math.round(netAnnual / 12);

  return {
    gross: grossSalary,
    totalTax,
    netAnnual,
    netMonthly,
    effectiveRate: Math.round(effectiveRate * 100) / 100, // two-decimal precision
  };
}
