-- CreateEnum
CREATE TYPE "TimeRange" AS ENUM ('HOUR_1', 'HOUR_3', 'HOUR_6', 'HOUR_12', 'DAY_1', 'DAY_3', 'WEEK_1', 'WEEK_2', 'MONTH_1', 'MONTH_3', 'MONTH_6', 'YEAR_1', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('ERROR_RATE_HIGH', 'TRANSACTION_VOLUME_SPIKE', 'RESOURCE_USAGE_HIGH', 'SPECIFIC_FUNCTION_CALL', 'CONTRACT_INACTIVE');

-- CreateTable
CREATE TABLE "SavedContract" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSavedContract" (
    "userId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSavedContract_pkey" PRIMARY KEY ("userId","contractId")
);

-- CreateTable
CREATE TABLE "ContractOperation" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "function" TEXT,
    "parameters" JSONB,
    "result" TEXT,
    "errorCode" TEXT,
    "resourceUsage" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "timeRange" "TimeRange" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "threshold" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedContract_contractId_key" ON "SavedContract"("contractId");

-- CreateIndex
CREATE INDEX "SavedContract_contractId_idx" ON "SavedContract"("contractId");

-- CreateIndex
CREATE INDEX "UserSavedContract_userId_idx" ON "UserSavedContract"("userId");

-- CreateIndex
CREATE INDEX "ContractOperation_contractId_timestamp_idx" ON "ContractOperation"("contractId", "timestamp");

-- CreateIndex
CREATE INDEX "Analytics_contractId_timeRange_startTime_endTime_idx" ON "Analytics"("contractId", "timeRange", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "Alert_contractId_type_idx" ON "Alert"("contractId", "type");

-- AddForeignKey
ALTER TABLE "UserSavedContract" ADD CONSTRAINT "UserSavedContract_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "SavedContract"("contractId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractOperation" ADD CONSTRAINT "ContractOperation_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "SavedContract"("contractId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "SavedContract"("contractId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "SavedContract"("contractId") ON DELETE CASCADE ON UPDATE CASCADE;
