import { addHours } from "date-fns";
import {
  ConferenceStatus,
  TransactionStatus,
  PointType,
  DiscountType,
} from "@prisma/client";

import { TransactionRepository } from "./transaction.repository";
import { TicketTypeRepository } from "../ticket/ticket-type.repository";
import { ConferenceRepository } from "../conference/conference.repository";

import { CreateTransactionDTO } from "./transaction.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../configs/prisma";

export class TransactionService {
  private transactionRepository = new TransactionRepository();
  private ticketTypeRepository = new TicketTypeRepository();
  private conferenceRepository = new ConferenceRepository();

  async create(data: CreateTransactionDTO & { userId: number }) {
    const { ticketTypeId, quantity, userId, couponId, pointUsed } = data;

    const ticketType = await this.ticketTypeRepository.findById(ticketTypeId);

    if (!ticketType) {
      throw new NotFoundError("Ticket type not found");
    }

    if (ticketType.availableSeat < quantity) {
      throw new AppError("Not enough seats available", 400);
    }

    const conference = await this.conferenceRepository.findById(
      ticketType.conferenceId,
    );

    if (!conference) {
      throw new NotFoundError("Conference not found");
    }

    if (conference.status !== ConferenceStatus.PUBLISHED) {
      throw new AppError("Conference is not published yet", 400);
    }

    const subtotal = ticketType.price * quantity;
    const expiresAt = addHours(new Date(), 2);

    const transaction = await prisma.$transaction(async (tx) => {
      let promotionDiscount = 0;
      let couponDiscount = 0;
      let actualPointUsed = 0;

      const now = new Date();

      // A conference can only have one promotion (business rule), so there's
      // no selection logic needed - the promo is applied automatically, with
      // no code, since it isn't tied to a specific attendee, unlike a referral coupon.
      const promotion = await tx.promotion.findFirst({
        where: {
          conferenceId: conference.id,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      const promotionEligible =
        promotion &&
        (promotion.quota === null || promotion.usageCount < promotion.quota);

      if (promotion && promotionEligible) {
        if (promotion.discountType === DiscountType.PERCENTAGE) {
          promotionDiscount = (subtotal * promotion.discountValue) / 100;
        } else {
          promotionDiscount = promotion.discountValue;
        }

        await tx.promotion.update({
          where: { id: promotion.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      const remainingAfterPromotion = Math.max(0, subtotal - promotionDiscount);

      if (couponId) {
        const coupon = await tx.coupon.findFirst({
          where: {
            id: couponId,
            userId,
            isUsed: false,
            expiredAt: { gte: new Date() },
          },
        });

        if (!coupon) {
          throw new AppError("The coupon is invalid or has expired", 400);
        }

        if (coupon.discountType === DiscountType.PERCENTAGE) {
          couponDiscount = (remainingAfterPromotion * coupon.discountValue) / 100;
        } else {
          couponDiscount = coupon.discountValue;
        }

        await tx.coupon.update({
          where: { id: coupon.id },
          data: { isUsed: true },
        });
      }

      const remainingPriceAfterCoupon = Math.max(
        0,
        remainingAfterPromotion - couponDiscount,
      );

      if (pointUsed && pointUsed > 0) {
        const userPoints = await tx.pointHistory.aggregate({
          where: {
            userId,
            OR: [{ expiredAt: null }, { expiredAt: { gte: new Date() } }],
          },
          _sum: { point: true },
        });

        const totalAvailablePoints = userPoints._sum.point || 0;

        if (pointUsed > totalAvailablePoints) {
          throw new AppError("You do not have enough points", 400);
        }

        actualPointUsed = Math.min(pointUsed, remainingPriceAfterCoupon);

        // A REDEEM row is a permanent balance deduction, not an earnable
        // point that can expire - expiredAt is left null so it still counts
        // toward the balance query at any time, not just when this row is created.
        await tx.pointHistory.create({
          data: {
            userId,
            point: -actualPointUsed,
            type: PointType.REDEEM,
            description: `Points used on ticket transaction`,
            expiredAt: null,
          },
        });
      }

      const totalPrice = Math.max(0, remainingPriceAfterCoupon - actualPointUsed);

      const newTransaction = await tx.transaction.create({
        data: {
          quantity,
          subtotal,
          discount: promotionDiscount + couponDiscount,
          pointUsed: actualPointUsed,
          totalPrice,
          expiresAt,
          status: TransactionStatus.WAITING_PAYMENT,

          user: {
            connect: {
              id: userId,
            },
          },

          conference: {
            connect: {
              id: conference.id,
            },
          },

          ticketType: {
            connect: {
              id: ticketType.id,
            },
          },

          ...(couponId && {
            coupon: {
              connect: { id: couponId },
            },
          }),
        },
      });


      await tx.ticketType.update({
        where: {
          id: ticketType.id,
        },
        data: {
          availableSeat: {
            decrement: quantity,
          },
        },
      });

      return newTransaction;
    });

    return transaction;
  }

  // There is no EXPIRED status in the schema - a WAITING_PAYMENT transaction
  // past its expiresAt is set to CANCELLED (the frontend displays it as
  // "Expired"). Checked lazily (on read), not via a cron/background job.
  async expireTransactionIfDue(transactionId: number) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (
        !transaction ||
        transaction.status !== TransactionStatus.WAITING_PAYMENT ||
        transaction.expiresAt >= new Date()
      ) {
        return transaction;
      }

      await tx.ticketType.update({
        where: { id: transaction.ticketTypeId },
        data: { availableSeat: { increment: transaction.quantity } },
      });

      return tx.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.CANCELLED },
      });
    });
  }

  async findMyTransactions(userId: number) {
    const dueTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: TransactionStatus.WAITING_PAYMENT,
        expiresAt: { lt: new Date() },
      },
      select: { id: true },
    });

    for (const { id } of dueTransactions) {
      await this.expireTransactionIfDue(id);
    }

    return this.transactionRepository.findByUserId(userId);
  }

  async uploadPaymentProof(
    transactionId: number,
    paymentProof: string,
    userId: number,
  ) {
    await this.expireTransactionIfDue(transactionId);

    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    if (transaction.userId !== userId) {
      throw new AppError(
        "You do not have access to this transaction",
        403,
      );
    }

    if (transaction.status !== TransactionStatus.WAITING_PAYMENT) {
      throw new AppError(
        "This transaction cannot upload a payment proof",
        400,
      );
    }

    return await this.transactionRepository.update(transactionId, {
      paymentProof,
      paymentDate: new Date(),
      status: TransactionStatus.WAITING_CONFIRMATION,
    });
  }

  async approveTransaction(transactionId: number, organizerId: number) {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    if (transaction.conference.organizerId !== organizerId) {
      throw new AppError(
        "You do not have permission to approve this transaction",
        403,
      );
    }

    if (transaction.status !== TransactionStatus.WAITING_CONFIRMATION) {
      throw new AppError("This transaction cannot be approved", 400);
    }

    return await this.transactionRepository.update(transactionId, {
      status: TransactionStatus.APPROVED,
    });
  }

  async rejectTransaction(transactionId: number, organizerId: number) {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    if (transaction.conference.organizerId !== organizerId) {
      throw new AppError(
        "You do not have permission to reject this transaction",
        403,
      );
    }

    if (transaction.status !== TransactionStatus.WAITING_CONFIRMATION) {
      throw new AppError("This transaction cannot be rejected", 400);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.ticketType.update({
        where: {
          id: transaction.ticketTypeId,
        },
        data: {
          availableSeat: {
            increment: transaction.quantity,
          },
        },
      });

      return await tx.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          status: TransactionStatus.REJECTED,
        },
      });
    });
  }
}