// ---------------------------------------------------------------------------
// Salary
// ---------------------------------------------------------------------------

export interface SalaryData {
  salaryAvg: number;
  salaryMedian: number;
  salaryEntry: number;
  salarySenior: number;
  salaryMin: number;
  salaryMax: number;
  jobTitle: string;
  jobSlug: string;
  countryName: string;
  countrySlug: string;
  countryCode: string;
}

export type SalaryLevel = 'entry' | 'median' | 'average' | 'senior';

// ---------------------------------------------------------------------------
// Tax
// ---------------------------------------------------------------------------

export interface TaxData {
  incomeTaxMin: number;
  incomeTaxMax: number;
  socialSecurity: number;
  effectiveRate30k: number;
  effectiveRate50k: number;
  effectiveRate75k: number;
  effectiveRate100k: number;
  effectiveRate150k: number;
}

export interface NetSalaryResult {
  gross: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
}

// ---------------------------------------------------------------------------
// Cost of Living
// ---------------------------------------------------------------------------

export interface CostOfLivingData {
  rentAvg: number;
  rentOutsideCenter: number;
  groceriesMonthly: number;
  transportMonthly: number;
  utilitiesMonthly: number;
  internetMonthly: number;
  diningOutAvg: number;
  costIndex: number;
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

export interface ComparisonCountry {
  countryName: string;
  countrySlug: string;
  countryCode: string;
  salary: SalaryData;
  tax: TaxData | null;
  costOfLiving: CostOfLivingData | null;
  netSalary: NetSalaryResult | null;
}

export interface ComparisonResult {
  jobTitle: string;
  jobSlug: string;
  countries: ComparisonCountry[];
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchResult {
  type: 'job' | 'country';
  title: string;
  slug: string;
  category?: string;
  countryCode?: string;
}

// ---------------------------------------------------------------------------
// Map
// ---------------------------------------------------------------------------

export interface CountryMapData {
  countryCode: string;
  countryName: string;
  salaryValue: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Navigation & Layout
// ---------------------------------------------------------------------------

export interface NavLink {
  label: string;
  href: string;
}

export interface JobCategory {
  label: string;
  slug: string;
}

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export interface PageMeta {
  title: string;
  description: string;
}

export interface StructuredDataOccupation {
  '@context': string;
  '@type': string;
  name: string;
  occupationLocation?: {
    '@type': string;
    name: string;
  };
  estimatedSalary?: {
    '@type': string;
    currency: string;
    value: {
      '@type': string;
      minValue: number;
      maxValue: number;
      median: number;
      unitText: string;
    };
  };
}
