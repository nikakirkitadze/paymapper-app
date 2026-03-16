import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helper: slugify
// ---------------------------------------------------------------------------
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ---------------------------------------------------------------------------
// JOBS (50+)
// ---------------------------------------------------------------------------
interface JobDef {
  title: string;
  category: string;
  /** Base US salary (avg) used to derive per-country numbers */
  baseSalaryUSD: number;
}

const jobs: JobDef[] = [
  // Engineering – General (12)
  { title: 'Software Engineer', category: 'Engineering', baseSalaryUSD: 120000 },
  { title: 'Frontend Developer', category: 'Engineering', baseSalaryUSD: 110000 },
  { title: 'Backend Developer', category: 'Engineering', baseSalaryUSD: 125000 },
  { title: 'Full Stack Developer', category: 'Engineering', baseSalaryUSD: 118000 },
  { title: 'Mobile Developer', category: 'Engineering', baseSalaryUSD: 115000 },
  { title: 'DevOps Engineer', category: 'Engineering', baseSalaryUSD: 130000 },
  { title: 'Site Reliability Engineer', category: 'Engineering', baseSalaryUSD: 140000 },
  { title: 'QA Engineer', category: 'Engineering', baseSalaryUSD: 85000 },
  { title: 'Embedded Systems Engineer', category: 'Engineering', baseSalaryUSD: 110000 },
  { title: 'Cloud Architect', category: 'Engineering', baseSalaryUSD: 155000 },
  { title: 'Security Engineer', category: 'Engineering', baseSalaryUSD: 135000 },
  { title: 'Machine Learning Engineer', category: 'Engineering', baseSalaryUSD: 150000 },

  // Engineering – Mobile & Platform
  { title: 'iOS Developer', category: 'Engineering', baseSalaryUSD: 120000 },
  { title: 'Android Developer', category: 'Engineering', baseSalaryUSD: 118000 },
  { title: 'React Native Developer', category: 'Engineering', baseSalaryUSD: 112000 },
  { title: 'Flutter Developer', category: 'Engineering', baseSalaryUSD: 110000 },

  // Engineering – Frontend Stacks
  { title: 'React Developer', category: 'Engineering', baseSalaryUSD: 115000 },
  { title: 'Angular Developer', category: 'Engineering', baseSalaryUSD: 110000 },
  { title: 'Vue.js Developer', category: 'Engineering', baseSalaryUSD: 108000 },

  // Engineering – Backend Stacks
  { title: 'Node.js Developer', category: 'Engineering', baseSalaryUSD: 118000 },
  { title: 'Python Developer', category: 'Engineering', baseSalaryUSD: 120000 },
  { title: 'Java Developer', category: 'Engineering', baseSalaryUSD: 122000 },
  { title: 'Go Developer', category: 'Engineering', baseSalaryUSD: 130000 },
  { title: '.NET Developer', category: 'Engineering', baseSalaryUSD: 115000 },
  { title: 'PHP Developer', category: 'Engineering', baseSalaryUSD: 90000 },
  { title: 'Ruby on Rails Developer', category: 'Engineering', baseSalaryUSD: 112000 },
  { title: 'Rust Developer', category: 'Engineering', baseSalaryUSD: 135000 },

  // Engineering – Specialized
  { title: 'Blockchain Developer', category: 'Engineering', baseSalaryUSD: 140000 },
  { title: 'Game Developer', category: 'Engineering', baseSalaryUSD: 95000 },
  { title: 'Platform Engineer', category: 'Engineering', baseSalaryUSD: 140000 },
  { title: 'Solutions Architect', category: 'Engineering', baseSalaryUSD: 150000 },
  { title: 'Engineering Manager', category: 'Engineering', baseSalaryUSD: 165000 },
  { title: 'Technical Lead', category: 'Engineering', baseSalaryUSD: 155000 },
  { title: 'WordPress Developer', category: 'Engineering', baseSalaryUSD: 70000 },

  // Design (5)
  { title: 'UX Designer', category: 'Design', baseSalaryUSD: 95000 },
  { title: 'UI Designer', category: 'Design', baseSalaryUSD: 88000 },
  { title: 'Product Designer', category: 'Design', baseSalaryUSD: 105000 },
  { title: 'Graphic Designer', category: 'Design', baseSalaryUSD: 60000 },
  { title: 'UX Researcher', category: 'Design', baseSalaryUSD: 98000 },

  // Product (5)
  { title: 'Product Manager', category: 'Product', baseSalaryUSD: 130000 },
  { title: 'Technical Program Manager', category: 'Product', baseSalaryUSD: 140000 },
  { title: 'Product Analyst', category: 'Product', baseSalaryUSD: 90000 },
  { title: 'Scrum Master', category: 'Product', baseSalaryUSD: 100000 },
  { title: 'Business Analyst', category: 'Product', baseSalaryUSD: 85000 },

  // Data (6)
  { title: 'Data Scientist', category: 'Data', baseSalaryUSD: 130000 },
  { title: 'Data Engineer', category: 'Data', baseSalaryUSD: 125000 },
  { title: 'Data Analyst', category: 'Data', baseSalaryUSD: 80000 },
  { title: 'Database Administrator', category: 'Data', baseSalaryUSD: 95000 },
  { title: 'Business Intelligence Analyst', category: 'Data', baseSalaryUSD: 88000 },
  { title: 'AI Research Scientist', category: 'Data', baseSalaryUSD: 170000 },

  // Marketing (5)
  { title: 'Marketing Manager', category: 'Marketing', baseSalaryUSD: 90000 },
  { title: 'Digital Marketing Specialist', category: 'Marketing', baseSalaryUSD: 65000 },
  { title: 'SEO Specialist', category: 'Marketing', baseSalaryUSD: 60000 },
  { title: 'Content Marketing Manager', category: 'Marketing', baseSalaryUSD: 75000 },
  { title: 'Growth Marketing Manager', category: 'Marketing', baseSalaryUSD: 100000 },

  // Finance (5)
  { title: 'Financial Analyst', category: 'Finance', baseSalaryUSD: 80000 },
  { title: 'Accountant', category: 'Finance', baseSalaryUSD: 65000 },
  { title: 'Investment Banker', category: 'Finance', baseSalaryUSD: 150000 },
  { title: 'Financial Controller', category: 'Finance', baseSalaryUSD: 110000 },
  { title: 'Risk Analyst', category: 'Finance', baseSalaryUSD: 85000 },

  // Healthcare (5)
  { title: 'Registered Nurse', category: 'Healthcare', baseSalaryUSD: 75000 },
  { title: 'Physician', category: 'Healthcare', baseSalaryUSD: 220000 },
  { title: 'Pharmacist', category: 'Healthcare', baseSalaryUSD: 120000 },
  { title: 'Physical Therapist', category: 'Healthcare', baseSalaryUSD: 85000 },
  { title: 'Medical Laboratory Scientist', category: 'Healthcare', baseSalaryUSD: 60000 },

  // Legal (4)
  { title: 'Corporate Lawyer', category: 'Legal', baseSalaryUSD: 160000 },
  { title: 'Paralegal', category: 'Legal', baseSalaryUSD: 55000 },
  { title: 'Compliance Officer', category: 'Legal', baseSalaryUSD: 85000 },
  { title: 'Legal Counsel', category: 'Legal', baseSalaryUSD: 140000 },

  // Education (4)
  { title: 'University Professor', category: 'Education', baseSalaryUSD: 85000 },
  { title: 'High School Teacher', category: 'Education', baseSalaryUSD: 55000 },
  { title: 'Instructional Designer', category: 'Education', baseSalaryUSD: 70000 },
  { title: 'Education Administrator', category: 'Education', baseSalaryUSD: 75000 },

  // Sales (5)
  { title: 'Sales Manager', category: 'Sales', baseSalaryUSD: 95000 },
  { title: 'Account Executive', category: 'Sales', baseSalaryUSD: 85000 },
  { title: 'Sales Engineer', category: 'Sales', baseSalaryUSD: 120000 },
  { title: 'Business Development Manager', category: 'Sales', baseSalaryUSD: 100000 },
  { title: 'Customer Success Manager', category: 'Sales', baseSalaryUSD: 80000 },
];

// ---------------------------------------------------------------------------
// COUNTRIES (31)
// ---------------------------------------------------------------------------
interface CountryDef {
  name: string;
  code: string;
  continent: string;
  currency: string;
  currencySymbol: string;
  latitude: number;
  longitude: number;
  /** Multiplier applied to US base salary to get this country's average */
  salaryMultiplier: number;
}

const countries: CountryDef[] = [
  { name: 'United States', code: 'US', continent: 'North America', currency: 'USD', currencySymbol: '$', latitude: 37.0902, longitude: -95.7129, salaryMultiplier: 1.0 },
  { name: 'Germany', code: 'DE', continent: 'Europe', currency: 'EUR', currencySymbol: '\u20AC', latitude: 51.1657, longitude: 10.4515, salaryMultiplier: 0.60 },
  { name: 'Canada', code: 'CA', continent: 'North America', currency: 'CAD', currencySymbol: 'C$', latitude: 56.1304, longitude: -106.3468, salaryMultiplier: 0.72 },
  { name: 'United Kingdom', code: 'GB', continent: 'Europe', currency: 'GBP', currencySymbol: '\u00A3', latitude: 55.3781, longitude: -3.4360, salaryMultiplier: 0.65 },
  { name: 'Australia', code: 'AU', continent: 'Oceania', currency: 'AUD', currencySymbol: 'A$', latitude: -25.2744, longitude: 133.7751, salaryMultiplier: 0.70 },
  { name: 'Georgia', code: 'GE', continent: 'Asia', currency: 'GEL', currencySymbol: '\u20BE', latitude: 42.3154, longitude: 43.3569, salaryMultiplier: 0.18 },
  { name: 'Netherlands', code: 'NL', continent: 'Europe', currency: 'EUR', currencySymbol: '\u20AC', latitude: 52.1326, longitude: 5.2913, salaryMultiplier: 0.62 },
  { name: 'Singapore', code: 'SG', continent: 'Asia', currency: 'SGD', currencySymbol: 'S$', latitude: 1.3521, longitude: 103.8198, salaryMultiplier: 0.65 },
  { name: 'Japan', code: 'JP', continent: 'Asia', currency: 'JPY', currencySymbol: '\u00A5', latitude: 36.2048, longitude: 138.2529, salaryMultiplier: 0.50 },
  { name: 'South Korea', code: 'KR', continent: 'Asia', currency: 'KRW', currencySymbol: '\u20A9', latitude: 35.9078, longitude: 127.7669, salaryMultiplier: 0.45 },
  { name: 'France', code: 'FR', continent: 'Europe', currency: 'EUR', currencySymbol: '\u20AC', latitude: 46.2276, longitude: 2.2137, salaryMultiplier: 0.55 },
  { name: 'Switzerland', code: 'CH', continent: 'Europe', currency: 'CHF', currencySymbol: 'CHF', latitude: 46.8182, longitude: 8.2275, salaryMultiplier: 0.90 },
  { name: 'Sweden', code: 'SE', continent: 'Europe', currency: 'SEK', currencySymbol: 'kr', latitude: 60.1282, longitude: 18.6435, salaryMultiplier: 0.55 },
  { name: 'Norway', code: 'NO', continent: 'Europe', currency: 'NOK', currencySymbol: 'kr', latitude: 60.4720, longitude: 8.4689, salaryMultiplier: 0.60 },
  { name: 'Denmark', code: 'DK', continent: 'Europe', currency: 'DKK', currencySymbol: 'kr', latitude: 56.2639, longitude: 9.5018, salaryMultiplier: 0.58 },
  { name: 'Ireland', code: 'IE', continent: 'Europe', currency: 'EUR', currencySymbol: '\u20AC', latitude: 53.1424, longitude: -7.6921, salaryMultiplier: 0.65 },
  { name: 'India', code: 'IN', continent: 'Asia', currency: 'INR', currencySymbol: '\u20B9', latitude: 20.5937, longitude: 78.9629, salaryMultiplier: 0.14 },
  { name: 'Brazil', code: 'BR', continent: 'South America', currency: 'BRL', currencySymbol: 'R$', latitude: -14.2350, longitude: -51.9253, salaryMultiplier: 0.22 },
  { name: 'Mexico', code: 'MX', continent: 'North America', currency: 'MXN', currencySymbol: 'Mex$', latitude: 23.6345, longitude: -102.5528, salaryMultiplier: 0.20 },
  { name: 'United Arab Emirates', code: 'AE', continent: 'Asia', currency: 'AED', currencySymbol: 'AED', latitude: 23.4241, longitude: 53.8478, salaryMultiplier: 0.60 },
  { name: 'Israel', code: 'IL', continent: 'Asia', currency: 'ILS', currencySymbol: '\u20AA', latitude: 31.0461, longitude: 34.8516, salaryMultiplier: 0.70 },
  { name: 'New Zealand', code: 'NZ', continent: 'Oceania', currency: 'NZD', currencySymbol: 'NZ$', latitude: -40.9006, longitude: 174.886, salaryMultiplier: 0.58 },
  { name: 'Poland', code: 'PL', continent: 'Europe', currency: 'PLN', currencySymbol: 'z\u0142', latitude: 51.9194, longitude: 19.1451, salaryMultiplier: 0.32 },
  { name: 'Spain', code: 'ES', continent: 'Europe', currency: 'EUR', currencySymbol: '\u20AC', latitude: 40.4637, longitude: -3.7492, salaryMultiplier: 0.40 },
  { name: 'Italy', code: 'IT', continent: 'Europe', currency: 'EUR', currencySymbol: '\u20AC', latitude: 41.8719, longitude: 12.5674, salaryMultiplier: 0.42 },
  { name: 'Portugal', code: 'PT', continent: 'Europe', currency: 'EUR', currencySymbol: '\u20AC', latitude: 39.3999, longitude: -8.2245, salaryMultiplier: 0.30 },
  { name: 'Belgium', code: 'BE', continent: 'Europe', currency: 'EUR', currencySymbol: '\u20AC', latitude: 50.5039, longitude: 4.4699, salaryMultiplier: 0.55 },
  { name: 'Austria', code: 'AT', continent: 'Europe', currency: 'EUR', currencySymbol: '\u20AC', latitude: 47.5162, longitude: 14.5501, salaryMultiplier: 0.55 },
  { name: 'Finland', code: 'FI', continent: 'Europe', currency: 'EUR', currencySymbol: '\u20AC', latitude: 61.9241, longitude: 25.7482, salaryMultiplier: 0.52 },
  { name: 'Czech Republic', code: 'CZ', continent: 'Europe', currency: 'CZK', currencySymbol: 'K\u010D', latitude: 49.8175, longitude: 15.4730, salaryMultiplier: 0.30 },
  { name: 'China', code: 'CN', continent: 'Asia', currency: 'CNY', currencySymbol: '\u00A5', latitude: 35.8617, longitude: 104.1954, salaryMultiplier: 0.28 },
];

// ---------------------------------------------------------------------------
// CITIES  (2-3 per country)
// ---------------------------------------------------------------------------
interface CityDef {
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  isCapital: boolean;
}

const cities: CityDef[] = [
  // United States
  { name: 'New York', countryCode: 'US', latitude: 40.7128, longitude: -74.0060, isCapital: false },
  { name: 'San Francisco', countryCode: 'US', latitude: 37.7749, longitude: -122.4194, isCapital: false },
  { name: 'Washington D.C.', countryCode: 'US', latitude: 38.9072, longitude: -77.0369, isCapital: true },

  // Germany
  { name: 'Berlin', countryCode: 'DE', latitude: 52.5200, longitude: 13.4050, isCapital: true },
  { name: 'Munich', countryCode: 'DE', latitude: 48.1351, longitude: 11.5820, isCapital: false },
  { name: 'Hamburg', countryCode: 'DE', latitude: 53.5511, longitude: 9.9937, isCapital: false },

  // Canada
  { name: 'Toronto', countryCode: 'CA', latitude: 43.6532, longitude: -79.3832, isCapital: false },
  { name: 'Vancouver', countryCode: 'CA', latitude: 49.2827, longitude: -123.1207, isCapital: false },
  { name: 'Ottawa', countryCode: 'CA', latitude: 45.4215, longitude: -75.6972, isCapital: true },

  // United Kingdom
  { name: 'London', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, isCapital: true },
  { name: 'Manchester', countryCode: 'GB', latitude: 53.4808, longitude: -2.2426, isCapital: false },
  { name: 'Edinburgh', countryCode: 'GB', latitude: 55.9533, longitude: -3.1883, isCapital: false },

  // Australia
  { name: 'Sydney', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, isCapital: false },
  { name: 'Melbourne', countryCode: 'AU', latitude: -37.8136, longitude: 144.9631, isCapital: false },
  { name: 'Canberra', countryCode: 'AU', latitude: -35.2809, longitude: 149.1300, isCapital: true },

  // Georgia
  { name: 'Tbilisi', countryCode: 'GE', latitude: 41.7151, longitude: 44.8271, isCapital: true },
  { name: 'Batumi', countryCode: 'GE', latitude: 41.6168, longitude: 41.6367, isCapital: false },

  // Netherlands
  { name: 'Amsterdam', countryCode: 'NL', latitude: 52.3676, longitude: 4.9041, isCapital: true },
  { name: 'Rotterdam', countryCode: 'NL', latitude: 51.9244, longitude: 4.4777, isCapital: false },
  { name: 'Eindhoven', countryCode: 'NL', latitude: 51.4416, longitude: 5.4697, isCapital: false },

  // Singapore
  { name: 'Singapore', countryCode: 'SG', latitude: 1.3521, longitude: 103.8198, isCapital: true },

  // Japan
  { name: 'Tokyo', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, isCapital: true },
  { name: 'Osaka', countryCode: 'JP', latitude: 34.6937, longitude: 135.5023, isCapital: false },
  { name: 'Fukuoka', countryCode: 'JP', latitude: 33.5904, longitude: 130.4017, isCapital: false },

  // South Korea
  { name: 'Seoul', countryCode: 'KR', latitude: 37.5665, longitude: 126.9780, isCapital: true },
  { name: 'Busan', countryCode: 'KR', latitude: 35.1796, longitude: 129.0756, isCapital: false },

  // France
  { name: 'Paris', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, isCapital: true },
  { name: 'Lyon', countryCode: 'FR', latitude: 45.7640, longitude: 4.8357, isCapital: false },
  { name: 'Toulouse', countryCode: 'FR', latitude: 43.6047, longitude: 1.4442, isCapital: false },

  // Switzerland
  { name: 'Zurich', countryCode: 'CH', latitude: 47.3769, longitude: 8.5417, isCapital: false },
  { name: 'Geneva', countryCode: 'CH', latitude: 46.2044, longitude: 6.1432, isCapital: false },
  { name: 'Bern', countryCode: 'CH', latitude: 46.9480, longitude: 7.4474, isCapital: true },

  // Sweden
  { name: 'Stockholm', countryCode: 'SE', latitude: 59.3293, longitude: 18.0686, isCapital: true },
  { name: 'Gothenburg', countryCode: 'SE', latitude: 57.7089, longitude: 11.9746, isCapital: false },

  // Norway
  { name: 'Oslo', countryCode: 'NO', latitude: 59.9139, longitude: 10.7522, isCapital: true },
  { name: 'Bergen', countryCode: 'NO', latitude: 60.3913, longitude: 5.3221, isCapital: false },

  // Denmark
  { name: 'Copenhagen', countryCode: 'DK', latitude: 55.6761, longitude: 12.5683, isCapital: true },
  { name: 'Aarhus', countryCode: 'DK', latitude: 56.1629, longitude: 10.2039, isCapital: false },

  // Ireland
  { name: 'Dublin', countryCode: 'IE', latitude: 53.3498, longitude: -6.2603, isCapital: true },
  { name: 'Cork', countryCode: 'IE', latitude: 51.8985, longitude: -8.4756, isCapital: false },

  // India
  { name: 'Bangalore', countryCode: 'IN', latitude: 12.9716, longitude: 77.5946, isCapital: false },
  { name: 'Mumbai', countryCode: 'IN', latitude: 19.0760, longitude: 72.8777, isCapital: false },
  { name: 'New Delhi', countryCode: 'IN', latitude: 28.6139, longitude: 77.2090, isCapital: true },

  // Brazil
  { name: 'Sao Paulo', countryCode: 'BR', latitude: -23.5505, longitude: -46.6333, isCapital: false },
  { name: 'Rio de Janeiro', countryCode: 'BR', latitude: -22.9068, longitude: -43.1729, isCapital: false },
  { name: 'Brasilia', countryCode: 'BR', latitude: -15.7975, longitude: -47.8919, isCapital: true },

  // Mexico
  { name: 'Mexico City', countryCode: 'MX', latitude: 19.4326, longitude: -99.1332, isCapital: true },
  { name: 'Guadalajara', countryCode: 'MX', latitude: 20.6597, longitude: -103.3496, isCapital: false },
  { name: 'Monterrey', countryCode: 'MX', latitude: 25.6866, longitude: -100.3161, isCapital: false },

  // UAE
  { name: 'Dubai', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708, isCapital: false },
  { name: 'Abu Dhabi', countryCode: 'AE', latitude: 24.4539, longitude: 54.3773, isCapital: true },

  // Israel
  { name: 'Tel Aviv', countryCode: 'IL', latitude: 32.0853, longitude: 34.7818, isCapital: false },
  { name: 'Jerusalem', countryCode: 'IL', latitude: 31.7683, longitude: 35.2137, isCapital: true },

  // New Zealand
  { name: 'Auckland', countryCode: 'NZ', latitude: -36.8485, longitude: 174.7633, isCapital: false },
  { name: 'Wellington', countryCode: 'NZ', latitude: -41.2865, longitude: 174.7762, isCapital: true },

  // Poland
  { name: 'Warsaw', countryCode: 'PL', latitude: 52.2297, longitude: 21.0122, isCapital: true },
  { name: 'Krakow', countryCode: 'PL', latitude: 50.0647, longitude: 19.9450, isCapital: false },
  { name: 'Wroclaw', countryCode: 'PL', latitude: 51.1079, longitude: 17.0385, isCapital: false },

  // Spain
  { name: 'Madrid', countryCode: 'ES', latitude: 40.4168, longitude: -3.7038, isCapital: true },
  { name: 'Barcelona', countryCode: 'ES', latitude: 41.3874, longitude: 2.1686, isCapital: false },

  // Italy
  { name: 'Milan', countryCode: 'IT', latitude: 45.4642, longitude: 9.1900, isCapital: false },
  { name: 'Rome', countryCode: 'IT', latitude: 41.9028, longitude: 12.4964, isCapital: true },

  // Portugal
  { name: 'Lisbon', countryCode: 'PT', latitude: 38.7223, longitude: -9.1393, isCapital: true },
  { name: 'Porto', countryCode: 'PT', latitude: 41.1579, longitude: -8.6291, isCapital: false },

  // Belgium
  { name: 'Brussels', countryCode: 'BE', latitude: 50.8503, longitude: 4.3517, isCapital: true },
  { name: 'Antwerp', countryCode: 'BE', latitude: 51.2194, longitude: 4.4025, isCapital: false },

  // Austria
  { name: 'Vienna', countryCode: 'AT', latitude: 48.2082, longitude: 16.3738, isCapital: true },
  { name: 'Graz', countryCode: 'AT', latitude: 47.0707, longitude: 15.4395, isCapital: false },

  // Finland
  { name: 'Helsinki', countryCode: 'FI', latitude: 60.1699, longitude: 24.9384, isCapital: true },
  { name: 'Tampere', countryCode: 'FI', latitude: 61.4978, longitude: 23.7610, isCapital: false },

  // Czech Republic
  { name: 'Prague', countryCode: 'CZ', latitude: 50.0755, longitude: 14.4378, isCapital: true },
  { name: 'Brno', countryCode: 'CZ', latitude: 49.1951, longitude: 16.6068, isCapital: false },

  // China
  { name: 'Beijing', countryCode: 'CN', latitude: 39.9042, longitude: 116.4074, isCapital: true },
  { name: 'Shanghai', countryCode: 'CN', latitude: 31.2304, longitude: 121.4737, isCapital: false },
  { name: 'Shenzhen', countryCode: 'CN', latitude: 22.5431, longitude: 114.0579, isCapital: false },
];

// ---------------------------------------------------------------------------
// COST OF LIVING  (per country, monthly USD)
// ---------------------------------------------------------------------------
interface CostOfLivingDef {
  countryCode: string;
  rentAvg: number;
  rentOutsideCenter: number;
  groceriesMonthly: number;
  transportMonthly: number;
  utilitiesMonthly: number;
  internetMonthly: number;
  diningOutAvg: number;
  costIndex: number;
}

const costOfLivingData: CostOfLivingDef[] = [
  { countryCode: 'US', rentAvg: 2100, rentOutsideCenter: 1500, groceriesMonthly: 400, transportMonthly: 110, utilitiesMonthly: 180, internetMonthly: 65, diningOutAvg: 20, costIndex: 100 },
  { countryCode: 'DE', rentAvg: 1100, rentOutsideCenter: 780, groceriesMonthly: 320, transportMonthly: 85, utilitiesMonthly: 260, internetMonthly: 35, diningOutAvg: 14, costIndex: 65 },
  { countryCode: 'CA', rentAvg: 1700, rentOutsideCenter: 1250, groceriesMonthly: 350, transportMonthly: 100, utilitiesMonthly: 160, internetMonthly: 60, diningOutAvg: 18, costIndex: 75 },
  { countryCode: 'GB', rentAvg: 1800, rentOutsideCenter: 1200, groceriesMonthly: 340, transportMonthly: 90, utilitiesMonthly: 200, internetMonthly: 35, diningOutAvg: 17, costIndex: 75 },
  { countryCode: 'AU', rentAvg: 1600, rentOutsideCenter: 1100, groceriesMonthly: 380, transportMonthly: 110, utilitiesMonthly: 170, internetMonthly: 55, diningOutAvg: 18, costIndex: 73 },
  { countryCode: 'GE', rentAvg: 450, rentOutsideCenter: 280, groceriesMonthly: 180, transportMonthly: 25, utilitiesMonthly: 70, internetMonthly: 12, diningOutAvg: 7, costIndex: 28 },
  { countryCode: 'NL', rentAvg: 1500, rentOutsideCenter: 1050, groceriesMonthly: 330, transportMonthly: 95, utilitiesMonthly: 220, internetMonthly: 40, diningOutAvg: 17, costIndex: 73 },
  { countryCode: 'SG', rentAvg: 2400, rentOutsideCenter: 1700, groceriesMonthly: 350, transportMonthly: 80, utilitiesMonthly: 130, internetMonthly: 30, diningOutAvg: 12, costIndex: 81 },
  { countryCode: 'JP', rentAvg: 1100, rentOutsideCenter: 700, groceriesMonthly: 320, transportMonthly: 80, utilitiesMonthly: 150, internetMonthly: 35, diningOutAvg: 10, costIndex: 60 },
  { countryCode: 'KR', rentAvg: 900, rentOutsideCenter: 550, groceriesMonthly: 300, transportMonthly: 55, utilitiesMonthly: 120, internetMonthly: 20, diningOutAvg: 8, costIndex: 52 },
  { countryCode: 'FR', rentAvg: 1200, rentOutsideCenter: 800, groceriesMonthly: 350, transportMonthly: 75, utilitiesMonthly: 180, internetMonthly: 30, diningOutAvg: 15, costIndex: 65 },
  { countryCode: 'CH', rentAvg: 2500, rentOutsideCenter: 1900, groceriesMonthly: 500, transportMonthly: 110, utilitiesMonthly: 200, internetMonthly: 50, diningOutAvg: 30, costIndex: 120 },
  { countryCode: 'SE', rentAvg: 1200, rentOutsideCenter: 850, groceriesMonthly: 320, transportMonthly: 80, utilitiesMonthly: 100, internetMonthly: 30, diningOutAvg: 15, costIndex: 62 },
  { countryCode: 'NO', rentAvg: 1500, rentOutsideCenter: 1100, groceriesMonthly: 400, transportMonthly: 90, utilitiesMonthly: 160, internetMonthly: 45, diningOutAvg: 22, costIndex: 78 },
  { countryCode: 'DK', rentAvg: 1400, rentOutsideCenter: 1000, groceriesMonthly: 370, transportMonthly: 80, utilitiesMonthly: 170, internetMonthly: 35, diningOutAvg: 20, costIndex: 73 },
  { countryCode: 'IE', rentAvg: 1900, rentOutsideCenter: 1350, groceriesMonthly: 350, transportMonthly: 100, utilitiesMonthly: 180, internetMonthly: 45, diningOutAvg: 18, costIndex: 76 },
  { countryCode: 'IN', rentAvg: 300, rentOutsideCenter: 150, groceriesMonthly: 120, transportMonthly: 20, utilitiesMonthly: 40, internetMonthly: 8, diningOutAvg: 3, costIndex: 18 },
  { countryCode: 'BR', rentAvg: 400, rentOutsideCenter: 250, groceriesMonthly: 150, transportMonthly: 35, utilitiesMonthly: 60, internetMonthly: 15, diningOutAvg: 6, costIndex: 25 },
  { countryCode: 'MX', rentAvg: 500, rentOutsideCenter: 320, groceriesMonthly: 160, transportMonthly: 25, utilitiesMonthly: 40, internetMonthly: 20, diningOutAvg: 5, costIndex: 26 },
  { countryCode: 'AE', rentAvg: 1800, rentOutsideCenter: 1200, groceriesMonthly: 350, transportMonthly: 85, utilitiesMonthly: 160, internetMonthly: 50, diningOutAvg: 12, costIndex: 67 },
  { countryCode: 'IL', rentAvg: 1600, rentOutsideCenter: 1100, groceriesMonthly: 400, transportMonthly: 70, utilitiesMonthly: 160, internetMonthly: 25, diningOutAvg: 16, costIndex: 72 },
  { countryCode: 'NZ', rentAvg: 1300, rentOutsideCenter: 950, groceriesMonthly: 350, transportMonthly: 100, utilitiesMonthly: 140, internetMonthly: 50, diningOutAvg: 16, costIndex: 65 },
  { countryCode: 'PL', rentAvg: 700, rentOutsideCenter: 480, groceriesMonthly: 220, transportMonthly: 35, utilitiesMonthly: 150, internetMonthly: 12, diningOutAvg: 8, costIndex: 37 },
  { countryCode: 'ES', rentAvg: 900, rentOutsideCenter: 620, groceriesMonthly: 280, transportMonthly: 50, utilitiesMonthly: 140, internetMonthly: 30, diningOutAvg: 12, costIndex: 48 },
  { countryCode: 'IT', rentAvg: 900, rentOutsideCenter: 600, groceriesMonthly: 300, transportMonthly: 40, utilitiesMonthly: 180, internetMonthly: 28, diningOutAvg: 13, costIndex: 52 },
  { countryCode: 'PT', rentAvg: 850, rentOutsideCenter: 550, groceriesMonthly: 250, transportMonthly: 40, utilitiesMonthly: 120, internetMonthly: 30, diningOutAvg: 10, costIndex: 42 },
  { countryCode: 'BE', rentAvg: 1100, rentOutsideCenter: 800, groceriesMonthly: 340, transportMonthly: 55, utilitiesMonthly: 200, internetMonthly: 38, diningOutAvg: 18, costIndex: 62 },
  { countryCode: 'AT', rentAvg: 1050, rentOutsideCenter: 750, groceriesMonthly: 310, transportMonthly: 55, utilitiesMonthly: 200, internetMonthly: 28, diningOutAvg: 14, costIndex: 60 },
  { countryCode: 'FI', rentAvg: 1100, rentOutsideCenter: 800, groceriesMonthly: 310, transportMonthly: 60, utilitiesMonthly: 120, internetMonthly: 25, diningOutAvg: 14, costIndex: 60 },
  { countryCode: 'CZ', rentAvg: 750, rentOutsideCenter: 500, groceriesMonthly: 230, transportMonthly: 30, utilitiesMonthly: 170, internetMonthly: 15, diningOutAvg: 8, costIndex: 38 },
  { countryCode: 'CN', rentAvg: 700, rentOutsideCenter: 400, groceriesMonthly: 200, transportMonthly: 30, utilitiesMonthly: 50, internetMonthly: 12, diningOutAvg: 5, costIndex: 33 },
];

// ---------------------------------------------------------------------------
// TAX DATA  (per country)
// ---------------------------------------------------------------------------
interface TaxDef {
  countryCode: string;
  incomeTaxMin: number;
  incomeTaxMax: number;
  socialSecurity: number;
  effectiveRate30k: number;
  effectiveRate50k: number;
  effectiveRate75k: number;
  effectiveRate100k: number;
  effectiveRate150k: number;
}

const taxData: TaxDef[] = [
  { countryCode: 'US', incomeTaxMin: 10, incomeTaxMax: 37, socialSecurity: 7.65, effectiveRate30k: 12.0, effectiveRate50k: 14.5, effectiveRate75k: 17.5, effectiveRate100k: 19.5, effectiveRate150k: 22.5 },
  { countryCode: 'DE', incomeTaxMin: 14, incomeTaxMax: 45, socialSecurity: 20.0, effectiveRate30k: 18.0, effectiveRate50k: 24.0, effectiveRate75k: 28.5, effectiveRate100k: 31.5, effectiveRate150k: 35.0 },
  { countryCode: 'CA', incomeTaxMin: 15, incomeTaxMax: 33, socialSecurity: 5.95, effectiveRate30k: 15.0, effectiveRate50k: 18.5, effectiveRate75k: 22.0, effectiveRate100k: 24.0, effectiveRate150k: 27.5 },
  { countryCode: 'GB', incomeTaxMin: 20, incomeTaxMax: 45, socialSecurity: 12.0, effectiveRate30k: 14.0, effectiveRate50k: 19.0, effectiveRate75k: 23.0, effectiveRate100k: 26.0, effectiveRate150k: 30.5 },
  { countryCode: 'AU', incomeTaxMin: 19, incomeTaxMax: 45, socialSecurity: 0.0, effectiveRate30k: 10.5, effectiveRate50k: 16.0, effectiveRate75k: 21.0, effectiveRate100k: 24.5, effectiveRate150k: 29.0 },
  { countryCode: 'GE', incomeTaxMin: 20, incomeTaxMax: 20, socialSecurity: 2.0, effectiveRate30k: 20.0, effectiveRate50k: 20.0, effectiveRate75k: 20.0, effectiveRate100k: 20.0, effectiveRate150k: 20.0 },
  { countryCode: 'NL', incomeTaxMin: 9.32, incomeTaxMax: 49.5, socialSecurity: 27.65, effectiveRate30k: 25.0, effectiveRate50k: 30.0, effectiveRate75k: 35.0, effectiveRate100k: 38.0, effectiveRate150k: 42.0 },
  { countryCode: 'SG', incomeTaxMin: 2, incomeTaxMax: 22, socialSecurity: 20.0, effectiveRate30k: 3.5, effectiveRate50k: 5.5, effectiveRate75k: 8.0, effectiveRate100k: 10.5, effectiveRate150k: 13.5 },
  { countryCode: 'JP', incomeTaxMin: 5, incomeTaxMax: 45, socialSecurity: 14.5, effectiveRate30k: 15.0, effectiveRate50k: 18.0, effectiveRate75k: 22.0, effectiveRate100k: 25.0, effectiveRate150k: 30.0 },
  { countryCode: 'KR', incomeTaxMin: 6, incomeTaxMax: 45, socialSecurity: 9.0, effectiveRate30k: 10.0, effectiveRate50k: 13.0, effectiveRate75k: 17.5, effectiveRate100k: 21.0, effectiveRate150k: 26.0 },
  { countryCode: 'FR', incomeTaxMin: 11, incomeTaxMax: 45, socialSecurity: 22.0, effectiveRate30k: 22.0, effectiveRate50k: 28.0, effectiveRate75k: 33.0, effectiveRate100k: 36.0, effectiveRate150k: 40.0 },
  { countryCode: 'CH', incomeTaxMin: 0.77, incomeTaxMax: 13.2, socialSecurity: 6.4, effectiveRate30k: 8.0, effectiveRate50k: 10.5, effectiveRate75k: 13.0, effectiveRate100k: 15.0, effectiveRate150k: 17.5 },
  { countryCode: 'SE', incomeTaxMin: 20, incomeTaxMax: 52, socialSecurity: 7.0, effectiveRate30k: 25.0, effectiveRate50k: 28.0, effectiveRate75k: 32.0, effectiveRate100k: 35.0, effectiveRate150k: 42.0 },
  { countryCode: 'NO', incomeTaxMin: 22, incomeTaxMax: 38.4, socialSecurity: 7.8, effectiveRate30k: 22.0, effectiveRate50k: 26.0, effectiveRate75k: 30.0, effectiveRate100k: 33.0, effectiveRate150k: 36.5 },
  { countryCode: 'DK', incomeTaxMin: 12.09, incomeTaxMax: 55.9, socialSecurity: 8.0, effectiveRate30k: 30.0, effectiveRate50k: 34.0, effectiveRate75k: 38.0, effectiveRate100k: 42.0, effectiveRate150k: 48.0 },
  { countryCode: 'IE', incomeTaxMin: 20, incomeTaxMax: 40, socialSecurity: 4.0, effectiveRate30k: 16.0, effectiveRate50k: 22.0, effectiveRate75k: 28.0, effectiveRate100k: 32.0, effectiveRate150k: 36.0 },
  { countryCode: 'IN', incomeTaxMin: 5, incomeTaxMax: 30, socialSecurity: 12.0, effectiveRate30k: 10.0, effectiveRate50k: 15.0, effectiveRate75k: 20.0, effectiveRate100k: 23.0, effectiveRate150k: 27.0 },
  { countryCode: 'BR', incomeTaxMin: 7.5, incomeTaxMax: 27.5, socialSecurity: 14.0, effectiveRate30k: 12.0, effectiveRate50k: 16.0, effectiveRate75k: 20.0, effectiveRate100k: 22.5, effectiveRate150k: 25.0 },
  { countryCode: 'MX', incomeTaxMin: 1.92, incomeTaxMax: 35, socialSecurity: 2.5, effectiveRate30k: 10.0, effectiveRate50k: 15.0, effectiveRate75k: 20.0, effectiveRate100k: 24.0, effectiveRate150k: 28.0 },
  { countryCode: 'AE', incomeTaxMin: 0, incomeTaxMax: 0, socialSecurity: 5.0, effectiveRate30k: 0, effectiveRate50k: 0, effectiveRate75k: 0, effectiveRate100k: 0, effectiveRate150k: 0 },
  { countryCode: 'IL', incomeTaxMin: 10, incomeTaxMax: 50, socialSecurity: 12.0, effectiveRate30k: 15.0, effectiveRate50k: 20.0, effectiveRate75k: 26.0, effectiveRate100k: 30.0, effectiveRate150k: 36.0 },
  { countryCode: 'NZ', incomeTaxMin: 10.5, incomeTaxMax: 39, socialSecurity: 0, effectiveRate30k: 12.5, effectiveRate50k: 17.5, effectiveRate75k: 22.0, effectiveRate100k: 25.5, effectiveRate150k: 30.0 },
  { countryCode: 'PL', incomeTaxMin: 12, incomeTaxMax: 32, socialSecurity: 13.71, effectiveRate30k: 17.0, effectiveRate50k: 19.0, effectiveRate75k: 22.0, effectiveRate100k: 25.0, effectiveRate150k: 28.0 },
  { countryCode: 'ES', incomeTaxMin: 19, incomeTaxMax: 47, socialSecurity: 6.35, effectiveRate30k: 18.0, effectiveRate50k: 22.0, effectiveRate75k: 27.0, effectiveRate100k: 30.0, effectiveRate150k: 35.0 },
  { countryCode: 'IT', incomeTaxMin: 23, incomeTaxMax: 43, socialSecurity: 9.19, effectiveRate30k: 22.0, effectiveRate50k: 26.0, effectiveRate75k: 30.0, effectiveRate100k: 33.0, effectiveRate150k: 37.0 },
  { countryCode: 'PT', incomeTaxMin: 14.5, incomeTaxMax: 48, socialSecurity: 11.0, effectiveRate30k: 16.0, effectiveRate50k: 22.0, effectiveRate75k: 28.0, effectiveRate100k: 32.0, effectiveRate150k: 38.0 },
  { countryCode: 'BE', incomeTaxMin: 25, incomeTaxMax: 50, socialSecurity: 13.07, effectiveRate30k: 28.0, effectiveRate50k: 33.0, effectiveRate75k: 38.0, effectiveRate100k: 42.0, effectiveRate150k: 47.0 },
  { countryCode: 'AT', incomeTaxMin: 20, incomeTaxMax: 55, socialSecurity: 18.12, effectiveRate30k: 22.0, effectiveRate50k: 27.0, effectiveRate75k: 32.0, effectiveRate100k: 36.0, effectiveRate150k: 41.0 },
  { countryCode: 'FI', incomeTaxMin: 12.64, incomeTaxMax: 44, socialSecurity: 7.8, effectiveRate30k: 22.0, effectiveRate50k: 27.0, effectiveRate75k: 32.0, effectiveRate100k: 35.0, effectiveRate150k: 40.0 },
  { countryCode: 'CZ', incomeTaxMin: 15, incomeTaxMax: 23, socialSecurity: 11.0, effectiveRate30k: 15.0, effectiveRate50k: 17.0, effectiveRate75k: 19.0, effectiveRate100k: 20.5, effectiveRate150k: 22.0 },
  { countryCode: 'CN', incomeTaxMin: 3, incomeTaxMax: 45, socialSecurity: 10.5, effectiveRate30k: 8.0, effectiveRate50k: 12.0, effectiveRate75k: 18.0, effectiveRate100k: 22.0, effectiveRate150k: 28.0 },
];

// ---------------------------------------------------------------------------
// Salary helper: derive realistic salary numbers from a base and multiplier
// ---------------------------------------------------------------------------
function deriveSalary(baseSalaryUSD: number, multiplier: number) {
  const avg = Math.round(baseSalaryUSD * multiplier / 100) * 100;
  const median = Math.round(avg * 0.95 / 100) * 100;
  const entry = Math.round(avg * 0.62 / 100) * 100;
  const senior = Math.round(avg * 1.55 / 100) * 100;
  const min = Math.round(avg * 0.45 / 100) * 100;
  const max = Math.round(avg * 1.85 / 100) * 100;
  return {
    salaryAvg: avg,
    salaryMedian: median,
    salaryEntry: entry,
    salarySenior: senior,
    salaryMin: min,
    salaryMax: max,
  };
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function main() {
  console.log('--- PayMapper Seed: starting ---\n');

  // 1. Clear existing data (reverse dependency order)
  console.log('Clearing existing data...');
  await prisma.salary.deleteMany();
  await prisma.costOfLiving.deleteMany();
  await prisma.tax.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  await prisma.job.deleteMany();
  console.log('  Done.\n');

  // 2. Seed countries
  console.log(`Seeding ${countries.length} countries...`);
  const countryMap = new Map<string, string>(); // code -> id
  for (const c of countries) {
    const slug = toSlug(c.name);
    const record = await prisma.country.upsert({
      where: { slug },
      update: {
        name: c.name,
        code: c.code,
        continent: c.continent,
        currency: c.currency,
        currencySymbol: c.currencySymbol,
        latitude: c.latitude,
        longitude: c.longitude,
      },
      create: {
        name: c.name,
        slug,
        code: c.code,
        continent: c.continent,
        currency: c.currency,
        currencySymbol: c.currencySymbol,
        latitude: c.latitude,
        longitude: c.longitude,
      },
    });
    countryMap.set(c.code, record.id);
  }
  console.log(`  Inserted ${countryMap.size} countries.\n`);

  // 3. Seed jobs
  console.log(`Seeding ${jobs.length} jobs...`);
  const jobMap = new Map<string, { id: string; baseSalaryUSD: number }>(); // slug -> {id, baseSalary}
  for (const j of jobs) {
    const slug = toSlug(j.title);
    const record = await prisma.job.upsert({
      where: { slug },
      update: { title: j.title, category: j.category },
      create: { title: j.title, slug, category: j.category },
    });
    jobMap.set(slug, { id: record.id, baseSalaryUSD: j.baseSalaryUSD });
  }
  console.log(`  Inserted ${jobMap.size} jobs.\n`);

  // 4. Seed cities
  console.log(`Seeding ${cities.length} cities...`);
  let cityCount = 0;
  for (const c of cities) {
    const countryId = countryMap.get(c.countryCode);
    if (!countryId) {
      console.warn(`  WARN: no country for code ${c.countryCode}, skipping city ${c.name}`);
      continue;
    }
    const slug = toSlug(`${c.name}-${c.countryCode}`);
    await prisma.city.upsert({
      where: { slug },
      update: {
        name: c.name,
        countryId,
        latitude: c.latitude,
        longitude: c.longitude,
        isCapital: c.isCapital,
      },
      create: {
        name: c.name,
        slug,
        countryId,
        latitude: c.latitude,
        longitude: c.longitude,
        isCapital: c.isCapital,
      },
    });
    cityCount++;
  }
  console.log(`  Inserted ${cityCount} cities.\n`);

  // 5. Seed salaries (every job x every country)
  const totalSalaries = jobs.length * countries.length;
  console.log(`Seeding ${totalSalaries} salary records...`);
  let salaryCount = 0;
  for (const j of jobs) {
    const jobSlug = toSlug(j.title);
    const jobEntry = jobMap.get(jobSlug);
    if (!jobEntry) continue;

    for (const c of countries) {
      const countryId = countryMap.get(c.code);
      if (!countryId) continue;

      const sal = deriveSalary(jobEntry.baseSalaryUSD, c.salaryMultiplier);

      await prisma.salary.upsert({
        where: {
          jobId_countryId_dataYear: {
            jobId: jobEntry.id,
            countryId,
            dataYear: 2025,
          },
        },
        update: { ...sal },
        create: {
          jobId: jobEntry.id,
          countryId,
          dataYear: 2025,
          ...sal,
        },
      });
      salaryCount++;
    }

    // Progress logging every 10 jobs
    if (salaryCount % (countries.length * 10) === 0) {
      console.log(`  ... ${salaryCount} / ${totalSalaries}`);
    }
  }
  console.log(`  Inserted ${salaryCount} salary records.\n`);

  // 6. Seed cost of living
  console.log(`Seeding ${costOfLivingData.length} cost-of-living records...`);
  for (const col of costOfLivingData) {
    const countryId = countryMap.get(col.countryCode);
    if (!countryId) {
      console.warn(`  WARN: no country for code ${col.countryCode}, skipping COL`);
      continue;
    }
    await prisma.costOfLiving.upsert({
      where: { countryId },
      update: {
        rentAvg: col.rentAvg,
        rentOutsideCenter: col.rentOutsideCenter,
        groceriesMonthly: col.groceriesMonthly,
        transportMonthly: col.transportMonthly,
        utilitiesMonthly: col.utilitiesMonthly,
        internetMonthly: col.internetMonthly,
        diningOutAvg: col.diningOutAvg,
        costIndex: col.costIndex,
      },
      create: {
        countryId,
        rentAvg: col.rentAvg,
        rentOutsideCenter: col.rentOutsideCenter,
        groceriesMonthly: col.groceriesMonthly,
        transportMonthly: col.transportMonthly,
        utilitiesMonthly: col.utilitiesMonthly,
        internetMonthly: col.internetMonthly,
        diningOutAvg: col.diningOutAvg,
        costIndex: col.costIndex,
      },
    });
  }
  console.log(`  Inserted ${costOfLivingData.length} cost-of-living records.\n`);

  // 7. Seed taxes
  console.log(`Seeding ${taxData.length} tax records...`);
  for (const t of taxData) {
    const countryId = countryMap.get(t.countryCode);
    if (!countryId) {
      console.warn(`  WARN: no country for code ${t.countryCode}, skipping tax`);
      continue;
    }
    await prisma.tax.upsert({
      where: { countryId },
      update: {
        incomeTaxMin: t.incomeTaxMin,
        incomeTaxMax: t.incomeTaxMax,
        socialSecurity: t.socialSecurity,
        effectiveRate30k: t.effectiveRate30k,
        effectiveRate50k: t.effectiveRate50k,
        effectiveRate75k: t.effectiveRate75k,
        effectiveRate100k: t.effectiveRate100k,
        effectiveRate150k: t.effectiveRate150k,
      },
      create: {
        countryId,
        incomeTaxMin: t.incomeTaxMin,
        incomeTaxMax: t.incomeTaxMax,
        socialSecurity: t.socialSecurity,
        effectiveRate30k: t.effectiveRate30k,
        effectiveRate50k: t.effectiveRate50k,
        effectiveRate75k: t.effectiveRate75k,
        effectiveRate100k: t.effectiveRate100k,
        effectiveRate150k: t.effectiveRate150k,
      },
    });
  }
  console.log(`  Inserted ${taxData.length} tax records.\n`);

  // Summary
  console.log('=== Seed Summary ===');
  console.log(`  Countries:       ${countryMap.size}`);
  console.log(`  Jobs:            ${jobMap.size}`);
  console.log(`  Cities:          ${cityCount}`);
  console.log(`  Salary records:  ${salaryCount}`);
  console.log(`  Cost of living:  ${costOfLivingData.length}`);
  console.log(`  Tax records:     ${taxData.length}`);
  console.log('\n--- PayMapper Seed: complete ---');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
