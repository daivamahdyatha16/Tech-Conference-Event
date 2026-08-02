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
      throw new NotFoundError("Jenis tiket tidak ditemukan");
    }

    if (ticketType.availableSeat < quantity) {
      throw new AppError("Kursi tidak mencukupi", 400);
    }

    const conference = await this.conferenceRepository.findById(
      ticketType.conferenceId,
    );

    if (!conference) {
      throw new NotFoundError("Conference tidak ditemukan");
    }

    if (conference.status !== ConferenceStatus.PUBLISHED) {
      throw new AppError("Conference belum dipublish", 400);
    }

    const subtotal = ticketType.price * quantity;
    const expiresAt = addHours(new Date(), 2);

    const transaction = await prisma.$transaction(async (tx) => {
      let discountAmount = 0;
      let actualPointUsed = 0;

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
          throw new AppError("Kupon tidak valid atau sudah kadaluarsa", 400);
        }

        if (coupon.discountType === DiscountType.PERCENTAGE) {
          discountAmount = (subtotal * coupon.discountValue) / 100;
        } else {
          discountAmount = coupon.discountValue;
        }

        await tx.coupon.update({
          where: { id: coupon.id },
          data: { isUsed: true },
        });
      }

      const remainingPriceAfterCoupon = Math.max(0, subtotal - discountAmount);

      if (pointUsed && pointUsed > 0) {
        const userPoints = await tx.pointHistory.aggregate({
          where: {
            userId,
            expiredAt: { gte: new Date() },
          },
          _sum: { point: true },
        });

        const totalAvailablePoints = userPoints._sum.point || 0;

        if (pointUsed > totalAvailablePoints) {
          throw new AppError("Jumlah poin kamu tidak mencukupi", 400);
        }

        actualPointUsed = Math.min(pointUsed, remainingPriceAfterCoupon);

        await tx.pointHistory.create({
          data: {
            userId,
            point: -actualPointUsed,
            type: PointType.REDEEM,
            description: `Penggunaan poin pada transaksi tiket`,
            expiredAt: new Date(),
          },
        });
      }

      const totalPrice = Math.max(0, remainingPriceAfterCoupon - actualPointUsed);

      const newTransaction = await tx.transaction.create({
        data: {
          quantity,
          subtotal,
          discount: discountAmount,
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

  async uploadPaymentProof(transactionId: number, paymentProof: string) {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundError("Transaksi tidak ditemukan");
    }

    if (transaction.status !== TransactionStatus.WAITING_PAYMENT) {
      throw new AppError(
        "Transaksi tidak dapat mengunggah bukti pembayaran",
        400,
      );
    }

    return await this.transactionRepository.update(transactionId, {
      paymentProof,
      paymentDate: new Date(),
      status: TransactionStatus.WAITING_CONFIRMATION,
    });
  }

  async approveTransaction(transactionId: number, approvedBy: number) {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundError("Transaksi tidak ditemukan");
    }

    if (transaction.status !== TransactionStatus.WAITING_CONFIRMATION) {
      throw new AppError("Transaksi tidak dapat disetujui", 400);
    }

    return await this.transactionRepository.update(transactionId, {
      status: TransactionStatus.APPROVED,
    });
  }

  async rejectTransaction(transactionId: number, approvedBy: number) {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundError("Transaksi tidak ditemukan");
    }

    if (transaction.status !== TransactionStatus.WAITING_CONFIRMATION) {
      throw new AppError("Transaksi tidak dapat ditolak", 400);
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
          approvedBy,
        },
      });
    });
  }
}