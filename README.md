# PayMapper - Global Salary Comparison Platform

PayMapper is a production-ready global salary comparison platform where users can explore, compare, and analyze salaries across countries, cities, and professions — including cost-of-living and net income calculations.

## Features

- **Global Salary Search** — Search salaries by job title and country with detailed breakdowns
- **Salary Comparison Tool** — Compare salaries across multiple countries side-by-side
- **Cost of Living Calculator** — Understand real purchasing power with rent, food, transport data
- **Net Salary Calculator** — Calculate take-home pay after taxes for any country
- **Interactive World Map** — Visualize salary data on a global map
- **SEO-Optimized Pages** — Thousands of auto-generated salary and comparison pages
- **Top Paying Rankings** — Discover the highest-paying countries and jobs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, TailwindCSS v4 |
| Animations | Framer Motion |
| Charts | Chart.js + react-chartjs-2 |
| Map | Leaflet + react-leaflet |
| Backend | Next.js API Routes, Node.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Deployment | Docker, Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker)
- npm

### 1. Clone and Install

```bash
git clone <your-repo-url> paymapper
cd paymapper
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/paymapper?schema=public"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database with sample data (50+ jobs, 30+ countries)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Start PostgreSQL and the app
docker-compose up -d

# Run migrations and seed data
docker-compose run --rm migrate
```

The app will be available at `http://localhost:3000`.

### Build Docker Image Only

```bash
docker build -t paymapper .
docker run -p 3000:3000 -e DATABASE_URL="your-connection-string" paymapper
```

## Vercel Deployment

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL` — Your PostgreSQL connection string (e.g., from Neon, Supabase, or Railway)
4. Deploy

> Make sure to run `npx prisma migrate deploy` and `npm run db:seed` against your production database.

## Project Structure

```
paymapper/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seed script
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Global styles
│   │   ├── salary/[slug]/     # Salary detail pages
│   │   ├── compare/[...]/     # Comparison pages
│   │   ├── jobs/              # Job listings & detail
│   │   ├── countries/         # Country listings & detail
│   │   ├── map/               # Interactive world map
│   │   ├── calculator/        # Net salary calculator
│   │   ├── search/            # Search page
│   │   ├── top-paying/        # Rankings page
│   │   └── api/               # API routes
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utilities, helpers, types
│   └── generated/             # Prisma generated client
├── public/                    # Static assets
├── docker-compose.yml         # Docker Compose config
├── Dockerfile                 # Production Docker image
├── next.config.ts             # Next.js configuration
└── package.json
```

## API Routes

| Endpoint | Description |
|----------|-------------|
| `GET /api/search?q=` | Search jobs and countries |
| `GET /api/salaries?job=&country=` | Get salary data |
| `GET /api/salaries/compare?job=&countries=` | Compare salaries |
| `GET /api/jobs` | List all jobs |
| `GET /api/jobs/[slug]` | Job details with global salaries |
| `GET /api/countries` | List all countries |
| `GET /api/countries/[slug]` | Country details |
| `GET /api/calculate-net?gross=&country=` | Calculate net salary |
| `GET /api/map-data?job=` | Map visualization data |
| `GET /api/top-paying?type=` | Top paying rankings |

## SEO

PayMapper generates SEO-optimized pages with:

- Dynamic meta titles and descriptions
- JSON-LD structured data (Occupation schema)
- Server-side rendering for all content pages
- Clean URL structure:
  - `/salary/software-engineer-germany`
  - `/compare/software-engineer/germany-vs-canada-vs-usa`
  - `/jobs/software-engineer`
  - `/countries/germany`

## Database

The database includes 6 core tables:

- **Jobs** — 50+ job titles across 10 categories
- **Countries** — 30+ countries with coordinates and currency info
- **Cities** — Major cities per country
- **Salaries** — Salary data (avg, median, entry, senior) per job per country
- **CostOfLiving** — Monthly costs (rent, groceries, transport, utilities)
- **Taxes** — Tax brackets and effective rates per income level

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | No |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense client ID | No |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | No |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:push` | Push schema changes (no migration) |
| `npm run lint` | Run ESLint |

## License

MIT
