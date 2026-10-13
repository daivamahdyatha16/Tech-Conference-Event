-- DropIndex
DROP INDEX "public"."coupons_code_key";

-- DropIndex
DROP INDEX "public"."promotions_code_key";

-- AlterTable
ALTER TABLE "public"."coupons" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "public"."promotions" DROP COLUMN "code";
