import bcrypt from "bcrypt";
import { ConferenceStatus, DiscountType, PointSource, UserRole } from "@prisma/client";
import { prisma } from "../configs/prisma";

export const hasTestDatabase = Boolean(process.env.TEST_DATABASE_URL);

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      point_redemptions, point_batches, point_histories, transactions,
      coupons, reviews, promotions, ticket_types, conferences, categories, users
    RESTART IDENTITY CASCADE
  `);
}

let sequence = 0;

export async function createUser(
  overrides: Partial<{ role: UserRole; referralCode: string | null }> = {},
) {
  sequence += 1;
  return prisma.user.create({
    data: {
      fullName: `User ${sequence}`,
      email: `user${sequence}-${Date.now()}@test.dev`,
      password: await bcrypt.hash("password", 4),
      role: overrides.role ?? UserRole.ATTENDEE,
      referralCode:
        overrides.referralCode === undefined
          ? `TEST${sequence}${Date.now()}`
          : overrides.referralCode,
    },
  });
}

export async function createCheckoutFixture(
  options: { price?: number; seats?: number } = {},
) {
  const organizer = await createUser({
    role: UserRole.ORGANIZER,
    referralCode: null,
  });
  const attendee = await createUser();
  const category = await prisma.category.create({
    data: { name: `Category ${Date.now()}-${Math.random()}` },
  });
  const conference = await prisma.conference.create({
    data: {
      title: "Test Conference",
      description: "Test",
      city: "Jakarta",
      venue: "JCC",
      startDate: new Date(Date.now() + 30 * 86_400_000),
      endDate: new Date(Date.now() + 31 * 86_400_000),
      status: ConferenceStatus.PUBLISHED,
      organizerId: organizer.id,
      categoryId: category.id,
    },
  });
  const seats = options.seats ?? 10;
  const ticketType = await prisma.ticketType.create({
    data: {
      conferenceId: conference.id,
      name: "Regular",
      price: options.price ?? 300_000,
      quota: seats,
      availableSeat: seats,
    },
  });

  return { organizer, attendee, conference, ticketType };
}

export async function giveCoupon(
  userId: number,
  expiredAt = new Date(Date.now() + 30 * 86_400_000),
  isUsed = false,
) {
  return prisma.coupon.create({
    data: {
      userId,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      expiredAt,
      isUsed,
    },
  });
}

export async function givePoints(
  userId: number,
  amount: number,
  expiredAt: Date,
  earnedAt = new Date(),
) {
  return prisma.pointBatch.create({
    data: {
      userId,
      source: PointSource.REFERRAL,
      amount,
      remaining: amount,
      earnedAt,
      expiredAt,
    },
  });
}
