import { PointSource, PointType, Prisma } from "@prisma/client";
import { prisma } from "../../configs/prisma";
import {
  allocateFifo,
  getPointExpiry,
  REFERRAL_REWARD_POINTS,
} from "./point.utils";

type Tx = Prisma.TransactionClient;

export class PointService {
  static async grantReferralReward(
    tx: Tx,
    referrerId: number,
    referredName: string,
    now: Date,
  ) {
    const expiredAt = getPointExpiry(now);

    await tx.pointBatch.create({
      data: {
        userId: referrerId,
        source: PointSource.REFERRAL,
        amount: REFERRAL_REWARD_POINTS,
        remaining: REFERRAL_REWARD_POINTS,
        earnedAt: now,
        expiredAt,
      },
    });

    await tx.pointHistory.create({
      data: {
        userId: referrerId,
        point: REFERRAL_REWARD_POINTS,
        type: PointType.EARN,
        description: `Referral reward from ${referredName} registration`,
        expiredAt,
      },
    });
  }

  static async lockActiveBatches(tx: Tx, userId: number, now: Date) {
    const rows = await tx.$queryRaw<
      { id: number; remaining: number; expired_at: Date }[]
    >`
      SELECT id, remaining, expired_at
      FROM point_batches
      WHERE user_id = ${userId} AND remaining > 0 AND expired_at > ${now}
      ORDER BY expired_at ASC, id ASC
      FOR UPDATE`;

    return rows.map((row) => ({
      id: row.id,
      remaining: row.remaining,
      expiredAt: row.expired_at,
    }));
  }

  static async redeemFifo(
    tx: Tx,
    userId: number,
    transactionId: number,
    amount: number,
    now: Date,
  ) {
    if (amount === 0) return;

    const batches = await PointService.lockActiveBatches(tx, userId, now);
    const allocations = allocateFifo(batches, amount);

    for (const allocation of allocations) {
      await tx.pointBatch.update({
        where: { id: allocation.batchId },
        data: { remaining: { decrement: allocation.amount } },
      });
      await tx.pointRedemption.create({
        data: {
          transactionId,
          batchId: allocation.batchId,
          amount: allocation.amount,
        },
      });
    }

    await tx.pointHistory.create({
      data: {
        userId,
        point: -amount,
        type: PointType.REDEEM,
        description: `Points used on transaction #${transactionId}`,
      },
    });
  }

  static async refund(tx: Tx, transactionId: number, now: Date) {
    const redemptions = await tx.pointRedemption.findMany({
      where: { transactionId, refundedAt: null },
      include: { batch: { select: { userId: true } } },
    });

    if (redemptions.length === 0) return 0;

    let total = 0;
    for (const redemption of redemptions) {
      await tx.pointBatch.update({
        where: { id: redemption.batchId },
        data: { remaining: { increment: redemption.amount } },
      });
      await tx.pointRedemption.update({
        where: { id: redemption.id },
        data: { refundedAt: now },
      });
      total += redemption.amount;
    }

    await tx.pointHistory.create({
      data: {
        userId: redemptions[0].batch.userId,
        point: total,
        type: PointType.EARN,
        description: `Points refunded from transaction #${transactionId}`,
      },
    });

    return total;
  }

  static async getBalance(
    userId: number,
    now = new Date(),
    client: Tx | typeof prisma = prisma,
  ) {
    const result = await client.pointBatch.aggregate({
      where: { userId, expiredAt: { gt: now } },
      _sum: { remaining: true },
    });
    return result._sum.remaining ?? 0;
  }
}
