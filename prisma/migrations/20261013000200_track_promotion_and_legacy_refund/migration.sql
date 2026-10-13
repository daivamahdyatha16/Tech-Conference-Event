-- AlterEnum
ALTER TYPE "PointSource" ADD VALUE 'REFUND';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "promotion_id" INTEGER;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Remove referral codes from organizers
UPDATE "users" SET "referral_code" = NULL WHERE "role" = 'ORGANIZER';
