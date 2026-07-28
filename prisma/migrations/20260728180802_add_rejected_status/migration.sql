-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "conferences" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
