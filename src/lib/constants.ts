import type { NavLink, JobCategory, SalaryLevel } from './types';

// ---------------------------------------------------------------------------
// App identity
// ---------------------------------------------------------------------------

export const APP_NAME = 'PayMapper';

export const APP_DESCRIPTION =
  'Compare developer and tech salaries across countries. Explore salary data, tax rates, and cost of living for software engineers, data scientists, and more.';

export const DEFAULT_CURRENCY = 'USD';

// ---------------------------------------------------------------------------
// Salary levels
// ---------------------------------------------------------------------------

export const SALARY_LEVELS: readonly SalaryLevel[] = [
  'entry',
  'median',
  'average',
  'senior',
] as const;

// ---------------------------------------------------------------------------
// Chart colors (10 distinct, accessible palette)
// ---------------------------------------------------------------------------

export const CHART_COLORS: readonly string[] = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
  '#84CC16', // lime-500
] as const;

// ---------------------------------------------------------------------------
// Map defaults (centered roughly on the Atlantic for a global view)
// ---------------------------------------------------------------------------

export const MAP_CENTER: [number, number] = [20, 0];

export const MAP_ZOOM = 2;

// ---------------------------------------------------------------------------
// AdSense
// ---------------------------------------------------------------------------

export const ADSENSE_CLIENT_ID = 'ca-pub-XXXXXXXXXXXXXXXX';

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Compare', href: '/compare' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Countries', href: '/countries' },
  { label: 'Map', href: '/map' },
];

// ---------------------------------------------------------------------------
// Job categories
// ---------------------------------------------------------------------------

export const JOB_CATEGORIES: JobCategory[] = [
  { label: 'Software Engineering', slug: 'software-engineering' },
  { label: 'Data & Analytics', slug: 'data-analytics' },
  { label: 'DevOps & Infrastructure', slug: 'devops-infrastructure' },
  { label: 'Design & UX', slug: 'design-ux' },
  { label: 'Product & Management', slug: 'product-management' },
  { label: 'Cybersecurity', slug: 'cybersecurity' },
  { label: 'QA & Testing', slug: 'qa-testing' },
  { label: 'Mobile Development', slug: 'mobile-development' },
  { label: 'AI & Machine Learning', slug: 'ai-machine-learning' },
  { label: 'Cloud & Networking', slug: 'cloud-networking' },
];
