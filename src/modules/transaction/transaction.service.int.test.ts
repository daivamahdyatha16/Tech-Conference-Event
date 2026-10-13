import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { TransactionStatus } from "@prisma/client";
import { prisma } from "../../configs/prisma";
import { TransactionService } from "./transaction.service";
import { PointService } from "../point/point.service";
import {
  createCheckoutFixture,
  createUser,
  giveCoupon,
  givePoints,
  hasTestDatabase,
  resetDatabase,
} from "../../test/db";

const DAY = 86_400_000;
const inDays = (days: number) => new Date(Date.now() + days * DAY);
const service = new TransactionService();

const seatsOf = async (ticketTypeId: number) =>
  (await prisma.ticketType.findUniqueOrThrow({ where: { id: ticketTypeId } }))
    .availableSeat;

const forceExpire = (transactionId: number) =>
  prisma.transaction.update({
    where: { id: transactionId },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });

describe.skipIf(!hasTestDatabase)("TransactionService checkout", () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it("300.000 dengan 20.000 poin menjadi 280.000 dan memotong batch", async () => {
    const { attendee, ticketType } = await createCheckoutFixture();
    const batch = await givePoints(attendee.id, 20_000, inDays(30));

    const trx = await service.create({
      userId: attendee.id,
      ticketTypeId: ticketType.id,
      quantity: 1,
      pointUsed: 20_000,
    });

    expect(trx.totalPrice).toBe(280_000);
    expect(trx.pointUsed).toBe(20_000);
    expect(
      (await prisma.pointBatch.findUniqueOrThrow({ where: { id: batch.id } }))
        .remaining,
    ).toBe(0);
    expect(await PointService.getBalance(attendee.id)).toBe(0);
  });

  it("memotong poin FIFO berdasarkan expiry", async () => {
    const { attendee, ticketType } = await createCheckoutFixture();
    const later = await givePoints(attendee.id, 10_000, inDays(60));
    const soon = await givePoints(attendee.id, 10_000, inDays(10));

    await service.create({
      userId: attendee.id,
      ticketTypeId: ticketType.id,
      quantity: 1,
      pointUsed: 15_000,
    });

    const [soonAfter, laterAfter] = await Promise.all(
      [soon.id, later.id].map((id) =>
        prisma.pointBatch.findUniqueOrThrow({ where: { id } }),
      ),
    );
    expect(soonAfter.remaining).toBe(0);
    expect(laterAfter.remaining).toBe(5_000);
  });

  it("regresi: saldo tetap benar setelah batch yang sudah dipakai expired", async () => {
    const { attendee, ticketType } = await createCheckoutFixture();
    await givePoints(attendee.id, 10_000, inDays(10));
    await givePoints(attendee.id, 10_000, inDays(60));

    await service.create({
      userId: attendee.id,
      ticketTypeId: ticketType.id,
      quantity: 1,
      pointUsed: 10_000,
    });

    expect(await PointService.getBalance(attendee.id, inDays(20))).toBe(10_000);
    expect(await PointService.getBalance(attendee.id, inDays(90))).toBe(0);
  });

  it("poin melebihi saldo ditolak dan semua perubahan di-rollback", async () => {
    const { attendee, ticketType } = await createCheckoutFixture();
    await givePoints(attendee.id, 5_000, inDays(30));
    const coupon = await giveCoupon(attendee.id);

    await expect(
      service.create({
        userId: attendee.id,
        ticketTypeId: ticketType.id,
        quantity: 2,
        couponId: coupon.id,
        pointUsed: 10_000,
      }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(await seatsOf(ticketType.id)).toBe(10);
    expect(
      (await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } })).isUsed,
    ).toBe(false);
    expect(await prisma.transaction.count()).toBe(0);
    expect(await PointService.getBalance(attendee.id)).toBe(5_000);
  });

  it("poin dibatasi harga sehingga total 0 dan langsung APPROVED", async () => {
    const { attendee, ticketType } = await createCheckoutFixture({ price: 15_000 });
    await givePoints(attendee.id, 20_000, inDays(30));

    const trx = await service.create({
      userId: attendee.id,
      ticketTypeId: ticketType.id,
      quantity: 1,
      pointUsed: 20_000,
    });

    expect(trx.pointUsed).toBe(15_000);
    expect(trx.totalPrice).toBe(0);
    expect(trx.status).toBe(TransactionStatus.APPROVED);
    expect(await PointService.getBalance(attendee.id)).toBe(5_000);
  });

  it("kupon 10% valid dipakai sebelum poin", async () => {
    const { attendee, ticketType } = await createCheckoutFixture();
    await givePoints(attendee.id, 20_000, inDays(30));
    const coupon = await giveCoupon(attendee.id);

    const trx = await service.create({
      userId: attendee.id,
      ticketTypeId: ticketType.id,
      quantity: 1,
      couponId: coupon.id,
      pointUsed: 20_000,
    });

    expect(trx.discount).toBe(30_000);
    expect(trx.totalPrice).toBe(250_000);
    const stored = await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } });
    expect(stored.isUsed).toBe(true);
    expect(stored.usedAt).not.toBeNull();
  });

  it.each([
    ["expired", { expiredAt: new Date(Date.now() - DAY) }],
    ["sudah terpakai", { isUsed: true }],
  ])("kupon %s ditolak", async (_label, state) => {
    const { attendee, ticketType } = await createCheckoutFixture();
    const coupon = await giveCoupon(
      attendee.id,
      "expiredAt" in state ? state.expiredAt : undefined,
      "isUsed" in state ? state.isUsed : false,
    );

    await expect(
      service.create({
        userId: attendee.id,
        ticketTypeId: ticketType.id,
        quantity: 1,
        couponId: coupon.id,
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(await seatsOf(ticketType.id)).toBe(10);
  });

  it("kupon milik user lain ditolak", async () => {
    const { attendee, ticketType } = await createCheckoutFixture();
    const other = await createUser();
    const coupon = await giveCoupon(other.id);

    await expect(
      service.create({
        userId: attendee.id,
        ticketTypeId: ticketType.id,
        quantity: 1,
        couponId: coupon.id,
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("kupon yang sama tidak bisa dipakai dua checkout bersamaan", async () => {
    const { attendee, ticketType } = await createCheckoutFixture();
    const coupon = await giveCoupon(attendee.id);
    const request = {
      userId: attendee.id,
      ticketTypeId: ticketType.id,
      quantity: 1,
      couponId: coupon.id,
    };

    const results = await Promise.allSettled([
      service.create(request),
      service.create(request),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await seatsOf(ticketType.id)).toBe(9);
  });

  it("poin yang sama tidak bisa dipakai dua checkout bersamaan", async () => {
    const { attendee, ticketType } = await createCheckoutFixture();
    await givePoints(attendee.id, 10_000, inDays(30));
    const request = {
      userId: attendee.id,
      ticketTypeId: ticketType.id,
      quantity: 1,
      pointUsed: 10_000,
    };

    const results = await Promise.allSettled([
      service.create(request),
      service.create(request),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await PointService.getBalance(attendee.id)).toBe(0);
    const redeemed = await prisma.pointRedemption.aggregate({ _sum: { amount: true } });
    expect(redeemed._sum.amount).toBe(10_000);
  });

  it("kursi tidak bisa oversell saat checkout bersamaan", async () => {
    const { attendee, ticketType } = await createCheckoutFixture({ seats: 1 });
    const request = { userId: attendee.id, ticketTypeId: ticketType.id, quantity: 1 };

    const results = await Promise.allSettled([
      service.create(request),
      service.create(request),
      service.create(request),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await seatsOf(ticketType.id)).toBe(0);
  });
});

describe.skipIf(!hasTestDatabase)("TransactionService pembatalan", () => {
  beforeEach(resetDatabase);

  const checkoutWithRewards = async () => {
    const fixture = await createCheckoutFixture();
    const batchExpiry = inDays(10);
    const batch = await givePoints(fixture.attendee.id, 10_000, batchExpiry);
    const coupon = await giveCoupon(fixture.attendee.id);
    const trx = await service.create({
      userId: fixture.attendee.id,
      ticketTypeId: fixture.ticketType.id,
      quantity: 2,
      couponId: coupon.id,
      pointUsed: 10_000,
    });
    return { ...fixture, batch, batchExpiry, coupon, trx };
  };

  const expectFullyRestored = async (ctx: Awaited<ReturnType<typeof checkoutWithRewards>>) => {
    expect(await seatsOf(ctx.ticketType.id)).toBe(10);
    const batch = await prisma.pointBatch.findUniqueOrThrow({ where: { id: ctx.batch.id } });
    expect(batch.remaining).toBe(10_000);
    expect(batch.expiredAt.getTime()).toBe(ctx.batchExpiry.getTime());
    const coupon = await prisma.coupon.findUniqueOrThrow({ where: { id: ctx.coupon.id } });
    expect(coupon.isUsed).toBe(false);
    expect(coupon.usedAt).toBeNull();
    expect(await PointService.getBalance(ctx.attendee.id)).toBe(10_000);
  };

  it("transaksi expired mengembalikan poin ke batch asal, kupon, dan kursi", async () => {
    const ctx = await checkoutWithRewards();
    await forceExpire(ctx.trx.id);

    await service.expireTransactionIfDue(ctx.trx.id);

    const stored = await prisma.transaction.findUniqueOrThrow({ where: { id: ctx.trx.id } });
    expect(stored.status).toBe(TransactionStatus.CANCELLED);
    await expectFullyRestored(ctx);
  });

  it("expire bersamaan hanya me-refund sekali", async () => {
    const ctx = await checkoutWithRewards();
    await forceExpire(ctx.trx.id);

    await Promise.all([
      service.expireTransactionIfDue(ctx.trx.id),
      service.expireTransactionIfDue(ctx.trx.id),
      service.expireAllDueTransactions(),
    ]);

    await expectFullyRestored(ctx);
  });

  it("transaksi yang belum jatuh tempo tidak di-expire", async () => {
    const ctx = await checkoutWithRewards();
    await service.expireTransactionIfDue(ctx.trx.id);
    const stored = await prisma.transaction.findUniqueOrThrow({ where: { id: ctx.trx.id } });
    expect(stored.status).toBe(TransactionStatus.WAITING_PAYMENT);
    expect(await PointService.getBalance(ctx.attendee.id)).toBe(0);
  });

  it("reject oleh organizer mengembalikan poin, kupon, dan kursi tepat sekali", async () => {
    const ctx = await checkoutWithRewards();
    await service.uploadPaymentProof(ctx.trx.id, "proof.jpg", ctx.attendee.id);

    const results = await Promise.allSettled([
      service.rejectTransaction(ctx.trx.id, ctx.organizer.id),
      service.rejectTransaction(ctx.trx.id, ctx.organizer.id),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    await expectFullyRestored(ctx);
  });

  it("organizer lain tidak bisa reject", async () => {
    const ctx = await checkoutWithRewards();
    await service.uploadPaymentProof(ctx.trx.id, "proof.jpg", ctx.attendee.id);
    const otherOrganizer = await createUser({ role: "ORGANIZER", referralCode: null });

    await expect(
      service.rejectTransaction(ctx.trx.id, otherOrganizer.id),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("tidak bisa upload bukti untuk transaksi yang sudah lewat waktu", async () => {
    const ctx = await checkoutWithRewards();
    await forceExpire(ctx.trx.id);

    await expect(
      service.uploadPaymentProof(ctx.trx.id, "proof.jpg", ctx.attendee.id),
    ).rejects.toMatchObject({ statusCode: 400 });
    await expectFullyRestored(ctx);
  });
});
