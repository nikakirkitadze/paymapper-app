import { APP_NAME } from './constants';
import type { PageMeta, SalaryData, StructuredDataOccupation } from './types';

// ---------------------------------------------------------------------------
// Meta generators
// ---------------------------------------------------------------------------

/**
 * Meta tags for a salary page: `/jobs/[jobSlug]/[countrySlug]`
 */
export function generateSalaryPageMeta(
  jobTitle: string,
  countryName: string,
): PageMeta {
  return {
    title: `${jobTitle} Salary in ${countryName} 2025 | ${APP_NAME}`,
    description: `Explore ${jobTitle} salary data in ${countryName} for 2025. See average, median, entry-level, and senior salaries along with tax and cost of living insights.`,
  };
}

/**
 * Meta tags for the comparison page: `/compare`
 */
export function generateComparePageMeta(
  jobTitle: string,
  countries: string[],
): PageMeta {
  const countryList = countries.join(' vs ');
  return {
    title: `Compare ${jobTitle} Salary: ${countryList} | ${APP_NAME}`,
    description: `Side-by-side comparison of ${jobTitle} salaries in ${countryList}. Compare gross pay, net pay, taxes, and cost of living in one view.`,
  };
}

/**
 * Meta tags for a job overview page: `/jobs/[jobSlug]`
 */
export function generateJobPageMeta(jobTitle: string): PageMeta {
  return {
    title: `${jobTitle} Salary by Country 2025 | ${APP_NAME}`,
    description: `See ${jobTitle} salaries worldwide. Compare pay across countries with detailed tax and cost of living breakdowns.`,
  };
}

// ---------------------------------------------------------------------------
// Structured data (JSON-LD)
// ---------------------------------------------------------------------------

/**
 * Generate a Schema.org `Occupation` structured-data object that can be
 * injected into a `<script type="application/ld+json">` tag.
 */
export function generateStructuredData(
  salaryData: SalaryData,
): StructuredDataOccupation {
  return {
    '@context': 'https://schema.org',
    '@type': 'Occupation',
    name: salaryData.jobTitle,
    occupationLocation: {
      '@type': 'Country',
      name: salaryData.countryName,
    },
    estimatedSalary: {
      '@type': 'MonetaryAmountDistribution',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: salaryData.salaryMin,
        maxValue: salaryData.salaryMax,
        median: salaryData.salaryMedian,
        unitText: 'YEAR',
      },
    },
  };
}

/**
 * Convenience: serialise the structured data to a JSON string ready for
 * embedding in a `<script>` tag.
 */
export function structuredDataToJson(salaryData: SalaryData): string {
  return JSON.stringify(generateStructuredData(salaryData));
}
