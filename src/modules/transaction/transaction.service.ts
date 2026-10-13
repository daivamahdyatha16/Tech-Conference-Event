import { addHours } from "date-fns";
import { ConferenceStatus, Prisma, TransactionStatus } from "@prisma/client";

import { TransactionRepository } from "./transaction.repository";
import { TicketTypeRepository } from "../ticket/ticket-type.repository";
import { ConferenceRepository } from "../conference/conference.repository";

import { CreateTransactionDTO } from "./transaction.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../configs/prisma";
import { PointService } from "../point/point.service";
import {
  calculateFinalPrice,
  DiscountRule,
  InsufficientPointsError,
  InvalidPointAmountError,
} from "../point/point.utils";

export class TransactionService {
  private transactionRepository = new TransactionRepository();
  private ticketTypeRepository = new TicketTypeRepository();
  private conferenceRepository = new ConferenceRepository();

  async create(data: CreateTransactionDTO & { userId: number }) {
    const { ticketTypeId, quantity, userId, couponId } = data;
    const requestedPoints = data.pointUsed ?? 0;

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

    return prisma.$transaction(async (tx) => {
      const now = new Date();

      const seatUpdate = await tx.ticketType.updateMany({
        where: { id: ticketType.id, availableSeat: { gte: quantity } },
        data: { availableSeat: { decrement: quantity } },
      });

      if (seatUpdate.count === 0) {
        throw new AppError("Not enough seats available", 400);
      }

      const promotion = await tx.promotion.findFirst({
        where: {
          conferenceId: conference.id,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      let promotionRule: DiscountRule = null;
      let appliedPromotionId: number | null = null;
      if (promotion) {
        const promotionClaim = await tx.promotion.updateMany({
          where: {
            id: promotion.id,
            ...(promotion.quota !== null && {
              usageCount: { lt: promotion.quota },
            }),
          },
          data: { usageCount: { increment: 1 } },
        });

        if (promotionClaim.count > 0) {
          appliedPromotionId = promotion.id;
          promotionRule = {
            type: promotion.discountType,
            value: promotion.discountValue,
          };
        }
      }

      let couponRule: DiscountRule = null;
      if (couponId) {
        const coupon = await tx.coupon.findFirst({
          where: { id: couponId, userId },
        });

        const couponClaim = await tx.coupon.updateMany({
          where: {
            id: couponId,
            userId,
            isUsed: false,
            expiredAt: { gt: now },
          },
          data: { isUsed: true, usedAt: now },
        });

        if (!coupon || couponClaim.count === 0) {
          throw new AppError("The coupon is invalid or has expired", 400);
        }

        couponRule = {
          type: coupon.discountType,
          value: coupon.discountValue,
        };
      }

      const availablePoints =
        requestedPoints > 0
          ? (await PointService.lockActiveBatches(tx, userId, now)).reduce(
              (sum, batch) => sum + batch.remaining,
              0,
            )
          : 0;

      let pricing: ReturnType<typeof calculateFinalPrice>;
      try {
        pricing = calculateFinalPrice({
          subtotal,
          promotion: promotionRule,
          coupon: couponRule,
          requestedPoints,
          availablePoints,
        });
      } catch (error) {
        if (
          error instanceof InsufficientPointsError ||
          error instanceof InvalidPointAmountError
        ) {
          throw new AppError(error.message, 400);
        }
        throw error;
      }

      const newTransaction = await tx.transaction.create({
        data: {
          quantity,
          subtotal,
          discount: pricing.promotionDiscount + pricing.couponDiscount,
          pointUsed: pricing.pointUsed,
          totalPrice: pricing.totalPrice,
          expiresAt,
          status:
            pricing.totalPrice === 0
              ? TransactionStatus.APPROVED
              : TransactionStatus.WAITING_PAYMENT,
          user: { connect: { id: userId } },
          conference: { connect: { id: conference.id } },
          ticketType: { connect: { id: ticketType.id } },
          ...(couponId && { coupon: { connect: { id: couponId } } }),
          ...(appliedPromotionId && {
            promotion: { connect: { id: appliedPromotionId } },
          }),
        },
      });

      await PointService.redeemFifo(
        tx,
        userId,
        newTransaction.id,
        pricing.pointUsed,
        now,
      );

      return newTransaction;
    });
  }

  private async releaseResources(
    tx: Prisma.TransactionClient,
    transaction: {
      id: number;
      userId: number;
      ticketTypeId: number;
      quantity: number;
      couponId: number | null;
      promotionId: number | null;
      pointUsed: number;
    },
    now: Date,
  ) {
    await tx.ticketType.update({
      where: { id: transaction.ticketTypeId },
      data: { availableSeat: { increment: transaction.quantity } },
    });

    const refunded = await PointService.refund(tx, transaction.id, now);
    if (refunded === 0 && transaction.pointUsed > 0) {
      await PointService.refundLegacy(
        tx,
        transaction.userId,
        transaction.id,
        transaction.pointUsed,
        now,
      );
    }

    if (transaction.couponId) {
      await tx.coupon.update({
        where: { id: transaction.couponId },
        data: { isUsed: false, usedAt: null },
      });
    }

    if (transaction.promotionId) {
      await tx.promotion.updateMany({
        where: { id: transaction.promotionId, usageCount: { gt: 0 } },
        data: { usageCount: { decrement: 1 } },
      });
    }
  }

  async expireTransactionIfDue(transactionId: number) {
    return prisma.$transaction(async (tx) => {
      const now = new Date();

      const { count } = await tx.transaction.updateMany({
        where: {
          id: transactionId,
          status: TransactionStatus.WAITING_PAYMENT,
          expiresAt: { lt: now },
        },
        data: { status: TransactionStatus.CANCELLED },
      });

      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (count === 0 || !transaction) {
        return transaction;
      }

      await this.releaseResources(tx, transaction, now);

      return transaction;
    });
  }

  async expireAllDueTransactions() {
    const dueTransactions = await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.WAITING_PAYMENT,
        expiresAt: { lt: new Date() },
      },
      select: { id: true },
    });

    for (const { id } of dueTransactions) {
      await this.expireTransactionIfDue(id);
    }

    return dueTransactions.length;
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

    const { count } = await prisma.transaction.updateMany({
      where: {
        id: transactionId,
        userId,
        status: TransactionStatus.WAITING_PAYMENT,
        expiresAt: { gte: new Date() },
      },
      data: {
        paymentProof,
        paymentDate: new Date(),
        status: TransactionStatus.WAITING_CONFIRMATION,
      },
    });

    if (count === 0) {
      throw new AppError(
        "This transaction cannot upload a payment proof",
        400,
      );
    }

    return prisma.transaction.findUnique({ where: { id: transactionId } });
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
      const now = new Date();

      const { count } = await tx.transaction.updateMany({
        where: {
          id: transactionId,
          status: TransactionStatus.WAITING_CONFIRMATION,
        },
        data: { status: TransactionStatus.REJECTED },
      });

      if (count === 0) {
        throw new AppError("This transaction cannot be rejected", 400);
      }

      await this.releaseResources(tx, transaction, now);

      return tx.transaction.findUniqueOrThrow({ where: { id: transactionId } });
    });
  }
}