-- CreateEnum
CREATE TYPE "PointSource" AS ENUM ('REFERRAL');

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "comment" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "referred_by_id" INTEGER;

-- CreateTable
CREATE TABLE "point_batches" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "source" "PointSource" NOT NULL,
    "amount" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "point_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_redemptions" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "refunded_at" TIMESTAMP(3),

    CONSTRAINT "point_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "point_batches_user_id_expired_at_idx" ON "point_batches"("user_id", "expired_at");

-- CreateIndex
CREATE UNIQUE INDEX "point_redemptions_transaction_id_batch_id_key" ON "point_redemptions"("transaction_id", "batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_batches" ADD CONSTRAINT "point_batches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_redemptions" ADD CONSTRAINT "point_redemptions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "point_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_redemptions" ADD CONSTRAINT "point_redemptions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- AddCheckConstraint
ALTER TABLE "point_batches" ADD CONSTRAINT "point_batches_remaining_range" CHECK ("remaining" >= 0 AND "remaining" <= "amount");

-- Backfill point batches from existing EARN history (FIFO by expiry)
WITH earns AS (
    SELECT
        ph."id",
        ph."user_id",
        ph."point" AS "amount",
        ph."created_at",
        ph."expired_at",
        SUM(ph."point") OVER (PARTITION BY ph."user_id" ORDER BY ph."expired_at", ph."id") AS "cum"
    FROM "point_histories" ph
    WHERE ph."type" = 'EARN' AND ph."expired_at" IS NOT NULL AND ph."point" > 0
),
redeemed AS (
    SELECT "user_id", -SUM("point") AS "total"
    FROM "point_histories"
    WHERE "type" = 'REDEEM'
    GROUP BY "user_id"
)
INSERT INTO "point_batches" ("user_id", "source", "amount", "remaining", "earned_at", "expired_at")
SELECT
    e."user_id",
    'REFERRAL',
    e."amount",
    GREATEST(0, LEAST(e."amount", e."cum" - COALESCE(r."total", 0))),
    e."created_at",
    e."expired_at"
FROM earns e
LEFT JOIN redeemed r ON r."user_id" = e."user_id";
