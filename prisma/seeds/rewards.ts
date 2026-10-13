import {
  DiscountType,
  PointSource,
  PointType,
  PrismaClient,
  TransactionStatus,
} from "@prisma/client";
import { addDays, addHours, addMonths, subDays, subMonths } from "date-fns";

const prisma = new PrismaClient();

export async function seedRewards() {
  console.log("🌱 Seeding referral points & coupons...");

  const [andi, budi, eka] = await Promise.all(
    ["andi.pratama@mail.com", "budi.santoso@mail.com", "eka.putri@mail.com"].map(
      (email) => prisma.user.findUnique({ where: { email } }),
    ),
  );

  if (!andi || !budi || !eka) {
    console.log("⚠️ Referral users not found, skipping rewards seed.");
    return;
  }

  const alreadySeeded = await prisma.pointBatch.count({
    where: { userId: andi.id },
  });

  if (alreadySeeded > 0) {
    console.log("ℹ️ Rewards already seeded, skipping.");
    return;
  }

  const now = new Date();
  const expiredEarnedAt = subMonths(now, 4);
  const partialEarnedAt = subMonths(now, 2);
  const fullEarnedAt = subDays(now, 10);

  await prisma.pointBatch.createMany({
    data: [
      {
        userId: andi.id,
        source: PointSource.REFERRAL,
        amount: 10_000,
        remaining: 10_000,
        earnedAt: expiredEarnedAt,
        expiredAt: addMonths(expiredEarnedAt, 3),
      },
      {
        userId: andi.id,
        source: PointSource.REFERRAL,
        amount: 10_000,
        remaining: 4_000,
        earnedAt: partialEarnedAt,
        expiredAt: addMonths(partialEarnedAt, 3),
      },
      {
        userId: andi.id,
        source: PointSource.REFERRAL,
        amount: 10_000,
        remaining: 10_000,
        earnedAt: fullEarnedAt,
        expiredAt: addMonths(fullEarnedAt, 3),
      },
    ],
  });

  await prisma.pointHistory.createMany({
    data: [
      {
        userId: andi.id,
        point: 10_000,
        type: PointType.EARN,
        description: "Referral reward from Dewi Anggraini registration",
        expiredAt: addMonths(expiredEarnedAt, 3),
        createdAt: expiredEarnedAt,
      },
      {
        userId: andi.id,
        point: 10_000,
        type: PointType.EARN,
        description: "Referral reward from Budi Santoso registration",
        expiredAt: addMonths(partialEarnedAt, 3),
        createdAt: partialEarnedAt,
      },
      {
        userId: andi.id,
        point: -6_000,
        type: PointType.REDEEM,
        description: "Points used on ticket transaction",
        createdAt: addDays(partialEarnedAt, 5),
      },
      {
        userId: andi.id,
        point: 10_000,
        type: PointType.EARN,
        description: "Referral reward from Eka Putri registration",
        expiredAt: addMonths(fullEarnedAt, 3),
        createdAt: fullEarnedAt,
      },
    ],
  });

  const ticketType = await prisma.ticketType.findFirst({
    where: { conference: { status: "PUBLISHED" } },
  });

  const usedCoupon = await prisma.coupon.create({
    data: {
      userId: budi.id,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      expiredAt: addMonths(partialEarnedAt, 3),
      isUsed: true,
      usedAt: addDays(partialEarnedAt, 3),
    },
  });

  await prisma.coupon.createMany({
    data: [
      {
        userId: eka.id,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        expiredAt: addMonths(fullEarnedAt, 3),
      },
      {
        userId: budi.id,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        expiredAt: subDays(now, 3),
      },
    ],
  });

  if (!ticketType) {
    console.log("⚠️ No published ticket type, skipping reward transactions.");
    return;
  }

  const usedCouponSubtotal = ticketType.price;
  const usedCouponDiscount = Math.round(usedCouponSubtotal * 0.1);

  await prisma.transaction.create({
    data: {
      userId: budi.id,
      conferenceId: ticketType.conferenceId,
      ticketTypeId: ticketType.id,
      couponId: usedCoupon.id,
      quantity: 1,
      subtotal: usedCouponSubtotal,
      discount: usedCouponDiscount,
      pointUsed: 0,
      totalPrice: usedCouponSubtotal - usedCouponDiscount,
      status: TransactionStatus.APPROVED,
      expiresAt: addHours(addDays(partialEarnedAt, 3), 2),
      paymentDate: addDays(partialEarnedAt, 3),
      createdAt: addDays(partialEarnedAt, 3),
    },
  });

  const cancelledAt = addDays(fullEarnedAt, 1);
  const cancelledPoints = Math.min(5_000, ticketType.price);
  const cancelled = await prisma.transaction.create({
    data: {
      userId: andi.id,
      conferenceId: ticketType.conferenceId,
      ticketTypeId: ticketType.id,
      quantity: 1,
      subtotal: ticketType.price,
      discount: 0,
      pointUsed: cancelledPoints,
      totalPrice: ticketType.price - cancelledPoints,
      status: TransactionStatus.CANCELLED,
      expiresAt: addHours(cancelledAt, 2),
      createdAt: cancelledAt,
    },
  });

  const fullBatch = await prisma.pointBatch.findFirstOrThrow({
    where: { userId: andi.id, earnedAt: fullEarnedAt },
  });

  await prisma.pointRedemption.create({
    data: {
      transactionId: cancelled.id,
      batchId: fullBatch.id,
      amount: cancelledPoints,
      refundedAt: addHours(cancelledAt, 2),
    },
  });

  await prisma.pointHistory.createMany({
    data: [
      {
        userId: andi.id,
        point: -cancelledPoints,
        type: PointType.REDEEM,
        description: `Points used on transaction #${cancelled.id}`,
        createdAt: cancelledAt,
      },
      {
        userId: andi.id,
        point: cancelledPoints,
        type: PointType.EARN,
        description: `Points refunded from transaction #${cancelled.id}`,
        createdAt: addHours(cancelledAt, 2),
      },
    ],
  });

  console.log("✅ Rewards seeded.");
}
