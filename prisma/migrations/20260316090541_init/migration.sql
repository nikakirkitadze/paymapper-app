-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isCapital" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salary" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "salaryAvg" DOUBLE PRECISION NOT NULL,
    "salaryMedian" DOUBLE PRECISION NOT NULL,
    "salaryEntry" DOUBLE PRECISION NOT NULL,
    "salarySenior" DOUBLE PRECISION NOT NULL,
    "salaryMin" DOUBLE PRECISION NOT NULL,
    "salaryMax" DOUBLE PRECISION NOT NULL,
    "dataYear" INTEGER NOT NULL DEFAULT 2025,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostOfLiving" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "rentAvg" DOUBLE PRECISION NOT NULL,
    "rentOutsideCenter" DOUBLE PRECISION NOT NULL,
    "groceriesMonthly" DOUBLE PRECISION NOT NULL,
    "transportMonthly" DOUBLE PRECISION NOT NULL,
    "utilitiesMonthly" DOUBLE PRECISION NOT NULL,
    "internetMonthly" DOUBLE PRECISION NOT NULL,
    "diningOutAvg" DOUBLE PRECISION NOT NULL,
    "costIndex" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostOfLiving_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tax" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "incomeTaxMin" DOUBLE PRECISION NOT NULL,
    "incomeTaxMax" DOUBLE PRECISION NOT NULL,
    "socialSecurity" DOUBLE PRECISION NOT NULL,
    "effectiveRate30k" DOUBLE PRECISION NOT NULL,
    "effectiveRate50k" DOUBLE PRECISION NOT NULL,
    "effectiveRate75k" DOUBLE PRECISION NOT NULL,
    "effectiveRate100k" DOUBLE PRECISION NOT NULL,
    "effectiveRate150k" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_title_key" ON "Job"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_slug_idx" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_category_idx" ON "Job"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_slug_idx" ON "Country"("slug");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "City_countryId_idx" ON "City"("countryId");

-- CreateIndex
CREATE INDEX "City_slug_idx" ON "City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_countryId_key" ON "City"("name", "countryId");

-- CreateIndex
CREATE INDEX "Salary_jobId_idx" ON "Salary"("jobId");

-- CreateIndex
CREATE INDEX "Salary_countryId_idx" ON "Salary"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Salary_jobId_countryId_dataYear_key" ON "Salary"("jobId", "countryId", "dataYear");

-- CreateIndex
CREATE UNIQUE INDEX "CostOfLiving_countryId_key" ON "CostOfLiving"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Tax_countryId_key" ON "Tax"("countryId");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostOfLiving" ADD CONSTRAINT "CostOfLiving_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
