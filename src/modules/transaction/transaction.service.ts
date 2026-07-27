import { addHours } from "date-fns";
import { ConferenceStatus } from "@prisma/client";

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

  async create(data: CreateTransactionDTO) {
    const { ticketTypeId, quantity } = data;

    const userId = 1;

    const ticketType = await this.ticketTypeRepository.findById(ticketTypeId);

    if (!ticketType) {
      throw new NotFoundError("Jenis tiket tidak ditemukan");
    }

    if (ticketType.availableSeat < quantity) {
    throw new AppError("Kursi tidak mencukupi", 400);
    }

    const conference = await this.conferenceRepository.findById(
      ticketType.conferenceId
    );

    if (!conference) {
      throw new NotFoundError("Conference tidak ditemukan");
    }

    if (conference.status !== ConferenceStatus.PUBLISHED) {
      throw new AppError("Conference belum dipublish", 400);
    }

    if (ticketType.availableSeat < quantity) {
      throw new AppError("Kursi tidak mencukupi", 400);
    }

    const subtotal = ticketType.price * quantity;
    const expiresAt = addHours(new Date(), 2);

    const transaction = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          quantity,
          subtotal,
          discount: 0,
          pointUsed: 0,
          totalPrice: subtotal,
          expiresAt,
          status: "WAITING_PAYMENT",

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
        },
      });

      await tx.ticketType.update({
        where: {
          id: ticketType.id,
        },
        data: {
          availableSeat: ticketType.availableSeat - quantity,
        },
      });

      return newTransaction;
    });

    return transaction;
  }
}